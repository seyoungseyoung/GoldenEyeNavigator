import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
// import { Toaster } from '@/components/ui/toaster'; // Temporarily removed for debugging
import { PortfolioProvider } from '@/contexts/PortfolioContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '황금빛 노후 포트폴리오',
  description: '은퇴자를 위한 맞춤형 투자 전략.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={geistSans.variable} suppressHydrationWarning>
      <body>
        <PortfolioProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          {/* <Toaster /> */}
        </PortfolioProvider>
      </body>
    </html>
  );
}
