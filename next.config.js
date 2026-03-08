/** @type {import('next').NextConfig} */
const nextConfig = {
  // We use plain <img> tags and don't use Next.js Image Optimization,
  // so disable the image optimization API to reduce attack surface.
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
