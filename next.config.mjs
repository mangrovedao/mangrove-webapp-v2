/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./env.mjs")

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.odos.xyz",
        port: "",
        pathname: "/tokens/**",
      },
      {
        protocol: "https",
        hostname: "assets.odos.xyz",
      },
      {
        protocol: "https",
        hostname: "cryptocurrency-icons.s3-us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "explorer-api.walletconnect.com",
      },
      {
        protocol: "https",
        hostname: "icons.llamao.fi",
      },
    ],
  },
  async redirects() {
    return Promise.resolve([
      {
        source: "/",
        destination: "/trade",
        permanent: true,
      },
    ])
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding")
    return config
  },
}
