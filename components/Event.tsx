// @ts-nocheck
import { CSSProperties } from "react";
import cn from "classnames";
import Link from "next/link";
import { IEvent } from "@/events";
// @ts-ignore
import { formatDuration } from "@boertel/duration";
import { useNow } from "@/hooks";
import { RecurringIcon } from "@/icons";
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
  const { timeFormat } = useSettings();

  if (now === null) {
    return null;
  }
  // @ts-ignore
  const isNow = now.isBetween(start, end, null, "[]");
  // @ts-ignore
  const isPast = now.isAfter(end);
  // @ts-ignore
  const isFuture = now.isBefore(start);

  // @ts-ignore
  const isToday = start ? start.isToday() : false;

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
                {start.format(timeFormat)} – {/* @ts-ignore */}
                {end.format(timeFormat)}
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
