import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'HeatGuard AI | Sunstroke Detection & Emergency Alert System',
  description: 'AI-powered real-time sunstroke risk assessment and emergency alert system using wearable health data.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30">
        <FirebaseClientProvider>
          <Navbar />
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}