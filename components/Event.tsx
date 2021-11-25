// @ts-nocheck
import { CSSProperties } from "react";
import cn from "classnames";
import Link from "next/link";
import { IEvent } from "@/events";
// @ts-ignore
import { duration } from "@boertel/duration";
import { useEverySecond, useClock, useUser } from "@/hooks";
import { WarningIcon, RecurringIcon, ExternalIcon } from "@/icons";
import { ConferenceIcon } from "@/ui";
import { useSettings } from "components/Settings";

export default function Event({
  end,
  start,
  summary,
  conference,
  isRecurringEvent,
  attendees,
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
  const { intervalFormat } = useSettings();

  // @ts-ignore
  const isNow = start.isHappeningNowWith(end);
  // @ts-ignore
  const isPast = end.isPast();
  // @ts-ignore
  const isFuture = start.isFuture();

  // @ts-ignore
  const isToday = start ? start.isToday() : false;

  const user = useUser();
  const isExternal = attendees.find(({ email }) => {
    const [, domain] = email.split("@");
    return domain !== user?.email.split("@")[1];
  });

  const AsComponent = conference?.url ? Link : "div";
  return (
    <AsComponent href={conference?.url} className="w-full">
      <a
        target="_blank"
        rel="noopener"
        className={cn(
          isToday
            ? cn(
                "cursor-pointer rounded-lg p-4 flex flex-col my-4 bg-opacity-0 transition-opacity hover:bg-opacity-20 space-y-2",
                {
                  "opacity-30 border border-purple-500 hover:opacity-80": isPast,
                  "border-2 border-red-500 bg-red-500": isNow,
                  "border border-dashed border-purple-500 bg-purple-500": isFuture,
                }
              )
            : "flex flex-row items-center w-full gap-2",
          className
        )}
        style={style}
      >
        {start && end && !isAllDay && (
          <h4 className="flex justify-between items-center gap-2 flex-shrink-0">
            <div
              title={duration(end.diff(start, "seconds")).format(["hH", "m MM"])}
              className={cn("flex items-center gap-2", { "text-red-500 font-medium": isNow, "text-gray-500": !isNow })}
            >
              {/* @ts-ignore */}
              {start.format(intervalFormat[0])} – {/* @ts-ignore */}
              {end.format(intervalFormat[1])}
              {isRecurringEvent && <RecurringIcon />}
            </div>
            <div className="flex items-center gap-2">
              {(isNext || isNow) && <WaitingPill start={start} end={end} />}
              {!!conference ? (
                <ConferenceIcon className={cn("filter", { grayscale: !isNow })} service={conference.type} />
              ) : (
                isToday && <WarningIcon size="1.2em" className={isNow || isNext ? "text-red-500" : "text-gray-500"} />
              )}
            </div>
          </h4>
        )}
        <div className={cn("flex items-center justify-between w-full", { "pr-4": !isToday })}>
          <h4 className={cn({ "w-full text-right": isAllDay })}>{summary.replace("<>", "↔️")}</h4>
          {isExternal && (
            <div title="⚠️  meeting with people outside of your organization">
              <ExternalIcon size="1.2em" className="text-gray-500" />
            </div>
          )}
        </div>
      </a>
    </AsComponent>
  );
}

function WaitingPill({ start, end }: { start: typeof dayjs; end: typeof end }) {
  const now = useClock();

  // now isn't on the minute perfectly
  const isNow = start.isHappeningNowWith(end);

  const _from = isNow ? end : start;

  const diff = _from.diff(now, "seconds");
  const seconds = useEverySecond(diff < 60);
  const d = duration(diff < 60 ? 60 - seconds : diff);

  if (isNow && diff > 2 * 60) {
    return null;
  }

  return (
    <div className="relative">
      {diff < 60 && <div className="absolute inset-[-4px] bg-rose-500 rounded-full z-[-1] animate animate-pulse" />}
      <div className={cn("bg-rose-500 rounded-full px-4 md:px-2 text-sm text-black text-center tabular-nums")}>
        {!isNow && <>in </>}
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
        {isNow && <> left</>}
      </div>
    </div>
  );
}
