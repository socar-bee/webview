import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.app', '*.ngrok.io'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.modu.cloud',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn-dev.modudev.cloud',
        pathname: '/**'
      }
    ]
  },
  compiler: {
    removeConsole: process.env.APP_ENV === 'local' ? false : { exclude: ['error', 'warn'] }
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_MODU_API_HOST}/:path*`
      }
    ]
  },
  assetPrefix: process.env.NEXT_PUBLIC_STATIC_URL
}

export default nextConfig
