import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import AppShell from '@/components/AppShell';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'ShieldSense — AI Security Command Center',
  description: 'Antivirus detects threats. ShieldSense investigates attacks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
