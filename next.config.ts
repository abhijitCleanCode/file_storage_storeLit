import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB", // not to be blocked by next js
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com" // tell next js it's fine to render data such as image from this source
      },
      {
        protocol: "https",
        hostname: "img.freepik.com"  // tell next js it's fine to render data such as image from this source
      },
      {
        protocol: "https",
        hostname: "cloud.appwrite.io" // tell next js it's fine to render data such as image from this source
      }
    ]
  }
};

export default nextConfig;
