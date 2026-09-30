import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';

import { SplashScreen } from '@/components/splash/splash-screen';

import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'Aletheia — Scholarship assistance for ST students',
    template: '%s · Aletheia',
  },
  description:
    'Aletheia helps Scheduled Tribe students discover Ministry of Tribal Affairs scholarships and fellowships, understand eligibility, prepare documents, apply and track applications.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <SplashScreen />
        {/* The splash is rendered server-side so it paints first. Hide it for
            the no-JS case so it can never block the application. */}
        <noscript>
          <style>{"{.splash-root{display:none!important}}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
