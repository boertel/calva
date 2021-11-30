import type {NextApiRequest, NextApiResponse} from "next";
import {createGoogleFromReq} from "@/google";
import {except} from "@/middlewares";

export default except(async function calendars(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const google = await createGoogleFromReq(req);
  const calendars = await google.getCalendars();
  return res.json(calendars);
});
