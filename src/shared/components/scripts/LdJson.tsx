import Script from 'next/script'

interface LdJsonProps {
  title: string
  desc: string
  keywords?: string
}

export default function LdJson({ title, desc, keywords }: LdJsonProps) {
  return (
    <Script
      id="ldJson"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
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
