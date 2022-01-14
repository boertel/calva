// @ts-nocheck
import cn from "classnames";

import Day from "./Day";

export default function OtherDay({ current, isOff, children, className }: DayProps) {
  // @ts-ignore
  const isWeekend = current.isWeekend();

  return (
    <Day current={current} className={cn("py-4 flex-row", className)}>
      <h3
        className={cn("self-start sticky top-0 flex items-start z-10 px-4 flex-shrink-0 w-full w-20 justify-between", {
          "text-white text-opacity-20": isWeekend || isOff,
        })}
      >
        <div>{current.format("dd")}</div>
        <div>{current.format("D")}</div>
      </h3>
      {children}
    </Day>
  );
}
