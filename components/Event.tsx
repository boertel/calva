// @ts-nocheck
import { CSSProperties } from "react";
import cn from "classnames";
import Link from "next/link";
import { IEvent } from "@/events";
// @ts-ignore
import { duration } from "@boertel/duration";
import { useClock } from "@/hooks";
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
  showConference = false,
  style,
  className,
}: IEvent & {
  style?: CSSProperties;
  className?: string;
  isNext?: boolean;
  showConference?: boolean;
}) {
  const now = useClock();
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

  if (now === null) {
    return null;
  }
  // @ts-ignore
  const isNow = start.isHappeningNowWith(end);
  // @ts-ignore
  const isPast = end.isPast();
  // @ts-ignore
  const isFuture = start.isFuture();

  // @ts-ignore
  const isToday = start ? start.isToday() : false;

  // now isn't on the minute perfectly
  const diff = start.diff(now.clone().second(0).subtract(1, "minute"), "seconds");
  const d = duration(diff);

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
              {isNext && (
                <div
                  className={cn("bg-rose-500 rounded-full px-4 md:px-2 text-sm text-black", {
                    "animate animate-pulse": diff < 60,
                  })}
                >
                  in{" "}
                  {diff < 60 ? (
                    <>
                      <strong>{d.format("ss")}</strong>
                      {d.format("[ ]SS")}
                    </>
                  ) : (
                    <>
                      <span className="hidden md:inline">{d.format(["h HH", "m MM"])}</span>
                      <span className="inline md:hidden">{d.format(["hH", "mM"])}</span>
                    </>
                  )}
                </div>
              )}
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
