// @ts-nocheck
import { CSSProperties } from "react";
import cn from "classnames";
import Link from "next/link";
import { IEvent } from "@/events";
// @ts-ignore
import { duration } from "@boertel/duration";
import { useEverySecond, useClock } from "@/hooks";
import { WarningIcon, RecurringIcon } from "@/icons";
import { ConferenceIcon } from "@/ui";
import { useSettings } from "components/Settings";

export default function Event({
  end,
  start,
  summary,
  conference,
  recurrence,
  isAllDay,
  isNext = false,
  style,
  className,
}: IEvent & {
  style?: CSSProperties;
  className?: string;
  isNext?: boolean;
}) {
  /**
   * Now:                 now.isBetween(start, end, null, '[]')
   *                                   v
   * Time ----------*-------------[----*----]------------*---------
   *                ^           start      end           ^
   * isFuture: start.isAfter(now)                        |
   * isPast:                                      now.isAfter(end)
   *
   */
  const { timeFormat } = useSettings();

  // @ts-ignore
  const isNow = start.isHappeningNowWith(end);
  // @ts-ignore
  const isPast = end.isPast();
  // @ts-ignore
  const isFuture = start.isFuture();

  // @ts-ignore
  const isToday = start ? start.isToday() : false;

  const AsComponent = conference?.url ? Link : "div";
  return (
    <AsComponent href={conference?.url} target="_blank" rel="noopener">
      <a
        className={cn(
          isToday
            ? cn(
                "cursor-pointer rounded-lg p-4 flex flex-col my-4 bg-opacity-0 transition-opacity hover:bg-opacity-20 space-y-2",
                {
                  "opacity-30 border border-purple-500": isPast,
                  "border-2 border-red-500 bg-red-500": isNow,
                  "border border-dashed border-purple-500 bg-purple-500": isFuture,
                }
              )
            : "flex flex-row items-center gap-2",
          className
        )}
        style={style}
      >
        {start && end && (
          <h4 className="flex justify-between items-center gap-2">
            {!isAllDay && (
              <div className="text-gray-500 flex items-center gap-2">
                {/* @ts-ignore */}
                {start.format(timeFormat)} – {/* @ts-ignore */}
                {end.format(timeFormat)}
                {!!recurrence && <RecurringIcon size="1em" />}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isNext && <WaitingPill start={start} />}
              {!!conference ? (
                <ConferenceIcon className={cn("filter", { grayscale: !isNow })} service={conference.type} />
              ) : (
                isToday && <WarningIcon size="1.2em" className={isNow ? "text-red-500" : "text-gray-500"} />
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

function WaitingPill({ start }: { start: typeof dayjs }) {
  const now = useClock();

  // now isn't on the minute perfectly
  const diff = start.diff(now, "seconds");
  const seconds = useEverySecond(diff < 60);
  const d = duration(diff < 60 ? 60 - seconds : diff);

  return (
    <div
      className={cn("bg-rose-500 rounded-full px-4 md:px-2 text-sm text-black text-center", {
        "animate animate-pulse": diff < 60,
      })}
    >
      in{" "}
      {diff < 60 ? (
        <>
          <strong>{d.format("s").padStart(2)}</strong>
          {d.format("[ ]SS").padEnd(8)}
        </>
      ) : (
        <>
          <span className="hidden md:inline">{d.format(["h HH", "m MM"])}</span>
          <span className="inline md:hidden">{d.format(["hH", "mM"])}</span>
        </>
      )}
    </div>
  );
}
