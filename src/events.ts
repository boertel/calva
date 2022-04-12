import dayjs from "@/dayjs";
import useSWR from "swr";

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
  hint?: string;
  isRecurringEvent: boolean;
  recurringEventId: string;
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
  const { data = { nextPageToken: null, events: [] } } = useSWR("/api/events");

  let events: { [key: string]: IEvent[] } = {};
  let recurringEventIds: { [key: string]: string[] } = {};
  data.events.forEach((event: IEvent & { start: string; end: string }) => {
    const start = event.isAllDay
      ? dayjs.utc(event.start).hour(0).minute(0).second(0).millisecond(0)
      : dayjs(event.start);
    const end = event.isAllDay ? dayjs.utc(event.end).hour(0).minute(0).second(0).millisecond(0) : dayjs(event.end);
    const key = start.format("YYYY-MM-DD");
    if (event.recurringEventId) {
      recurringEventIds[key] = recurringEventIds[key] || [];
      recurringEventIds[key].push(event.recurringEventId);
    }
    events[key] = events[key] || [];

    events[key].push({
      ...event,
      // @ts-ignore
      start,
      // @ts-ignore
      end,
    });
    if (recurringEventIds[key]) {
      events[key] = events[key].filter(({ id }) => !recurringEventIds[key].includes(id));
    }
  });

  return {
    events,
  };
}
