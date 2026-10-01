import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // TEMPORARY: stock placeholders until Yllka's own photos are uploaded.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Uploaded photos in production (IMAGE_PROVIDER=cloudinary).
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Admin photo uploads. Photos are shrunk in the browser first; this
      // leaves room for the occasional original straight from a phone.
      bodySizeLimit: "16mb",
    },
  },
  async rewrites() {
    // Uploaded photos live with the API; serving them from this origin keeps
    // them optimizable by next/image like any local image.
    return [{ source: "/media/:path*", destination: `${API_URL}/media/:path*` }];
  },
};

export default nextConfig;
