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
  const { data = { nextPageToken: null, events: {} } } = useSWR("/api/events");

  let events: { [key: string]: IEvent[] } = {};
  for (const key in data.events) {
    if (data.events[key]) {
      const recurringEventIds: string = data.events[key].map(({ recurringEventId }: IEvent) => recurringEventId);
      events[key] = data.events[key]
        .filter(({ id }: IEvent) => {
          return !recurringEventIds.includes(id);
        })
        .map(({ id, start, end, recurringEventId, ...rest }: IEvent) => {
          return {
            ...rest,
            id,
            // @ts-ignore
            start: dayjs(start),
            // @ts-ignore
            end: dayjs(end),
          };
        });
    }
  }

  return {
    events,
  };
}
