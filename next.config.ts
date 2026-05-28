import type { NextConfig } from "next";

// Derive the exact Supabase Storage hostname from the project URL so
// next/image only allows that specific origin in production.
// Falls back to the wildcard pattern for local dev without .env.local.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "**.supabase.co";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        // /storage/v1/object/public/** → public bucket URLs
        // /storage/v1/object/sign/**   → signed URLs (private bucket)
        pathname: "/storage/v1/object/**",
      },
    ],
    formats: ["image/webp"],
  },
};

export default nextConfig;
