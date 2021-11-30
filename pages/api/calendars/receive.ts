import type { NextApiRequest, NextApiResponse } from "next";
import { createGoogleFromReq } from "@/google";
import { except } from "@/middlewares";

export default except(async function receive(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.headers);
  console.log(req.body);
  /*
  const google = await createGoogleFromReq(req);
  const events = await google.getCalendars();
  return res.json(events);
  */
  return res.json({ ok: true });
});
