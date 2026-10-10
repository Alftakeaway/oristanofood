/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita falsi positivi del workspace root (package-lock.json presente in directory superiori)
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ['image/avif', 'image/webp'],
    // Template local-first: le foto stanno in public/. Per CDN esterni
    // aggiungere qui il dominio in remotePatterns (vedi README).
  },
};

export default nextConfig;
