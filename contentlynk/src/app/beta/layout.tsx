import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beta Dashboard - Contentlynk',
  description: 'Welcome to Contentlynk Beta! Access your founder dashboard, track platform development, and prepare for the creator economy revolution with 55-75% revenue share.',
  openGraph: {
    title: 'Contentlynk Beta - Founder Dashboard',
    description: 'Exclusive beta access to the future of creator compensation. 55-75% revenue share, zero follower minimums.',
    images: [
      {
        url: '/images/og-beta.png',
        width: 1200,
        height: 630,
        alt: 'Contentlynk Beta Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contentlynk Beta - Founder Dashboard',
    description: 'Exclusive beta access to the future of creator compensation.',
    images: ['/images/og-beta.png'],
  },
  robots: {
    index: false, // Don't index beta pages for now
    follow: true,
  },
}

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
