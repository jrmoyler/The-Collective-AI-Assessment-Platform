import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Readiness Audit | The Collective — Collective AI',
  description: 'Discover exactly how many hours your team can reclaim every week with AI agents — and whether you are truly ready to implement them successfully.',
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
        {children}
      </body>
    </html>
  );
}
