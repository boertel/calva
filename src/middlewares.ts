import type { NextApiRequest, NextResponse } from "next";

export function except(api) {
  return async function (req: NextApiRequest, res: NextResponse) {
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
