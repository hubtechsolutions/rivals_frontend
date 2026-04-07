import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ferf1mheo22r9ira.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.licdn.com",
      },
      {
        protocol: "https",
        hostname: "**.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "**.twimg.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
