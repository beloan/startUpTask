import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  experimental: {
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https", hostname: "app.tablecrm.com",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600,
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256],
  },
  compress: true,
};
export default nextConfig;
