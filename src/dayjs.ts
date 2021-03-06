import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import arraySupport from "dayjs/plugin/arraySupport";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(advancedFormat);
dayjs.extend(arraySupport);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

declare module "dayjs" {
  interface Dayjs {
    isWeekend(): boolean;
    isThisMonth(): boolean;
    isHappeningNowWith(end: Dayjs): boolean;
    isPast(): boolean;
    isFuture(): boolean;
    isThisWeek(): boolean;
    formatInterval(): string;
  }

  export function parts({ date, time }: { date: string; time: string }): Dayjs;
}

dayjs.extend(function parts(o, c, d) {
  d.parts = function ({ date, time }: { date: string; time: string }) {
    return d(d.utc(`${date}T${time}`).format());
  };
});

dayjs.extend(function isWeekend(o, c, d) {
  c.prototype.isWeekend = function () {
    return this.day() === 0 || this.day() === 6;
  };
});

dayjs.extend(function isThisMonth(o, c, d) {
  c.prototype.isThisMonth = function () {
    return this.format("YYYY-MM") == d().format("YYYY-MM");
  };
});

dayjs.extend(function isHappeningNowWith(o, c, d) {
  c.prototype.isHappeningNowWith = function (end) {
    const now = dayjs();
    return now.isBetween(this, end, null, "[]");
  };
});

dayjs.extend(function isPast(o, c, d) {
  c.prototype.isPast = function () {
    const now = dayjs();
    return now.isAfter(this);
  };
});

dayjs.extend(function isFuture(o, c, d) {
  c.prototype.isFuture = function () {
    const now = dayjs();
    return this.isAfter(now);
  };
});

dayjs.extend(function isThisWeek(o, c, d) {
  c.prototype.isThisWeek = function () {
    return this.format("YYYY-WW") == d().format("YYYY-WW");
  };
});

dayjs.extend(function formatInterval(o, c, d) {
  c.prototype.formatInterval = function (hourFormat = "h"): string {
    if (this.get("minutes")) {
      return this.format(`${hourFormat}:mm`);
    } else {
      return this.format(`${hourFormat}`);
    }
  };
});

export default dayjs;
