import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
    const base = backendUrl.replace(/\/api\/v1$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${base}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;