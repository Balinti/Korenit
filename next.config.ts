import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Korenit",
  images: { unoptimized: true },
};

export default nextConfig;
