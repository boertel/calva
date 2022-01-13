// @ts-nocheck
import { LeftFrom, useBackToElement } from "@/hooks";
import { Pill } from "@/ui";
import cn from "classnames";

import Day from "./Day";
import { TodoList } from "./TodoList";

export default function Today({ current, children, isOff }: DayProps) {
  const { ref, backToElement, elementLeftFrom } = useBackToElement<HTMLLIElement>();

  // @ts-ignore
  const isWeekend = current.isWeekend();

  return (
    <>
      <Day current={current} ref={ref} className="flex-col border-t-0">
        <h3
          className={cn(
            "self-start sticky top-0 flex items-start z-10 px-4 flex-shrink-0 w-full text-4xl font-black text-purple-500 space-x-2 pt-2 shadow-xl bg-black",
            {
              "text-white text-opacity-20": isWeekend || isOff,
            }
          )}
        >
          <div>{current.format("dddd")}</div>
          <div>{current.format("D")}</div>
        </h3>

        <div className="relative h-full my-6 flex flex-col justify-between">{children}</div>
        <TodoList />
      </Day>
      <Pill
        onClick={backToElement}
        className={cn({
          "translate-y-[-40px] max-h-0 top-0 pointer-events-none": elementLeftFrom === undefined,
          "translate-y-4 max-h-[40px] top-0 pointer-events-auto": elementLeftFrom === LeftFrom.Top,
          "translate-y-[-1rem] h-auto bottom-0 pointer-events-auto": elementLeftFrom === LeftFrom.Bottom,
        })}
        style={{
          transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1), max-height 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        Back to today
      </Pill>
    </>
  );
}
