/** @type {import('next').NextConfig} */
const nextConfig = {
  // This was true, so `next build` reported success regardless of what the type
  // checker found. A build that cannot fail is not a check.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
