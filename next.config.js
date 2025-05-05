/** @type {import('next').NextConfig} */
const coreConfig = {
  reactStrictMode: true,
  compress: true, // Enable response compression
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
    domains: [
      "supabasekong-pgo8c80w04gcoo4w88kgsw0s.breaktheice.in",
      "your-image-domain.com",
    ],
    formats: ["image/avif", "image/webp"],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true, 
    turbo: {
      rules: {
        "*.svg": ["@svgr/webpack"],
      },
    },
  },
};

const { withSentryConfig } = require("@sentry/nextjs");

const config = withSentryConfig(coreConfig, {
  org: "scraft-4g",
  project: "crm-cms",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});

module.exports = config;
