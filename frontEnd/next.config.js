/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' },
      { protocol: 'https', hostname: 'portfolio-sasdiop.up.railway.app', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;