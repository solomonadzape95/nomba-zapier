import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A parent directory has its own lockfile; pin the workspace root here.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
