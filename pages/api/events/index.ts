import { createGoogleFromReq } from "@/google";
import { except } from "@/middlewares";

export default except(async function events(req, res) {
  const google = await createGoogleFromReq(req);
  const events = await google.getEvents();
  return res.json(events);
});
