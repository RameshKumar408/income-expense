import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    additionalManifestEntries: [
      { url: "/createDetail", revision: "1.0" },
      { url: "/viewDetails", revision: "1.0" },
      { url: "/settings", revision: "1.0" },
      { url: "/manifest.json", revision: "1.0" },
      { url: "/icon-192.png", revision: "1.0" },
      { url: "/apple-touch-icon.png", revision: "1.0" },
    ],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-images",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-assets",
          expiration: {
            maxEntries: 120,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkOnly", // Financial & mutation APIs must never be served from stale SW cache
      },
      {
        urlPattern: ({ request, url }) => {
          if (url.pathname.startsWith("/api/")) return false;
          return (
            request.mode === "navigate" ||
            url.searchParams.has("_rsc") ||
            url.pathname.startsWith("/_next/data/")
          );
        },
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages-rsc-cache",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
  },
  async headers() {
    return [
      {
        // Next.js content-hashed static assets (chunks, CSS, media)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Static images and fonts in /public
        source: "/:all*(png|jpg|jpeg|webp|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // PWA Manifest must revalidate so updates are detected immediately
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Service worker script must never be cached by HTTP cache
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
