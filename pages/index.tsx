import { useEvents } from "@/events";
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
import { formatDuration } from "@boertel/duration";

import {
  RecurringIcon,
  ZoomIcon,
  GoogleMeetIcon,
  MicrosoftTeamsIcon,
} from "@/icons";

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, index) => start + index);
}

enum ConferenceService {
  Zoom = "zoom",
  GoogleMeet = "meet",
  MicrosoftTeams = "teams",
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

interface IEvent {
  id: string;
  summary: string;
  conference?: {
    type: ConferenceService;
    url?: string;
  };
  isOff?: boolean;
  isAllDay?: boolean;
  start?: typeof dayjs;
  end?: typeof dayjs;
}

export default function Home() {
  const { events } = useEvents();
  return <Events events={events} />;
}

function Events({ events }) {
  const now = useNow();

  const days = range(0, 12 * 7);

  return (
    <main className="flex justify-center">
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 65ch max-content",
        }}
      >
        {days.map((index) => {
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
                  now.isBetween(
                    index > 0
                      ? currentEvents[index - 1]?.start
                      : now.startOf("day"),
                    event.start
                  );
                if (event.start && event.end && !inMeetingCurrently) {
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
                      <Event
                        isNext={!inMeetingCurrently && isNext}
                        {...event}
                      />
                    ) : (
                      <RecurringIcon className="text-purple-500" size="1em" />
                    )}
                    {current.isToday() &&
                      now.isAfter(event.end) &&
                      index === currentEvents.length - 1 && <NowLine />}
                  </Fragment>
                );
              })}
            </Day>
          );
        })}
      </ul>
    </main>
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
  const isNow = now.isBetween(start, end, null, "[]");
  const isPast = now.isAfter(end);
  const isFuture = now.isBefore(start);

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
                {start.format(query.format === "24h" ? "HH:mm" : "hh:mma")} -{" "}
                {end.format(query.format === "24h" ? "HH:mm" : "hh:mma")}
                {!!recurrence && <RecurringIcon size="1em" />}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isNext && (
                <div className="bg-rose-500 rounded-full px-2 text-sm text-black">
                  in{" "}
                  {formatDuration(start.diff(now, "seconds"), {
                    format: (value, key) =>
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
        {children}
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
      onClick: (evt) => void;
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
        <div className="relative h-full my-6">{children}</div>
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
    const isWeekend = current.isWeekend();
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
            "relative flex no-underline border-gray-800 bg-transparent transition-colors rounded-none",
            current.date() === 1 ? "border-t-4 border-gray-600" : "border-t",
            !isToday
              ? {
                  "py-4 items-center": !isToday,
                  "opacity-30": isPast,
                  "text-white text-opacity-20 hover:text-opacity-100":
                    isWeekend || isOff,
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
