import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/.git/**', '**/.next/**', '**/.playwright-mcp/**'],
      };
    }

    return config;
  },
};

export default nextConfig;
