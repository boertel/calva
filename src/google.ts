// @ts-nocheck
import type { NextApiRequest } from "next";
import cuid from "cuid";
import { google as googleapis } from "googleapis";
import db from "@/db";
import dayjs from "@/dayjs";
import getUrls from "get-urls";
import { getSession } from "next-auth/react";
import { UnauthorizedError } from "@/errors";

import { rrulestr } from "rrule";

export async function createGoogleFromReq(req: NextApiRequest) {
  const session = await getSession({ req });
  if (!session) {
    throw new UnauthorizedError();
  }
  const userId = session.user.id;
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      accounts: true,
    },
  });

  const googleAccount = user?.accounts?.find(({ provider }: { provider: string }) => provider === "google");
  if (!googleAccount) {
    throw new UnauthorizedError();
  }

  const google = new Google(
    googleAccount.id,
    googleAccount.access_token,
    googleAccount.refresh_token,
    userId,
    googleAccount.id
  );
  return google;
}

class Google {
  token: string;
  userId: string;
  accountId: string;
  calendar: any;

  constructor(id: string, token: string, refresh_token: string, userId: string, accountId: string) {
    this.token = token;
    this.userId = userId;
    this.accountId = accountId;
    const auth = new googleapis.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    auth.on("tokens", async (tokens) => {
      let data = {};
      if (tokens.refresh_token) {
        data.refresh_token = tokens.refresh_token;
      }
      if (tokens.id_token) {
        data.id_token = tokens.id_token;
      }
      if (tokens.expiry_date) {
        data.expires_at = tokens.expiry_date;
      }
      data.access_token = tokens.access_token;
      if (Object.keys(data).length) {
        await db.account.update({
          where: { id },
          data,
        });
      }
    });
    auth.setCredentials({ access_token: token, refresh_token: refresh_token });
    this.calendar = googleapis.calendar({ version: "v3", auth });
    ["events", "calendarList", "calendars", "channels"].forEach((resource) => {
      ["list", "get", "watch", "stop"].forEach((method) => {
        if (this.calendar[resource][method]) {
          this.calendar[resource][method] = this.calendar[resource][method].bind(this.calendar);
        }
      });
    });
  }

  async getNowAndNext({ calendarId = "primary" }) {
    const events = await this.calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      orderBy: "startTime",
      singleEvents: true,
      maxResults: 10,
    });
    const { nextPageToken, items } = events.data;

    return {
      nextPageToken,
      events: items.map(parseEvent),
    };
  }

  async getCalendars() {
    const response = await this.calendar.calendarList.list();
    const { nextPageToken, items } = response.data;
    return {
      nextPageToken,
      calendars: items.map(parseCalendar),
    };
  }

  async getCalendar(calendarId) {
    const response = await this.calendar.calendars.get({ calendarId });
    return parseCalendar(response.data);
  }

  async watchEvents(calendarId: string = "primary", data = {}) {
    const requestBody = {
      id: cuid(),
      type: "web_hook",
      address: `https://calva.ngrok.io/api/calendars/receive`,
      ...data,
    };
    console.log(requestBody);
    const response = await this.calendar.events.watch({ calendarId, requestBody });
    return {
      ...response.data,
      expiration: new Date(parseInt(response.data.expiration, 10)),
    };
  }

  async stopWatchingEvents({ id, resourceId }) {
    const response = await this.calendar.channels.stop({
      requestBody: {
        id,
        resourceId,
      },
    });
    return response.data;
  }

  async getEvents(calendarId = "primary", args = {}) {
    let params = {
      calendarId,
    };
    if (Object.keys(args).length === 0) {
      params = {
        ...params,
        timeMin: dayjs().subtract(1, "day").startOf("day").toISOString(),
        maxResults: 45,
      };
    } else {
      params = { ...params, ...args };
    }

    const response = await this.calendar.events.list({
      ...params,
    });

    const { nextPageToken, items, nextSyncToken } = response.data;
    let events = [];
    items.forEach((item: any) => {
      const { recurrence, start } = item;
      if (start) {
        let event = parseEvent(item);
        if (recurrence) {
          // recurring events
          const recurring = getRRule(recurrence, event.start);
          if (!recurring.options.until || dayjs().isBefore(recurring.options.until)) {
            recurring
              .between(dayjs().subtract(2, "days").toDate(), dayjs().add(44, "days").toDate())
              .forEach((date) => {
                // @ts-ignore
                const generatedStart = dayjs.parts({
                  date: dayjs(date).format("YYYY-MM-DD"),
                  time: event.start.time || "00:00:00",
                });
                // @ts-ignore
                const generatedEnd = dayjs.parts({
                  date: dayjs(date).format("YYYY-MM-DD"),
                  time: event.end.time || "23:59:00",
                });
                events.push({
                  ...event,
                  start: generatedStart,
                  isAllDay: !event.start.time,
                  end: generatedEnd,
                  hint: recurring.toText(),
                });
              });
          }
        } else if (!event.start.time || !event.start.time) {
          // all day event
          let start = dayjs(event.start.date).startOf("day");
          const end = dayjs(event.end.date).endOf("day");
          const diff = end.diff(start, "day") + 1;
          event.isAllDay = true;
          if (diff > 0) {
            for (let i = 1; i < diff; i += 1) {
              events.push({
                ...event,
                start: start.clone().startOf("day"),
                end: start.clone().endOf("day"),
              });
              start = start.add(24, "hour");
            }
          } else {
            events.push({
              ...event,
              start,
              end,
            });
          }
        } else {
          // regular event
          events.push({
            ...event,
            // @ts-ignore
            start: dayjs.parts(event.start),
            // @ts-ignore
            end: dayjs.parts(event.end),
          });
        }
      }
    });

    return {
      nextSyncToken,
      nextPageToken,
      events: events.sort(({ start: a }, { start: z }) => a - z),
    };
  }
}

