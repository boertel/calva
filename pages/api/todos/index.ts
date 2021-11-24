import type { NextApiRequest, NextApiResponse } from "next";
import { except } from "@/middlewares";
import { getSession } from "next-auth/react";

import dayjs from "@/dayjs";
import db from "@/db";

export default except(async function todo(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  // @ts-ignore
  const userId: string = session.user.id;

  // @ts-ignore
  const today = dayjs(req.query.today);
  if (req.method === "GET") {
    // TODO this needs to happen on user timezone midnight
    await db.todo.updateMany({
      where: {
        userId,
        date: { lt: today.toDate() },
        status: { not: "done" },
      },
      data: {
        date: today.toDate(),
        status: "todo",
      },
    });
    const todos = await db.todo.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id,
        date: { gte: today.toDate() },
      },
      orderBy: [{ createdAt: "asc" }],
    });

    return res.json(todos);
  } else if (req.method === "POST") {
    const body = JSON.parse(req.body);
    const todo = await db.todo.create({
      data: {
        ...body,
        userId,
        date: today.toDate(),
      },
    });
    return res.json(todo);
  } else if (req.method === "PATCH") {
    const { id, ...body } = JSON.parse(req.body);
    const todo = await db.todo.update({
      where: {
        id,
      },
      data: {
        ...body,
        userId,
      },
    });
    return res.json(todo);
  }
});
