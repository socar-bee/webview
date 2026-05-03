interface LdJsonProps {
  title: string
  desc: string
  keywords?: string
}

function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\//g, '\\u002f')
}

export default function LdJson({ title, desc, keywords }: LdJsonProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd({
          '@context': 'http://schema.org',
          title,
          description: desc,
          name: '모두의주차장',
          url: process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr',
          keywords
        })
      }}
    />
  )
}
