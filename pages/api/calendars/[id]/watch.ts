import type { NextApiRequest, NextApiResponse } from "next";
import { createGoogleFromReq } from "@/google";
import { except } from "@/middlewares";

import db from "@/db";

export default except(async function watch(req: NextApiRequest, res: NextApiResponse) {
  let id: string;
  if (Array.isArray(req.query.id)) {
    id = req.query.id[0];
  } else {
    id = req.query.id;
  }
  const google = await createGoogleFromReq(req);

  const { summary } = await google.getCalendar(id);
  const where = {
    ownerId: google.accountId,
    slug: summary,
  };

  let calendar = await db.calendar.findUnique({
    where: {
      ownerId_slug: where,
    },
  });

  if (req.method === "POST") {
    if (!calendar) {
      calendar = await db.calendar.create({
        data: where,
      });
    }

    if (!calendar.watchId) {
      const watch = await google.watchEvents(id, { id: calendar.id });
      await db.calendar.updateMany({
        where: { id: calendar.id },
        data: { watchId: watch.resourceId },
      });
    }
  } else if (req.method === "DELETE") {
    calendar = await db.calendar.update({
      where: { id: calendar.id },
      data: {
        watchId: null,
      },
    });
  }

  return res.json(calendar);
});
