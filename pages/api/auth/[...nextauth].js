import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import db from "@/db";

export default NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  secret: process.env.SECRET,
  database: process.env.DATABASE_URL,
});

/*
async function refreshAccessToken(userId, newAccount) {
  try {
    const accounts = await db.account.findMany({
      where: { userId: userId },
    });

    const userAccount = accounts[0];

    if (userAccount.accessTokenExpires) {
      if (new Date() < userAccount.accessTokenExpires) {
        return;
      }
    }

    const refreshToken = userAccount.refreshToken;

    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      if (refreshedTokens.error === "invalid_grant") {
        await db.account.update({
          where: { id: userAccount.id },
          data: {
            refreshToken: newAccount.refreshToken,
            accessToken: newAccount.accessToken,
            accessTokenExpires: new Date(Date.now() + newAccount.expires_in * 1000),
          },
        });
        return;
      }
      throw refreshedTokens;
    }

    await db.account.update({
      where: { id: userAccount.id },
      data: {
        refreshToken: refreshedTokens.refresh_token ?? refreshToken,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: new Date(Date.now() + refreshedTokens.expires_in * 1000),
      },
    });
  } catch (error) {
    console.log(error);
  }
}
*/
