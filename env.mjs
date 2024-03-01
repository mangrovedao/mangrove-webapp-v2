import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string(),
    NEXT_PUBLIC_WHITELISTED_CHAIN_IDS: z.string(),
    NEXT_PUBLIC_MARKETS: z.string(),
    NEXT_PUBLIC_MANGROVE_CONFIG: z.string(),
    NEXT_PUBLIC_PRICE_API_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url(),
    NEXT_PUBLIC_SENTRY_PROJECT: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_BLAST_DATA_SERVICE: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    NEXT_PUBLIC_WHITELISTED_CHAIN_IDS:
      process.env.NEXT_PUBLIC_WHITELISTED_CHAIN_IDS,
    NEXT_PUBLIC_MARKETS: process.env.NEXT_PUBLIC_MARKETS,
    NEXT_PUBLIC_MANGROVE_CONFIG: process.env.NEXT_PUBLIC_MANGROVE_CONFIG,
    NEXT_PUBLIC_PRICE_API_URL: process.env.NEXT_PUBLIC_PRICE_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_PROJECT: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_BLAST_DATA_SERVICE: process.env.NEXT_PUBLIC_BLAST_DATA_SERVICE,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
