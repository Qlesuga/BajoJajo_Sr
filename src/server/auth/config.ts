import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Account, User, DefaultSession, NextAuthConfig } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { db } from "~/server/db";
import { createTwitchChatSubscription } from "~/utils/twitchChatSubscription";
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
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
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
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    linkAccount: async (message: {
      user: User;
      account: Account;
      profile: User;
    }) => {
      await createTwitchChatSubscription(message.account.providerAccountId);
    },
  },
} satisfies NextAuthConfig;
