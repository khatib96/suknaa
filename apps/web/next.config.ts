import type { NextConfig } from "next";

// TODO: When real images are added to /public/images/, remove Unsplash patterns
// (or keep them if hosts can also use external image URLs)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
