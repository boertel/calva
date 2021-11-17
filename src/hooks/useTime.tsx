// @ts-nocheck
import { createContext, useContext, useCallback, useState } from "react";
import dayjs from "@/dayjs";
import useInterval from "use-interval";

const ClockContext = createContext(null);

export function ClockProvider({ children }: { children: ReactNode }) {
  const now = useNow();
  console.log(now?.toISOString());
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

export function useClock() {
  return useContext(ClockContext);
}

function secondsUntilNextMinute() {
  return 60 - new Date().getSeconds();
}

export function useEveryMinute(callback, immediate?: boolean) {
  const [onTheMinute, setOnTheMinute] = useState<number>(secondsUntilNextMinute * 1000);

  const _callback = useCallback(() => {
    callback();
  }, [callback]);

  useInterval(
    () => {
      _callback();
      setOnTheMinute(secondsUntilNextMinute() * 1000);
    },
    onTheMinute,
    immediate
  );
}

export interface Time {
  hours: number;
  minutes: number;
  seconds?: number;
}

const getTime = (): Time => {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
};

export function useTime(): Time {
  const [time, setTime] = useState<Time>(getTime());
  useEveryMinute(
    useCallback(() => {
      setTime(getTime());
    }, [setTime])
  );
  return time;
}

export function useMinutes(): number {
  const [minutes, setMinutes] = useState<number>(new Date().getMinutes());
  useEveryMinute(
    useCallback(() => {
      setMinutes(new Date().getMinutes());
    }, [setMinutes])
  );
  return minutes;
}

export function useNow() {
  const [now, setNow] = useState<typeof dayjs | null>(null);
  useEveryMinute(
    useCallback(() => {
      setNow(dayjs());
    }, []),
    true
  );
  return now;
}
