import { PluginFunc } from "dayjs";

declare const plugin: PluginFunc;
export = plugin;

declare module "dayjs" {
  interface Dayjs {
    parts({ date, time }: { date: string; time: string }): Dayjs;
    isWeekend(): boolean;
    isThisMonth(): boolean;
    isHappeningNowWith(end: Dayjs): boolean;
    isPast(): boolean;
    isFuture(): boolean;
    isThisWeek(): boolean;
    formatInterval(): string;
  }
}
