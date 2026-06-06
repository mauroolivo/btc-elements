import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@features/auth/AuthProvider';
import { AxeDevTools } from '@shared/ui/a11y/AxeDevTools';
import { Header } from '@shared/ui/header/Header';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'BTC Elements',
  description:
    'BTC Elements is a Bitcoin Core interface for wallet flows, node status, explorer, mempool, and authenticated profile access.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}>
        <AxeDevTools />
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
