import useSWR from "swr";
import dayjs from "@/dayjs";
import { rrulestr } from "rrule";

export function useEvents() {
  const { data = { nextPageToken: null, events: [] }, ...rest } =
    useSWR("/api/events");

  let events = new Map();
  data.events.forEach((event) => {
    if (event.recurrence) {
      const rule = rrulestr(event.recurrence.join("\n"));
      rule
        .all(function (date, i) {
          return i < 10;
        })
        .forEach((date) => {
          const start = dayjs(`${event.start.date}T${event.start.time}`);
          const end = dayjs(`${event.end.date}T${event.end.time}`);
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
      let start = dayjs(event.start.date).startOf("day");
      const end = dayjs(event.end.date).endOf("day");
      const diff = end.diff(start, "day");
      event.isAllDay = true;
      if (diff > 0) {
        for (let i = 1; i < diff; i += 1) {
          events = set(
            events,
            event,
            start.clone().startOf("day"),
            start.clone().endOf("day")
          );
          start = start.add(24, "hour");
        }
      } else {
        events = set(events, {
          ...event,
          start,
          end,
        });
      }
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
