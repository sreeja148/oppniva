import type { Metadata } from 'next';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: 'Oppniva — Find your next opportunity',
  description: 'Personalized competitions, workshops, volunteering, communities, and career pathways for ambitious students.',
  ...(siteOrigin ? {
    metadataBase: new URL(siteOrigin),
    openGraph: {
      title: 'Oppniva — Find your next opportunity',
      description: 'Your next big opportunity is closer than you think.',
      type: 'website' as const,
      images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Oppniva student opportunity discovery platform' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Oppniva — Find your next opportunity',
      description: 'Your next big opportunity is closer than you think.',
      images: ['/og.png'],
    },
  } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
