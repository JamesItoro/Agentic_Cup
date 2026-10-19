import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stage A renders per-request from a cookie session throughout, so the strict
  // cacheComponents/PPR mode (which requires Suspense around all dynamic access)
  // is turned off for now. Revisit when adding Supabase + streaming.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
