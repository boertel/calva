// @ts-nocheck
import {
  ReactNode,
  CSSProperties,
  forwardRef,
  useState,
  useRef,
  useCallback,
} from "react";
import cn from "classnames";
import dayjs from "@/dayjs";
import { Pill, Annotation } from "@/ui";

interface DayProps {
  year: number;
  month: number;
  day: number;
  isOff?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Day({
  year,
  month,
  day,
  isOff = false,
  children,
}: DayProps) {
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