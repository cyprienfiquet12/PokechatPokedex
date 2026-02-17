import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

export const dynamic = 'force-dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Pokéchat Pokédex',
  description: 'Pokédex et gestion d’équipe Pokémon pour viewers Twitch',
  icons: {
    icon: [{ url: '/icone.png', type: 'image/png' }],
    apple: '/icone.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${outfit.variable} flex min-h-screen flex-col font-sans antialiased bg-pokemon text-slate-100`}>
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