function getRRule(recurrence, start) {
  const dtstart = `DTSTART:${dayjs(`${dayjs(start.date).format("YYYY-MM-DD")}T${start.time || "00:00"}:00`).format(
    "YYYYMMDD[T]HHmm00[Z]"
  )}`;
  // FIXME deal with EXDATE and rrule.js
  return rrulestr(
    [dtstart]
      .concat(
        recurrence
          .filter((str: string) => !str.startsWith("EXDATE"))
          .map((str) => {
            return str
              .split(";")
              .map((part) => {
                if (part.startsWith("UNTIL=") && !start.time) {
                  const until = dayjs(part, "YYYYMMDD").endOf("day").format("YYYYMMDD[T]HHmm59[Z]");
                  return `UNTIL=${until}`;
                } else {
                  return part;
                }
              })
              .join(";");
          })
      )
      .join("\n")
  );
}

function parseEvent(
  {
    id,
    created,
    updated,
    summary,
    status,
    description,
    location,
    start,
    end,
    recurrence,
    recurringEventId,
    hangoutLink,
    attendees,
    conferenceData,
    ...rest
  },
  index: number
) {
  let urls = [];
  let conference = null;
  if (description) {
    urls = urls.concat(Array.from(getUrls(description)));
  }
  if (location) {
    urls = urls.concat(Array.from(getUrls(location)));
  }
  if (conferenceData?.entryPoints) {
    urls = urls.concat(conferenceData?.entryPoints.map(({ uri }) => uri));
  }
  if (urls.length) {
    conference = {};
    urls.forEach((url) => {
      const { hostname, pathname } = new URL(url);
      if (hostname.endsWith("zoom.us")) {
        conference.type = "zoom";
        if (pathname.startsWith("/j/")) {
          conference.url = url;
        }
      } else if (hostname.endsWith("teams.microsoft.com")) {
        conference.type = "teams";
        if (pathname.startsWith("/l/")) {
          conference.url = url;
        }
      } else if (hostname.endsWith("headroom.com")) {
        conference.type = "headroom";
        if (pathname.startsWith("/meet/")) {
          conference.url = url;
        }
      }
    });
    if (Object.keys(conference).length === 0) {
      conference = null;
    }
  }
  if (hangoutLink) {
    conference = {
      type: "meet",
      url: hangoutLink,
    };
  }

  if (index === 0) {
    //start.dateTime = "2021-11-16T18:15:00-08:00";
    //end.dateTime = "2021-11-16T19:15:00-08:00";
  }

  return {
    id,
    created,
    updated,
    summary,
    status,
    urls,
    conference,
    recurringEventId,
    isRecurringEvent: !!recurrence || !!recurringEventId,
    recurrence: recurrence || null,
    attendees:
      attendees
        ?.filter(({ resource }) => !resource)
        .map(({ email }) => {
          return { email };
        }) || [],
    start: {
      date: dayjs(start.date || start.dateTime).format("YYYY-MM-DD"),
      time: start.dateTime ? dayjs(start.dateTime).format("HH:mm") : null,
      timeZone: start.timeZone || null,
    },
    end: {
      date: dayjs(end.date || end.dateTime).format("YYYY-MM-DD"),
      time: end.dateTime ? dayjs(end.dateTime).format("HH:mm") : null,
      timeZone: end.timeZone || null,
    },
  };
}

function parseCalendar({ id, summary, accessRole }) {
  return {
    id,
    summary,
    accessRole,
  };
}
