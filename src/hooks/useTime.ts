import { useEffect, useCallback, useState } from "react";
import dayjs from "@/dayjs";
import useInterval from "use-interval";
export function useEveryMinute(callback) {
  const [onTheMinute, setOnTheMinute] = useState<number>(
    (60 - new Date().getSeconds()) * 1000
  );

  const _callback = useCallback(() => {
    callback();
  }, [callback]);

  useInterval(() => {
    _callback();
    setOnTheMinute(60 * 1000);
  }, onTheMinute);
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
  const [now, setNow] = useState<typeof dayjs>(dayjs());
  useEveryMinute(
    useCallback(() => {
      setNow(dayjs());
    }, [])
  );
  return now;
}
