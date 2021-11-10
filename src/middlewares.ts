// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";

// @ts-ignore
export function except(api) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      return await api(req, res);
    } catch (exception) {
      if (process.env.NODE_ENV !== "production") {
        console.error(exception);
      }
      return res
        .status(exception.statusCode || 500)
        .json({ message: exception.message });
    }
  };
}
