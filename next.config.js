/** @type {import('next').NextConfig} */
const coreConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
    domains: ["supabasekong-pgo8c80w04gcoo4w88kgsw0s.breaktheice.in"],
    formats: ["image/avif", "image/webp"],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        "*.svg": ["@svgr/webpack"],
      },
    },
  },
};
import { withSentryConfig } from "@sentry/nextjs";

const config = withSentryConfig(coreConfig, {
  org: "scraft-4g",
  project: "crm-cms",

  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});

export default config;
