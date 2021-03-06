// @ts-nocheck
import { IEvent } from "@/events";
import { useClock, useEverySecond, useUser } from "@/hooks";
import { ExternalIcon, RecurringIcon, WarningIcon } from "@/icons";
import { ConferenceIcon } from "@/ui";
// @ts-ignore
import { duration } from "@boertel/duration";
import cn from "classnames";
import { useSettings } from "components/Settings";
import Link from "next/link";
import { CSSProperties } from "react";

export function OtherEvent({
  end,
  start,
  isRecurringEvent,
  summary,
  attendees,
  showDetails,
}: IEvent & {
  showDetails?: boolean;
}) {
  // @ts-ignore
  const responseStatus = attendees.find(({ self }) => self)?.responseStatus;
  const { intervalFormat } = useSettings();

  const user = useUser();
  const isExternal = attendees.find(({ email }) => {
    const [, domain] = email.split("@");
    return domain !== user?.email.split("@")[1];
  });

  return (
    <div
      className={cn("flex flex-row items-center", {
        hidden: !showDetails && isRecurringEvent,
      })}
    >
      <div className="flex items-center gap-2 min-w-0 w-full">
        <h5 className="text-gray-500 tabular-nums" title={duration(end.diff(start, "seconds")).format(["hH", "m MM"])}>
          {start.format(intervalFormat[0])}&nbsp;–&nbsp;{end.format(intervalFormat[1])}
        </h5>
        <Summary
          title={summary}
          className={cn("text-ellipsis overflow-hidden whitespace-nowrap flex-grow", {
            "line-through text-gray-500": responseStatus === "declined",
          })}
        >
          {summary}
        </Summary>
        {isExternal && <ExternalIcon size="1.2em" className="flex-shrink-0 text-gray-500" />}
      </div>
    </div>
  );
}

export function TodayEvent({
  id,
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
  hint,
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
  const user = useUser();
  const { intervalFormat } = useSettings();

  const isNow = start.isHappeningNowWith(end);
  const isPast = end.isPast();
  const isFuture = start.isFuture();

  const isExternal = attendees.find(({ email }) => {
    const [, domain] = email.split("@");
    return domain !== user?.email.split("@")[1];
  });

  const AsComponent = conference?.url ? Link : "div";
  let href = conference?.url;
  if (href) {
    if (href.startsWith("https://zoom.us/j/")) {
      href = href.replace("https://zoom.us/j/", "zoommtg://zoom.us/join?confno=");
    } else if (href.startsWith("https://meet.google.com")) {
      href += `?authuser=${user?.email}`;
    }
  }
  return (
    <AsComponent href={href} className="w-full">
      <a
        target="_blank"
        rel="noopener"
        className={cn(
          "cursor-pointer rounded-lg p-4 flex flex-col my-4 bg-opacity-0 transition-opacity hover:bg-opacity-20 space-y-2",
          {
            "opacity-30 border border-purple-500 hover:opacity-80": isPast,
            "border-2 border-red-500 bg-red-500": isNow,
            "border border-dashed border-purple-500 bg-purple-500": isFuture,
          },
          className
        )}
        style={style}
      >
        {start && end && !isAllDay && (
          <h4 className="flex justify-between items-center gap-2 flex-shrink-0">
            <div
              title={duration(end.diff(start, "seconds")).format(["hH", "m MM"])}
              className={cn("flex items-center gap-2 tabular-nums", {
                "text-red-500 font-medium": isNow,
                "text-gray-500": !isNow,
              })}
            >
              {/* @ts-ignore */}
              {start.format(intervalFormat[0])} – {/* @ts-ignore */}
              {end.format(intervalFormat[1])}
              {isRecurringEvent && (
                <Tooltip title={hint}>
                  <RecurringIcon />
                </Tooltip>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(isNext || isNow) && <WaitingPill start={start} end={end} />}
              {!!conference ? (
                <ConferenceIcon className={cn("filter", { grayscale: !isNow })} service={conference.type} />
              ) : (
                <WarningIcon size="1.2em" className={isNow || isNext ? "text-red-500" : "text-gray-500"} />
              )}
            </div>
          </h4>
        )}
        <div className="flex items-center justify-between flex-grow">
          <h4 className={cn({ "w-full text-right": isAllDay })} title={hint}>
            <Summary>{summary}</Summary>
          </h4>
          {isExternal && (
            <Tooltip title="⚠️  meeting with people outside of your organization">
              <ExternalIcon size="1.2em" className="text-gray-500" />
            </Tooltip>
          )}
        </div>
      </a>
    </AsComponent>
  );
}

function Summary({ children, ...props }) {
  return <div {...props}>{children.replace("<>", "↔️")}</div>;
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

function Tooltip({ title, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div title={title} {...props} />;
}
