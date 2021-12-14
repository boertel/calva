import type { NextApiRequest, NextApiResponse } from "next";
import { createGoogleFromReq } from "@/google";
import { except } from "@/middlewares";
import { MethodNotAllowedError, NotFoundError } from "@/errors";
import db from "@/db";

export default except(async function sync(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    throw new MethodNotAllowedError();
  }
  const google = await createGoogleFromReq(req);
  let id: string;
  if (Array.isArray(req.query.id)) {
    id = req.query.id[0];
  } else {
    id = req.query.id;
  }

  const where = {
    ownerId: google.accountId,
    slug: id,
  };

  let calendar = await db.calendar.findUnique({
    where: {
      ownerId_slug: where,
    },
  });

  if (!calendar) {
    throw new NotFoundError();
  }

  let items: any[] = [];
  let pageToken;
  let syncToken;
  do {
    // @ts-ignore
    const { data } = await google.calendar.events.list({
      calendarId: id,
      syncToken: calendar.syncToken,
      pageToken,
    });
    pageToken = data.nextPageToken;
    syncToken = data.nextSyncToken;
    items = items.concat(data.items);
  } while (pageToken);

  const { count } = await db.event.createMany({
    data: items
      .filter(({ start, end, summary }) => start && end && summary)
      .map(({ id, summary, description, recurrence, status, start, end }) => {
        try {
          return {
            start: start.date || start.dateTime,
            end: end.date || end.dateTime,
            timezone: start?.timeZone,
            recurrence: recurrence ? recurrence.join("\n") : null,
            status,
            summary,
            description,
            externalId: id,
            calendarId: calendar.id,
          };
        } catch (exception) {
          console.error(id, summary);
          console.error(exception);
          return false;
        }
      }),
    skipDuplicates: true,
  });

  await db.calendar.update({
    where: {
      id: calendar.id,
    },
    data: {
      syncToken,
    },
  });

  return res.json({ slug: calendar.slug, count });
});
