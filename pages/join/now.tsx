import { createGoogleFromReq } from "@/google";
import dayjs from "@/dayjs";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import useInterval from "use-interval";
import Join from "./index";

// @ts-ignore
export async function getServerSideProps(context) {
  const google = await createGoogleFromReq(context.req);
  const { events } = await google.getNowAndNext(context.req);
  return { props: { events } };
}

export default function JoinNow({ events = [] }) {
  const router = useRouter();
  const event = events[0];

  // @ts-ignore
  const start = dayjs.parts(event.start);
  // @ts-ignore
  const end = dayjs.parts(event.end);

  // @ts-ignore
  const isNow = start.isHappeningNowWith(end);

  const { conference } = event;
  const [seconds, setSeconds] = useState<number>(5);

  useInterval(
    useCallback(() => {
      setSeconds((prev) => {
        const count = prev - 1;
        if (count === 0) {
          // @ts-ignore
          router.push(conference.url);
        }
        return count;
      });
    }, [setSeconds, router, conference]),
    seconds >= 0 && isNow ? 1000 : false,
    true
  );

  return (
    <Join events={events}>
      <div className="text-center">
        {isNow &&
          (seconds >= 0 ? (
            <>
              Redirecting to the meeting in <span className="text-md text-red-500">{seconds}</span>{" "}
              {seconds === 1 ? "second" : "seconds"}...
            </>
          ) : (
            <>Have fun 🎉!</>
          ))}
      </div>
    </Join>
  );
}
