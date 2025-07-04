import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { db } from "~/server/db";
import { createTwitchChatSubscription } from "~/utils/twitch/twitchChatSubscription";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      userLink: string;
    } & DefaultSession["user"];
    account: {
      providerId: string;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "chat:read channel:bot openid user:read:email",
        },
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: async ({ session, user }) => {
      let userPlayerLink = await db.userPlayerLink.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!userPlayerLink) {
        userPlayerLink = await db.userPlayerLink.create({
          data: {
            userId: user.id,
          },
        });
      }
      const account = await db.account.findFirst({
        where: {
          userId: user.id,
          provider: "twitch",
        },
      });
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          userLink: userPlayerLink?.link,
        },
        account: {
          providerId: account?.providerAccountId,
        },
      };
    },
    signIn: async ({ account }) => {
      console.log("account", account);
      if (!account) {
        return false;
      }

      const whitelist = await db.whitelist.findFirst({
        where: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      });

      if (!whitelist) {
        return false;
      }
      return true;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (user.id) {
        await db.userPlayerLink.create({
          data: {
            userId: user.id,
          },
        });
        await db.srStatus.create({
          data: {
            userID: user.id,
          },
        });
        await db.userPlayerSettings.create({
          data: {
            userID: user.id,
          },
        });
      }
    },
    linkAccount: async ({ account }) => {
      await createTwitchChatSubscription(account.providerAccountId);
    },
    signIn: async ({ account }) => {
      if (account?.providerAccountId) {
        await createTwitchChatSubscription(account.providerAccountId);
      }
    },
  },
} satisfies NextAuthConfig;
