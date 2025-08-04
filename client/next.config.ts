import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, //  allows build even with ESLint issues
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
  images: {
    domains: ['vertksxuryrywouipodt.supabase.co'], // public hostname
  },
};

export default nextConfig;
