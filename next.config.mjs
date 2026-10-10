/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita falsi positivi del workspace root (package-lock.json presente in directory superiori)
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
