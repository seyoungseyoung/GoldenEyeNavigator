import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"

// --- Server Initialization Logic ---
import { scheduleDailySignalChecks } from '@/services/emailService';
import '@/ai/flows/market-insight-analyzer';
import '@/ai/flows/investment-strategy-generator';
import '@/ai/flows/stock-signal-generator';
import '@/ai/flows/subscribeToSignals';
import '@/ai/flows/ticker-converter';

let serverInitialized = false;
async function initializeServer() {
  if (serverInitialized) {
    return;
  }
  serverInitialized = true;
  console.log("Initializing server modules for production...");
  scheduleDailySignalChecks();
  console.log('Server started and email scheduler is running.');
}
// --- End Server Initialization Logic ---

export const metadata: Metadata = {
  title: 'GoldenLife Navigator',
  description: 'Your personalized investment strategy guide.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window === 'undefined') {
    await initializeServer();
  }

  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">
            <div className="container relative py-8">
              {children}
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
