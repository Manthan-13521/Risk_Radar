import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import AppShell from '@/components/AppShell';

const geistSans = localFont({ src: './fonts/GeistVF.woff', variable: '--font-geist-sans', weight: '100 900' });
const geistMono = localFont({ src: './fonts/GeistMonoVF.woff', variable: '--font-geist-mono', weight: '100 900' });

export const metadata: Metadata = {
  title: 'Risk_Radar — AI Security Command Center',
  description: 'Antivirus detects threats. Risk_Radar investigates attacks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#ECE6E2', color: '#111111' }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
