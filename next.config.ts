import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // domains: ['res.cloudinary.com'], // Add Cloudinary's domain here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
