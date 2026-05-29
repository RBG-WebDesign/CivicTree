// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import RoleSwitcher from '@/components/RoleSwitcher';
import { ToastProvider } from '@/components/demo/Toast';

export const metadata: Metadata = {
  title: 'CivicTree - Get paid to fix your neighborhood.',
  description: 'Clean loose trash. Water planters. Remove stickers. Do useful work, earn cash rewards, and help your block look better.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <RoleSwitcher />
        <main className="flex-1 flex flex-col">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </body>
    </html>
  );
}
