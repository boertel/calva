import type { NextApiRequest, NextApiResponse } from "next";
import { except } from "@/middlewares";
import { createGoogleFromReq } from "@/google";

export default except(async function events(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const google = await createGoogleFromReq(req);
  return res.json({});
});
