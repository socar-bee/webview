import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr'

  if (process.env.APP_ENV === 'prod') {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/my-ticket', '/purchase/*']
      },
      sitemap: `${host}/sitemap.xml`
    }
  }

  return {
    rules: {
      userAgent: '*',
      disallow: '/'
    }
  }
}
