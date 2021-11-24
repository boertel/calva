import useSWR from "swr";
import dayjs from "@/dayjs";
import { rrulestr } from "rrule";

interface Attendee {
  email: string;
}

export interface IEvent {
  id: string;
  summary: string;
  conference?: {
    type: ConferenceService;
    url?: string;
  };
  isOff?: boolean;
  isRecurringEvent?: boolean;
  recurrence?: string[];
  attendees: Attendee[];
  isAllDay?: boolean;
  start?: typeof dayjs;
  end?: typeof dayjs;
}

export enum ConferenceService {
  Zoom = "zoom",
  GoogleMeet = "meet",
  MicrosoftTeams = "teams",
  Headroom = "headroom",
}

export function useEvents() {
  const { data = { nextPageToken: null, events: [] }, ...rest } = useSWR("/api/events");

  let events = new Map();
  data.events.forEach((event: any) => {
    if (event.recurrence) {
      const dtstart = `DTSTART:${dayjs(`${dayjs(event.start.date).format("YYYY-MM-DD")}T${event.start.time}:00`).format(
        "YYYYMMDD[T]HHmm00[Z]"
      )}`;
      const rule = rrulestr([dtstart].concat(event.recurrence).join("\n"));
      // FIXME infinite load needs to generate more
      rule.between(dayjs().subtract(2, "days").toDate(), dayjs().add(44, "days").toDate()).forEach((date) => {
        // @ts-ignore
        const generatedStart = dayjs.parts({ date: dayjs(date).format("YYYY-MM-DD"), time: event.start.time });
        // @ts-ignore
        const generatedEnd = dayjs.parts({ date: dayjs(date).format("YYYY-MM-DD"), time: event.end.time });
        events = set(events, event, generatedStart, generatedEnd);
      });
    } else if (!event.start.time || !event.start.time) {
      let start = dayjs(event.start.date).startOf("day");
      const end = dayjs(event.end.date).endOf("day");
      const diff = end.diff(start, "day");
      event.isAllDay = true;
      if (diff > 0) {
        for (let i = 1; i < diff; i += 1) {
          events = set(events, event, start.clone().startOf("day"), start.clone().endOf("day"));
          start = start.add(24, "hour");
        }
      } else {
        events = set(events, {
          ...event,
          start,
          end,
        });
      }
    } else {
      // @ts-ignore
      events = set(events, event, dayjs.parts(event.start), dayjs.parts(event.end));
    }
  });

  return {
    events,
  };
}

function set(events: Map<any, any>, event: any, start?: any, end?: any) {
  start = start || event.start;
  end = end || event.end;

  if (!start) {
    return events;
  }
  const key = start.format("YYYY-MM-DD");

  let eventsOfTheDay = events.get(key) || [];
  eventsOfTheDay.push({
    ...event,
    start,
    end,
  });
  events.set(key, eventsOfTheDay);

  return events;
}
