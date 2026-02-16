'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive
          ? 'bg-slate-700/80 text-pokemon-cream'
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { appUser, loading, signInWithTwitch, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <Image
            src="/logo.png"
            alt="Pokéchat Pokédex"
            width={100}
            height={100}
            className="h-20 w-20 object-contain"
          />
          <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Pokéchat Pokédex
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/pokedex">Pokédex</NavLink>
          <NavLink href="/equipe">Mon équipe</NavLink>
          <NavLink href="/inventaire">Inventaire</NavLink>
          <NavLink href="/classement">Classement</NavLink>
          {loading ? (
            <span className="ml-2 text-sm text-slate-500">Chargement…</span>
          ) : appUser ? (
            <div className="ml-3 flex items-center gap-2">
              <span className="rounded-lg bg-slate-700/60 px-3 py-1.5 text-sm text-slate-200">
                {appUser.username}
                <span className="ml-1.5 text-pokemon-cream-dim">Lv.{appUser.level}</span>
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInWithTwitch()}
              className="ml-2 flex items-center gap-2 rounded-xl bg-[#9146ff] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#772ce8] hover:shadow-[#9146ff]/30"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
              Connexion Twitch
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
