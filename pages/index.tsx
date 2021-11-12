// @ts-nocheck
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  useState,
  forwardRef,
  useCallback,
  useRef,
  ReactNode,
  CSSProperties,
  Fragment,
} from "react";
import { useRouter } from "next/router";
import cn from "classnames";
import dayjs from "@/dayjs";
import { useNow } from "@/hooks";
import { useEvents, ConferenceService, IEvent } from "@/events";
// @ts-ignore
import { formatDuration } from "@boertel/duration";
import { useAuthStatus, AuthStatus } from "../AuthStatus";

import {
  GoogleLogo,
  RecurringIcon,
  ZoomIcon,
  GoogleMeetIcon,
  MicrosoftTeamsIcon,
  CheckCircleIcon,
} from "@/icons";

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, index) => start + index);
}

function ConferenceIcon({
  service,
  className,
}: {
  service?: ConferenceService;
  className?: string;
}) {
  switch (service) {
    case ConferenceService.Zoom:
      return <ZoomIcon className={className} />;
    case ConferenceService.GoogleMeet:
      return <GoogleMeetIcon className={className} />;
    case ConferenceService.MicrosoftTeams:
      return <MicrosoftTeamsIcon className={className} />;
    default:
      return null;
  }
}

export default function Home() {
  const { events } = useEvents();
  const [authStatus] = useAuthStatus();
  const isAuthenticated = authStatus !== AuthStatus.Unauthenticated;
  return (
    <main className="flex flex-col justify-center">
      <Events
        events={events}
        className={cn({ "opacity-30": !isAuthenticated })}
      />
      {authStatus !== AuthStatus.Authenticated && (
        <footer
          className={cn(
            "sticky bottom-0 z-20 mx-auto max-w-prose flex flex-col items-center justify-center p-8 space-y-8 pb-16 opacity-0 transition-opacity duration-700",
            {
              "opacity-100": !isAuthenticated,
            }
          )}
        >
          <h1 className="text-9xl font-black text-center">calva</h1>
          <h2 className="text-4xl font-bold text-center pb-10">
            a calendar for the rest of us
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <li className="flex justify-center items-center text-center border-4 p-6 border-purple-500 border-opacity-30 transition-colors hover:border-opacity-100 rounded-xl bg-black bg-opacity-80">
              <h3 className="">Forget the past, focus on the present</h3>
            </li>
            <li className="flex justify-center items-center text-center border-4 p-6 border-purple-500 border-opacity-30 transition-colors hover:border-opacity-100 rounded-xl bg-black bg-opacity-80">
              <h3 className="">One click to join</h3>
            </li>
            <li className="flex justify-center items-center text-center border-4 p-6 border-purple-500 border-opacity-30 transition-colors hover:border-opacity-100 rounded-xl bg-black bg-opacity-80">
              <h3 className="">Quick overview of what is coming next</h3>
            </li>
          </ul>
          <LoginButton />
        </footer>
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
                    index === currentEvents.length - 1 && (
                      <>
                        <NowLine />
                        <button className="mt-20 border-2 border-green-500 bg-green-500 hover:text-green-500 bg-opacity-0 hover:bg-opacity-20 rounded-md p-4 flex items-center justify-center gap-2">
                          <CheckCircleIcon size="1em" />
                          <div className="text-white">Done for the day!</div>
                        </button>
                      </>
                    )}
                </Fragment>
              );
            })}
          </Day>
        );
      })}
    </ul>
  );
}

function Dot() {
  return (
    <div className="w-3 h-3 border-2 border-purple-500 rounded-full bg-purple-500 bg-opacity-0 hover:bg-opacity-60" />
  );
}

