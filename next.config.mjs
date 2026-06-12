/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure that Tailwind CSS works without problems in Next.js app directory
  serverExternalPackages: ['@resvg/resvg-js'],
}

export default nextConfig;
