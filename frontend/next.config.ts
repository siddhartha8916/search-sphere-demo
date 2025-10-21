import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone build for smaller Docker images
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
