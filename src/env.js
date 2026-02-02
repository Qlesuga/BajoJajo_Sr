import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    TWITCH_BOT_USER_ID: z.string(),
    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),
    TWITCH_REFRESH_TOKEN: z.string(),
    TWITCH_WEBHOOK_SECRET: z.string(),
    TWITCH_WEBHOOK_ENDPOINT: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_URL: z.string(),
    REDIS_PASSWORD: z.string(),
    REDIS_HOST: z.string(),
    CLOUDFLARE_TOKEN:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NODE_ENV,
    TWITCH_BOT_USER_ID: process.env.TWITCH_BOT_USER_ID,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    TWITCH_REFRESH_TOKEN: process.env.TWITCH_REFRESH_TOKEN,
    TWITCH_WEBHOOK_SECRET: process.env.TWITCH_WEBHOOK_SECRET,
    TWITCH_WEBHOOK_ENDPOINT: process.env.TWITCH_WEBHOOK_ENDPOINT,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    CLOUDFLARE_TOKEN: process.env.CLOUDFLARE_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
