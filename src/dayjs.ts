import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import arraySupport from "dayjs/plugin/arraySupport";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isoWeek from "dayjs/plugin/isoWeek";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
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

dayjs.extend(function isWeekend(o, c, d) {
  // @ts-ignore
  c.prototype.isWeekend = function () {
    return this.day() === 0 || this.day() === 6;
  };
});

dayjs.extend(function isThisMonth(o, c, d) {
  // @ts-ignore
  c.prototype.isThisMonth = function () {
    return this.format("YYYY-MM") == d().format("YYYY-MM");
  };
});

dayjs.extend(function isThisWeek(o, c, d) {
  // @ts-ignore
  c.prototype.isThisWeek = function () {
    return this.format("YYYY-WW") == d().format("YYYY-WW");
  };
});

export default dayjs;
