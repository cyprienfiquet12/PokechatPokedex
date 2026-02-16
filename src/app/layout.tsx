import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

export const dynamic = 'force-dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Pokéchat Pokédex',
  description: 'Pokédex et gestion d’équipe Pokémon pour viewers Twitch',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-pokemon text-slate-100`}>
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
