// @ts-nocheck
import type { NextApiRequest } from "next";
import { google as googleapis } from "googleapis";
import Cookies from "cookies";
import db from "@/db";
import dayjs from "@/dayjs";
import getUrls from "get-urls";

import { rrulestr } from "rrule";

export abstract class HttpError extends Error {
  abstract statusCode: number;
  abstract message: string;
}

class UnauthorizedError extends HttpError {
  statusCode: number = 401;
  message: string = "Unauthorized";
}

const sessionCookieName =
  process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token";

export async function createGoogleFromReq(req: NextApiRequest) {
  // @ts-ignore
  const cookies = new Cookies(req);
  const sessionToken = cookies.get(sessionCookieName);
  if (!sessionToken) {
    throw new UnauthorizedError();
  }
  // FIXME `some` is dangerous since it will return other users
  const user = await db.user.findFirst({
    where: {
      sessions: { some: { sessionToken } },
    },
    include: {
      accounts: true,
    },
  });

  const googleAccount = user?.accounts?.find(({ provider }: { provider: string }) => provider === "google");
  if (!googleAccount) {
    throw new UnauthorizedError();
  }

  const google = new Google(googleAccount.id, googleAccount.access_token, googleAccount.refresh_token);
  return google;
}

class Google {
  token: string;
  private calendar: any;

  constructor(id: string, token: string, refresh_token: string) {
    this.token = token;
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
    ["events"].forEach((resource) => {
      ["list"].forEach((method) => {
        this.calendar[resource][method] = this.calendar[resource][method].bind(this.calendar);
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

  async getEvents(calendarId = "primary") {
    const events = await this.calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 25,
    });

    const { nextPageToken, items } = events.data;
    return {
      nextPageToken,
      events: items
        .map(({ recurrence, ...rest }: any) => {
          let recurring = null;
          if (recurrence) {
            // FIXME deal with EXDATE and rrule.js
            recurrence = recurrence.filter((str: string) => !str.startsWith("EXDATE"));
            recurring = rrulestr(recurrence.join("\n"));
          }
          return {
            ...rest,
            recurrence,
            recurring,
          };
        })
        .filter(({ start, recurring }) => {
          if (recurring && recurring?.options?.until) {
            return recurring?.options?.until >= new Date();
          }
          return !!start;
        })
        .map(parseEvent),
    };
  }
}

function parseEvent(
  { id, created, updated, summary, status, description, location, start, end, recurrence, hangoutLink },
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
      }
    });
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
    recurrence: recurrence || null,
    start: {
      date: dayjs(start.date || start.dateTime).format("YYYY-MM-DD"),
      time: start.dateTime ? dayjs(start.dateTime).format("HH:mm") : null,
      timeZone: start.timeZone,
    },
    end: {
      date: dayjs(end.date || end.dateTime).format("YYYY-MM-DD"),
      time: end.dateTime ? dayjs(end.dateTime).format("HH:mm") : null,
      timeZone: end.timeZone,
    },
  };
}
