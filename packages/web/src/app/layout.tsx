import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { LocaleProvider } from '@/components/locale-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LevelUp.log',
  description: 'Turn your daily tasks into game-like achievements. Your age is your level.',
  openGraph: {
    title: 'LevelUp.log',
    description: 'Turn your daily tasks into game-like achievements.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <LocaleProvider>
          <Nav />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
