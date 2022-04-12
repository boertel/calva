import { createGoogleFromReq } from "@/google";
import { except } from "@/middlewares";
import type { NextApiRequest, NextApiResponse } from "next";

export default except(async function events(req: NextApiRequest, res: NextApiResponse) {
  const google = await createGoogleFromReq(req);
  const events = await google.getEvents();
  return res.json(events);
});
