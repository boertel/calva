import useSWR from "swr";
import dayjs from "@/dayjs";
import { rrulestr } from "rrule";

export interface IEvent {
  id: string;
  summary: string;
  conference?: {
    type: ConferenceService;
    url?: string;
  };
  isOff?: boolean;
  recurrence?: string[];
  isAllDay?: boolean;
  start?: typeof dayjs;
  end?: typeof dayjs;
}

export enum ConferenceService {
  Zoom = "zoom",
  GoogleMeet = "meet",
  MicrosoftTeams = "teams",
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
      rule.between(dayjs().subtract(2, "days").toDate(), dayjs().add(20, "days").toDate()).forEach((date) => {
        const generatedStart = dayjs(`${dayjs(date).format("YYYY-MM-DD")}T${event.start.time}:00`);
        const generatedEnd = dayjs(`${dayjs(date).format("YYYY-MM-DD")}T${event.end.time}:00`);
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
      events = set(
        events,
        event,
        dayjs(`${event.start.date}T${event.start.time}`),
        dayjs(`${event.end.date}T${event.end.time}`)
      );
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
