const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@babel/runtime': path.dirname(require.resolve('next/dist/compiled/@babel/runtime/package.json'))
    };
    return config;
  }
};

module.exports = nextConfig;
