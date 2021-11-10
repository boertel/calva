import { except } from "@/middlewares";
import { createGoogleFromReq } from "@/google";

export default except(async function sync(req, res) {
  const google = await createGoogleFromReq(req, res);
  return res.json({});
});
