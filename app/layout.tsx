import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ERD Compiler',
  description: 'Extreme-Size URL-Safe Payload Encoding Database Schema Designer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-slate-900 bg-white">
        {children}
      </body>
    </html>
  );
}
