import { google as googleapis } from "googleapis";
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
  callbacks: {
    session: async (session, user) => {
      if (user) {
        session.user.id = user.id;
      }
      return Promise.resolve(session);
    },
  },
  events: {
    signIn: async ({ account, isNewUser }) => {
      if (!isNewUser) {
        const { access_token, refresh_token } = account;
        const auth = new googleapis.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        auth.setCredentials({ access_token, refresh_token });
        const { credentials } = await auth.refreshAccessToken();
        console.log(token, rest);
        await db.account.update({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
          data: {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            expires_at: credentials.expiry_date,
            scope: credentials.scope,
          },
        });
      }
    },
  },
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
