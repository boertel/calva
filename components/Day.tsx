// @ts-nocheck
import { useEventListener } from "@/hooks";
import { Annotation } from "@/ui";
import cn from "classnames";
import { forwardRef, useCallback, useState } from "react";

const Day = forwardRef(function DayWithRef({ current, className, children, ...props }, ref) {
  const firstOfTheMonth = current.date() === 1;
  const [showWeekNumber, setShowWeekNumber] = useState<boolean>(false);

  useEventListener(
    "keydown",
    useCallback(
      (evt) => {
        if (evt.target.tagName !== "INPUT" && evt.key === "w") {
          setShowWeekNumber((prev) => !prev);
        }
      },
      [setShowWeekNumber]
    )
  );

  return (
    <>
      {(current.date() === 1 || current.isToday() || current.isoWeekday() === 1) && (
        <Annotation style={{ gridColumn: 1 }} className={cn("z-20")}>
          <div
            className={cn("flex flex-col items-center h-full", current.isToday() ? "justify-start" : "justify-center")}
          >
            {(current.date() === 1 || current.isToday()) && (
              <div
                className={cn({
                  "text-purple-500": current.isThisMonth(),
                })}
              >
                {current.format("MMM")}
              </div>
            )}
            {current.isoWeekday() === 1 && (
              <div
                className={cn("text-sm font-light transition-opacity self-end", {
                  "opacity-40": showWeekNumber,
                  "opacity-0": !showWeekNumber,
                })}
              >
                {current.isoWeek()}
              </div>
            )}
          </div>
        </Annotation>
      )}
      <li
        style={{ gridColumn: 2 }}
        className={cn(
          "flex no-underline border-gray-800 bg-transparent transition-colors rounded-none",
          firstOfTheMonth ? "border-t-4 border-gray-600" : "border-t",
          className
        )}
        ref={ref}
      >
        {children}
      </li>
      {current.isToday() && (
        <Annotation style={{ gridColumn: 3 }} className="text-purple-500 justify-start text-opacity-40">
          Today
        </Annotation>
      )}
      {current.isTomorrow() && (
        <Annotation style={{ gridColumn: 3 }} className="justify-start text-white text-opacity-40">
          Tomorrow
        </Annotation>
      )}
      {current.month() === 0 && current.date() === 1 && (
        <Annotation style={{ gridColumn: 3 }} className="justify-start text-white text-opacity-40">
          {current.format("YYYY")}
        </Annotation>
      )}
    </>
  );
});

export default Day;
