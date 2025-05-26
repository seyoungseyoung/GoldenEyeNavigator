import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Using Geist Sans as primary
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Portfolio Revamp',
  description: 'A revamped personal portfolio with AI-powered introductions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <div className="flex flex-col flex-1 md:ml-[var(--sidebar-width)] group-data-[collapsible=icon]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)] transition-[margin-left] duration-200 ease-linear">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
              {children}
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
