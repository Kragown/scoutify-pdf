import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Configuration pour better-sqlite3 côté serveur
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }
    return config;
  },
};

export default nextConfig;
