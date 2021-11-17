import { createGoogleFromReq } from "@/google";
import { duration } from "@boertel/duration";
import type { Duration } from "@boertel/duration";
import dayjs from "@/dayjs";
import Event from "components/Event";

// @ts-ignore
export async function getServerSideProps(context) {
  const google = await createGoogleFromReq(context.req);
  const { events } = await google.getNowAndNext(context.req);
  return { props: { events } };
}

// @ts-ignore
export default function Join({ events = [], children }) {
  const event = events[0];
  const now = dayjs();
  // @ts-ignore
  const start = dayjs(`${event.start.date}T${event.start.time}`);
  // @ts-ignore
  const end = dayjs(`${event.end.date}T${event.end.time}`);

  // @ts-ignore
  const isNow = start.isHappeningNowWith(end);

  const seconds = now.diff(start, "seconds");
  const d: Duration = duration(seconds);

  return (
    <div className="max-w-prose w-full mx-auto p-12 text-center flex flex-col gap-12">
      <h1 className="text-4xl font-black leading-relaxed">
        {isNow ? (
          <>
            Hope you are in this meeting, because it is happening{" "}
            <span className="text-red-500">NOW</span>!
          </>
        ) : (
          "No meetings happening now!"
        )}
      </h1>

      {!isNow && (
        <h4 className="mb-10 text-gray-500">
          Your next meeting is{" "}
          {start.isToday() ? <>in {d.format(["h HH", "m MM"])}.</> : "later."}
        </h4>
      )}
      <Event
        {...event}
        className="justify-center"
        start={start}
        end={end}
        showConference
      />
      {children}
    </div>
  );
}
