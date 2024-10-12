/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*", // Adjust if your backend is on a different port
      },
    ];
  },
};

export default nextConfig;
