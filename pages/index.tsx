import { Fragment } from "react";
import cn from "classnames";
import { useNow } from "@/hooks";
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
      <Events
        events={events}
        className={cn({ "opacity-30": !isAuthenticated })}
      />
      {authStatus !== AuthStatus.Authenticated && (
        <LoggedOutFooter
          className={!isAuthenticated ? "opacity-100" : undefined}
        />
      )}
    </main>
  );
}

function Events({
  events,
  className,
}: {
  className?: string;
  events: Map<string, IEvent[]>;
}) {
  const now = useNow();

  const days = range(0, 12 * 7);

  return (
    <ul
      style={{
        display: "grid",
        gridTemplateColumns: "max-content minmax(300px, 65ch) max-content",
      }}
      className={className}
    >
      {days.map((index) => {
        // @ts-ignore
        const current = now.add(index, "days");
        const key = current.format("YYYY-MM-DD");
        const currentEvents = events.get(key) || [];

        let inMeetingCurrently = false;

        return (
          <Day
            key={key}
            year={current.year()}
            month={current.month()}
            day={current.date()}
            isOff={!!currentEvents.find(({ isOff }) => isOff)}
          >
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
                inMeetingCurrently = now.isBetween(
                  event.start,
                  event.end,
                  null,
                  "[]"
                );
              }
              return (
                <Fragment key={event.id}>
                  {isNext && !inMeetingCurrently && <NowLine />}
                  {current.isToday() || !event.recurrence ? (
                    <Event isNext={!inMeetingCurrently && isNext} {...event} />
                  ) : (
                    <RecurringIcon className="text-purple-500" size="1em" />
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
