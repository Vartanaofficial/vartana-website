import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.VARTANA_NETLIFY_BUILD === "1" ? ".next-netlify" : ".next",
};

export default nextConfig;