function Event({
  end,
  start,
  summary,
  conference,
  recurrence,
  isAllDay,
  isNext = false,
  style,
}: IEvent & { style?: CSSProperties; isNext?: boolean }) {
  const now = useNow();
  /**
   * Now:                 now.isBetween(start, end, null, '[]')
   *                                   v
   * Time ----------*-------------[----*----]------------*---------
   *                ^           start      end           ^
   * isFuture: now.isBefore(start)                       |
   * isPast:                                      now.isAfter(end)
   *
   */
  // @ts-ignore
  const isNow = now.isBetween(start, end, null, "[]");
  // @ts-ignore
  const isPast = now.isAfter(end);
  // @ts-ignore
  const isFuture = now.isBefore(start);

  // @ts-ignore
  const isToday = start ? start.isToday() : false;

  const { query } = useRouter();

  const AsComponent = conference?.url ? Link : "div";
  return (
    <AsComponent href={conference?.url} target="_blank" rel="noopener">
      <a
        className={
          isToday
            ? cn(
                "cursor-pointer mx-4 rounded-lg p-4 flex flex-col my-4 bg-opacity-0 transition-opacity hover:bg-opacity-20 space-y-2",
                {
                  "opacity-30 border border-purple-500": isPast,
                  "border-2 border-red-500 bg-red-500": isNow,
                  "border border-dashed border-purple-500 bg-purple-500":
                    isFuture,
                }
              )
            : "flex flex-row gap-2"
        }
        style={style}
      >
        {start && end && (
          <h4 className="flex justify-between items-center">
            {!isAllDay && (
              <div className="text-gray-500 flex items-center gap-2">
                {/* @ts-ignore */}
                {start.format(
                  query.format === "24h" ? "HH:mm" : "hh:mma"
                )} - {/* @ts-ignore */}
                {end.format(query.format === "24h" ? "HH:mm" : "hh:mma")}
                {!!recurrence && <RecurringIcon size="1em" />}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isNext && (
                <div className="bg-rose-500 rounded-full px-2 text-sm text-black">
                  in {/* @ts-ignore */}
                  {formatDuration(start.diff(now, "seconds"), {
                    format: (value: number, key: string) =>
                      ["minute", "hour"].includes(key)
                        ? `${value} ${value === 1 ? key : `${key}s`}`
                        : "",
                    ignoreZero: true,
                  })}
                </div>
              )}
              {!!conference && isToday && (
                <ConferenceIcon
                  className={cn("filter", { grayscale: !isNow })}
                  service={conference.type}
                />
              )}
            </div>
          </h4>
        )}
        <div className="flex items-center justify-between">
          <h4>{summary}</h4>
        </div>
      </a>
    </AsComponent>
  );
}

interface DayProps {
  year: number;
  month: number;
  day: number;
  isOff?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Day({ year, month, day, isOff = false, children }: DayProps) {
  const current = dayjs([year, month, day]);
  if (current.isToday()) {
    return (
      <Today year={year} month={month} day={day} isOff={isOff}>
        <div className="flex flex-col flex-grow">{children}</div>
      </Today>
    );
  } else {
    return (
      <OtherDay year={year} month={month} day={day} isOff={isOff}>
        <div className="flex flex-col gap-2">{children}</div>
      </OtherDay>
    );
  }
}

const Pill = forwardRef(
  (
    {
      children,
      className,
      onClick,
      style = {},
    }: {
      children: ReactNode;
      className?: string;
      onClick: (evt: React.SyntheticEvent) => void;
      style?: CSSProperties;
    },
    ref
  ) => {
    return (
      <button
        onClick={onClick}
        className={cn(
          "z-20 sticky overflow-hidden transform flex justify-center w-full flex-grow",
          className
        )}
        ref={ref}
        style={{
          gridColumn: 2,
          ...style,
        }}
      >
        <div
          className={cn("bg-purple-500 text-white px-3 py-2 rounded-xl w-max")}
        >
          {children}
        </div>
      </button>
    );
  }
);

enum LeftFrom {
  Top = "top",
  Bottom = "bottom",
}

function Today({ year, month, day, children }: DayProps) {
  const [elementLeftFrom, setElementLeftFrom] = useState<
    LeftFrom | undefined
  >();
  const ref = useRef<HTMLLIElement>();
  const observer = useRef<IntersectionObserver>();

  const onObserve = useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) {
        if (entry.boundingClientRect.top < 0) {
          setElementLeftFrom(LeftFrom.Top);
        } else {
          setElementLeftFrom(LeftFrom.Bottom);
        }
      } else {
        setElementLeftFrom(undefined);
      }
    },
    [setElementLeftFrom]
  );

  const focusOnLoad = useCallback(
    (node: HTMLLIElement) => {
      if (node) {
        observer.current = new IntersectionObserver(onObserve);
        ref.current = node;
        observer.current.observe(ref.current);
        node.scrollIntoView();
        node.focus();
      }
    },
    [onObserve]
  );

  return (
    <>
      <Pill
        onClick={() => {
          if (ref.current) {
            ref.current.focus();
            ref.current.scrollIntoView();
          }
        }}
        className={cn({
          "translate-y-[-40px] max-h-0 top-0 pointer-events-none":
            elementLeftFrom === undefined,
          "translate-y-4 max-h-[40px] top-0 pointer-events-auto":
            elementLeftFrom === LeftFrom.Top,
          "translate-y-[-1rem] h-auto bottom-0 pointer-events-auto":
            elementLeftFrom === LeftFrom.Bottom,
        })}
        style={{
          transition:
            "transform 150ms cubic-bezier(0.4, 0, 0.2, 1), max-height 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        Back to today
      </Pill>
      <OtherDay
        className="flex-col"
        year={year}
        month={month}
        day={day}
        ref={focusOnLoad}
      >
        <div className="relative h-full my-6 flex flex-col justify-between">
          {children}
        </div>
      </OtherDay>
      <Annotation
        style={{ gridColumn: 3 }}
        className="text-purple-500 justify-start text-opacity-40"
      >
        Today
      </Annotation>
    </>
  );
}

function NowLine({ style }: { style?: CSSProperties }) {
  const { query } = useRouter();
  return (
    <>
      <div
        className={cn(
          "w-full flex items-center text-red-500 pr-4 transition-opacity group text-opacity-40 hover:text-opacity-100"
        )}
        style={style}
      >
        <div
          id="now"
          className="relative bg-red-500 bg-opacity-60 group-hover:bg-opacity-100 w-full h-[2px]"
        />
        <div className="pl-2">
          {dayjs().format(query.format === "24h" ? "HH:mm" : "hh:mma")}
        </div>
      </div>
      <style jsx>{`
        #now::before {
          content: " ";
          position: absolute;
          top: -5px;
          left: 0;
          border: 2px solid currentColor;
          width: 12px;
          background-color: #000;
          height: 12px;
          border-radius: 100%;
        }
      `}</style>
    </>
  );
}

const OtherDay = forwardRef(
  (
    { year, month, day, className, isOff, children, style = {} }: DayProps,
    ref
  ) => {
    const current = dayjs([year, month, day]);

    const isToday = current.isToday();
    const isTomorrow = current.isTomorrow();
    // @ts-ignore
    const isWeekend = current.isWeekend();
    // @ts-ignore
    const isThisWeek = current.isThisWeek();

    const isPast = current.isBefore(dayjs().startOf("day"));

    return (
      <>
        {(current.date() === 1 || current.isToday()) && (
          <Annotation
            style={{ gridColumn: 1 }}
            className={cn("justify-end", {
              "text-purple-500": current.isThisMonth(),
            })}
          >
            {current.format("MMM")}
          </Annotation>
        )}
        <li
          style={{ gridColumn: 2, ...style }}
          className={cn(
            "relative flex no-underline border-gray-800 bg-transparent transition-colors rounded-none group",
            current.date() === 1 ? "border-t-4 border-gray-600" : "border-t",
            !isToday
              ? {
                  "py-4 items-center": !isToday,
                  "opacity-30": isPast,
                }
              : {
                  "min-h-[60vh] border-none": isToday,
                },
            className
          )}
          ref={ref}
        >
          <h3
            className={cn(
              "self-start backdrop-blur sticky top-0 flex items-start z-10 px-4 w-full",
              {
                "text-4xl font-black text-purple-500 space-x-2 pt-2": isToday,
                "w-20 justify-between": !isToday,
                "text-white text-opacity-20 group-hover:text-opacity-100":
                  isWeekend || isOff,
              }
            )}
          >
            <div>{current.format(isToday ? "dddd" : "dd")}</div>
            <div>{current.format("D")}</div>
          </h3>
          {children}
        </li>
        {isTomorrow && (
          <Annotation
            style={{ gridColumn: 3 }}
            className="justify-start text-white text-opacity-40"
          >
            Tomorrow
          </Annotation>
        )}
        {current.month() === 0 && current.date() === 1 && (
          <Annotation
            style={{ gridColumn: 3 }}
            className="justify-start text-white text-opacity-40"
          >
            {current.format("YYYY")}
          </Annotation>
        )}
      </>
    );
  }
);

function Annotation({
  children,
  className,
  style = {},
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "sticky top-0 flex items-start text-4xl px-6 py-2 font-black bg-black",
        className
      )}
    >
      {children}
    </li>
  );
}

function LoginButton() {
  return (
    <>
      <button
        onClick={() => signIn("google")}
        className="bg-white relative flex text-black justify-center items-center px-6 py-2 rounded-md space-x-2 hover:bg-white"
      >
        <GoogleLogo className="text-4xl" />
        <span>Login with Google</span>
      </button>
      <style jsx>{`
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.015);
          }
        }

        button:before {
          content: " ";
          position: absolute;
          inset: -20px;
          transform: scale(0.7);
          z-index: -1;

          box-shadow: inset 0 0 12px 12px black, inset 0 0 3px 2px black;
          background: rgb(205, 56, 47);
          background: linear-gradient(
            115deg,
            rgba(205, 56, 47, 1) 0%,
            rgba(229, 150, 51, 1) 42%,
            rgba(72, 154, 74, 1) 74%,
            rgba(63, 109, 232, 1) 89%
          );
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:hover:before {
          transform: scale(1);
        }
      `}</style>
    </>
  );
}
