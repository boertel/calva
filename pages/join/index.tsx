import { createGoogleFromReq } from "@/google";
import { duration } from "@boertel/duration";
import type { Duration } from "@boertel/duration";
import dayjs from "@/dayjs";
import Event from "components/Event";
import { useNow } from "@/hooks";

// @ts-ignore
export async function getServerSideProps(context) {
  const google = await createGoogleFromReq(context.req);
  const { events } = await google.getNowAndNext(context.req);
  return { props: { events } };
}

// @ts-ignore
export default function Join({ events = [], children }) {
  const event = events[0];
  const now = useNow();

  // @ts-ignore
  const start = dayjs.parts(event.start);
  // @ts-ignore
  const end = dayjs.parts(event.end);

  // @ts-ignore
  const isNow = start.isHappeningNowWith(end);

  // @ts-ignore
  const seconds = (now || dayjs()).diff(start, "seconds");
  const d: Duration = duration(seconds);

  return (
    <div className="max-w-prose w-full mx-auto p-12 text-center flex flex-col gap-10">
      <h1 className="text-4xl font-black leading-relaxed mb-14">
        {isNow ? (
          <>
            Hope you are in this meeting, because it is happening <span className="text-red-500">NOW</span>!
          </>
        ) : (
          "No meetings happening now!"
        )}
      </h1>

      {!isNow && (
        <h4 className="text-gray-500">
          Your next meeting is {start.isToday() ? <>in {d.format(["h HH", "m MM"])}.</> : "later."}
        </h4>
      )}
      <Event {...event} className="justify-center" start={start} end={end} isNext={true} />
      {children}
    </div>
  );
}
