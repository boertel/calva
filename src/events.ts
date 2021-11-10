import useSWR from "swr";
import dayjs from "@/dayjs";
import { rrulestr } from "rrule";

export function useEvents() {
  const { data = { nextPageToken: null, events: [] }, ...rest } =
    useSWR("/api/events");

  const events = new Map();
  data.events.forEach((event) => {
    if (event.recurrence) {
      const rule = rrulestr(event.recurrence.join("\n"));
      const occurences = rule
        .all(function (date, i) {
          return i < 10;
        })
        .forEach((date) => {
          const start = dayjs(event.start);
          const end = dayjs(event.end);
          const generatedStart = dayjs([
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            start.hour(),
            start.minute(),
            start.second(),
          ]);
          const generatedEnd = generatedStart
            .clone()
            .hour(end.hour())
            .minute(end.minute())
            .second(end.second());
          events = set(events, event, generatedStart, generatedEnd);
        });
    } else {
      events = set(events, event);
    }
  });
  console.log(events);

  return {
    events,
  };
}

function set(events, event, start, end) {
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
