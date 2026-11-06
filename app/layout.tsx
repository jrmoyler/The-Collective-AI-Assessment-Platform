import type { Metadata } from 'next';
import './globals.css';
import { ParentStrip, SiteFooter } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'AI Readiness Audit | The Collective — Collective AI',
  description: 'A free 25-question AI readiness audit from The Collective, the consulting division of Collective AI. Get five readiness scores and a plan in about six minutes.',
  keywords: 'AI readiness, AI consulting, AI agents, business automation, The Collective, Collective AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body style={{ backgroundColor: '#0B0F1C', color: '#F5F5F5', margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ParentStrip />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
