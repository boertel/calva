// @ts-nocheck
import { Annotation } from "@/ui";
import cn from "classnames";
import { forwardRef } from "react";

const Day = forwardRef(function DayWithRef({ current, className, children, ...props }, ref) {
  const firstOfTheMonth = current.date() === 1;

  return (
    <>
      {(current.date() === 1 || current.isToday()) && (
        <Annotation
          style={{ gridColumn: 1 }}
          className={cn("justify-end z-20", {
            "text-purple-500": current.isThisMonth(),
          })}
        >
          {current.format("MMM")}
        </Annotation>
      )}
      <li
        style={{ gridColumn: 2 }}
        className={cn(
          "relative flex no-underline border-gray-800 bg-transparent transition-colors rounded-none",
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
