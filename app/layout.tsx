import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ParentStrip, SiteFooter } from '@/components/SiteChrome';

const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-grotesk', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'AI Readiness Audit — The Collective, Collective AI Inc',
  description: 'A free 25-question AI readiness audit from The Collective, the consulting division of Collective AI Inc. Five scores, about six minutes, and the division to call first.',
  keywords: 'AI readiness, AI consulting, AI agents, business automation, The Collective, Collective AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <ParentStrip />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
