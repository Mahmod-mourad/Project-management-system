/** @type {import('next').NextConfig} */
const nextConfig = {
  // This was true, so `next build` reported success regardless of what the type
  // checker found. A build that cannot fail is not a check.
  typescript: {
    ignoreBuildErrors: false,
  },
  // There is no `eslint` key here any more. Next.js 16 dropped it — it warned
  // "Unrecognized key(s) in object: 'eslint'" on every dev start and every
  // build, and setting ignoreDuringBuilds did nothing. Linting is its own step:
  // `pnpm lint`, and a job in CI.
  images: {
    unoptimized: true,
  },
}

export default nextConfig
