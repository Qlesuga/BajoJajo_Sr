/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import "./src/server/utils/cache.ts";
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};

export default config;
