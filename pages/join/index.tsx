import dayjs from "@/dayjs";
import { createGoogleFromReq } from "@/google";
import { useNow } from "@/hooks";
import { Link } from "@/ui";
import { TodayEvent } from "components/Event";

// @ts-ignore
export async function getServerSideProps(context) {
  const google = await createGoogleFromReq(context.req);
  const { events } = await google.getNowAndNext(context.req);
  return { props: { events } };
}

// @ts-ignore
export default function Join({ events = [], children }) {
  const event = events[0];

  // enough to re-trigger a render every minute
  useNow();

  // @ts-ignore
  const start = dayjs.parts(event.start);
  // @ts-ignore
  const end = dayjs.parts(event.end);

  const isNow = start.isHappeningNowWith(end);

  return (
    <div className="max-w-prose w-full mx-auto p-12 flex flex-col">
      <h1 className="text-4xl font-black leading-relaxed mb-14 text-center">
        {isNow ? (
          <>
            Hope you are in this meeting, because it is happening <span className="text-red-500">NOW</span>!
          </>
        ) : (
          "No meetings happening now!"
        )}
      </h1>
      <TodayEvent {...event} className="justify-center" start={start} end={end} isNext={true} />
      {children}

      <Link className="text-center m-10" href="/">
        Go back home
      </Link>
    </div>
  );
}
