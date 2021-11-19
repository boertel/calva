import { Fragment } from "react";
import cn from "classnames";
import { useClock } from "@/hooks";
import { useEvents, IEvent } from "@/events";
import { useAuthStatus, AuthStatus } from "../AuthStatus";

import LoggedOutFooter from "components/LoggedOutFooter";
import Event from "components/Event";
import Day from "components/Day";

import { NowLine } from "@/ui";
import { RecurringIcon } from "@/icons";

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, index) => start + index);
}

export default function Home() {
  const { events } = useEvents();
  // @ts-ignore
  const [authStatus] = useAuthStatus();

  const isAuthenticated = authStatus !== AuthStatus.Unauthenticated;
  return (
    <main className="flex flex-col justify-center">
      <Events events={events} className={cn({ "opacity-30": !isAuthenticated })} />
      {authStatus !== AuthStatus.Authenticated && (
        <LoggedOutFooter className={!isAuthenticated ? "opacity-100" : "opacity-0"} />
      )}
    </main>
  );
}

function Events({ events, className }: { className?: string; events: Map<string, IEvent[]> }) {
  const now = useClock();

  const days = range(0, 12 * 7);

  if (now === null) {
    return null;
  }

  return (
    <ul className={cn("grid grid-cols-events", className)}>
      {days.map((index) => {
        // @ts-ignore
        const current = now.add(index, "days");
        const key = current.format("YYYY-MM-DD");
        // @ts-ignore
        const currentEvents = events.get(key)?.sort(({ start: a }, { start: z }) => a.diff(z)) || [];

        const hasRecurringMeetings = !!currentEvents.find(({ recurrence }) => !!recurrence);

        let inMeetingCurrently = false;

        return (
          <Day
            key={key}
            year={current.year()}
            month={current.month()}
            day={current.date()}
            isOff={!!currentEvents.find(({ isOff }) => isOff)}
          >
            {hasRecurringMeetings && !current.isToday() && <RecurringIcon className="text-purple-500 mr-2" />}
            {currentEvents.map((event: IEvent, index: number) => {
              let isNext =
                current.isToday() &&
                // @ts-ignore
                now.isBetween(
                  index > 0
                    ? currentEvents[index - 1]?.start
                    : // @ts-ignore
                      now.startOf("day"),
                  event.start
                );
              if (event.start && event.end && !inMeetingCurrently) {
                // @ts-ignore
                inMeetingCurrently = event.start.isHappeningNowWith(event.end);
              }

              return (
                <Fragment key={event.id}>
                  <NowLine className={inMeetingCurrently ? "invisible" : isNext ? "visible" : "hidden"} />
                  {(current.isToday() || !event.recurrence) && (
                    <Event isNext={!inMeetingCurrently && isNext} {...event} />
                  )}
                  {current.isToday() &&
                    // @ts-ignore
                    now.isAfter(event.end) &&
                    index === currentEvents.length - 1 && <NowLine />}
                </Fragment>
              );
            })}
          </Day>
        );
      })}
    </ul>
  );
}
