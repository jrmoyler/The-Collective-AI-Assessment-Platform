import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './experience.css';
import { ParentStrip, SiteFooter } from '@/components/SiteChrome';

const grotesk = localFont({ src: './fonts/space-grotesk-var.woff2', variable: '--font-grotesk', display: 'swap' });
const mono = localFont({ src: './fonts/jetbrains-mono-var.woff2', variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'AI Readiness Audit — The Collective, Collective AI Inc',
  description: 'A free 25-question AI readiness audit from The Collective, the consulting division of Collective AI Inc. Five scores, about six minutes, and the division to call first.',
  keywords: 'AI readiness, AI consulting, AI agents, business automation, The Collective, Collective AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <ParentStrip />
        <div id="main-content" tabIndex={-1}>
        {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
