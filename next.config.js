/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    domains: ['localhost', 'your-production-domain.com'],
  },
}

module.exports = nextConfig
