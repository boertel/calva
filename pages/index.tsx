//@ts-nocheck
import { IEvent, useEvents } from "@/events";
import { useClock } from "@/hooks";
import { RecurringIcon } from "@/icons";
import { NowLine } from "@/ui";
import cn from "classnames";
import { OtherEvent, TodayEvent } from "components/Event";
import LoggedOutFooter from "components/LoggedOutFooter";
import OtherDay from "components/OtherDay";
import Today from "components/Today";
import UserMenu from "components/UserMenu";
import { Fragment } from "react";

import { AuthStatus, useAuthStatus } from "../AuthStatus";

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

function Events({ events, className }: { className?: string; events: { [key: string]: IEvent[] } }) {
  const now = useClock();

  const days = range(0, 12 * 7);

  if (now === null) {
    return null;
  }

  return (
    <>
      <ul className={cn("grid grid-cols-events", className)}>
        {days.map((index) => {
          // @ts-ignore
          const current = now.add(index, "days");
          const key = current.format("YYYY-MM-DD");
          // @ts-ignore
          const currentEvents = events[key]?.sort(({ start: a }, { start: z }) => a.diff(z)) || [];

          const hasRecurringMeetings = !!currentEvents.find(
            ({ isRecurringEvent, isAllDay }) => isRecurringEvent && !isAllDay
          );

          let inMeetingCurrently = false;

          const allDays: string[] = currentEvents.filter(({ isAllDay }) => isAllDay).map(({ summary }) => summary);

          const isOff = !!currentEvents.find(({ isOff }) => isOff);
          if (current.isToday()) {
            return (
              <Today key={key} current={current} isOff={isOff}>
                <div className="px-4">
                  {currentEvents
                    .filter(({ isAllDay }) => !isAllDay)
                    .map((event: IEvent, index: number) => {
                      let isNext = now.isBetween(
                        index > 0 ? currentEvents[index - 1]?.start : now.startOf("day"),
                        event.start
                      );
                      if (event.start && event.end && !inMeetingCurrently) {
                        inMeetingCurrently = event.start.isHappeningNowWith(event.end);
                      }

                      return (
                        <Fragment key={event.id}>
                          <NowLine className={inMeetingCurrently ? "invisible" : isNext ? "visible" : "hidden"}>
                            <div>{allDays}</div>
                          </NowLine>
                          <TodayEvent isNext={!inMeetingCurrently && isNext} {...event} />
                          {now.isAfter(event.end) && index === currentEvents.length - 1 && (
                            <NowLine>
                              <div>{allDays}</div>
                            </NowLine>
                          )}
                        </Fragment>
                      );
                    })}
                </div>
              </Today>
            );
          } else {
            return (
              <OtherDay key={key} current={current} isOff={isOff} className="items-center pr-4">
                {hasRecurringMeetings && <RecurringIcon className="text-purple-500 mr-2 flex-shrink-0" />}
                <div className="flex flex-col min-w-0 flex-grow">
                  {currentEvents.map((event: IEvent) => {
                    if (!event.isAllDay) {
                      return <OtherEvent className="mx-4" key={event.id} {...event} />;
                    }
                    return null;
                  })}
                </div>
                <div className="ml-2">{allDays.join(" ")}</div>
              </OtherDay>
            );
          }
        })}
      </ul>
      <UserMenu href="/settings" />
    </>
  );
}
