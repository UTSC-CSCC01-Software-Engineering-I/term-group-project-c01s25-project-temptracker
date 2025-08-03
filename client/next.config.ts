import type { NextConfig } from "next";
require('dotenv').config(); // Only needed if not already available

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, //  allows build even with ESLint issues
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const cleanBase = apiBase.replace(/\/api\/?$/, ""); // remove trailing /api if needed

    return [
      {
        source: "/api/:path*",
        destination: `${cleanBase}/api/:path*`,
      },
    ];
  },
  images: {
    domains: ['vertksxuryrywouipodt.supabase.co'], // public hostname
  },
};

export default nextConfig;
