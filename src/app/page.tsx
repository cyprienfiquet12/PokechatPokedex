import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-20 text-center">
      <div className="">
        <Image
          src="/logo.png"
          alt="Pokéchat Pokédex"
          width={200}
          height={200}
          className="h-full w-full object-contain"
        />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
        Pokéchat <span className="text-pokemon-cream">Pokédex</span>
      </h1>
      <p className="max-w-md text-slate-400">
        Connecte-toi avec ton compte Twitch pour voir ton Pokédex, ton équipe et ton inventaire.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/pokedex"
          className="card-pokemon flex min-w-[160px] flex-col items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 px-8 py-5 font-semibold text-slate-100 transition hover:border-red-500/40 hover:shadow-glow"
        >
          <span className="text-2xl" aria-hidden>📖</span>
          Voir le Pokédex
        </Link>
        <Link
          href="/equipe"
          className="card-pokemon flex min-w-[160px] flex-col items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 px-8 py-5 font-semibold text-slate-100 transition hover:border-red-500/40 hover:shadow-glow"
        >
          <span className="text-2xl" aria-hidden>⚔️</span>
          Mon équipe
        </Link>
        <Link
          href="/inventaire"
          className="card-pokemon flex min-w-[160px] flex-col items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 px-8 py-5 font-semibold text-slate-100 transition hover:border-red-500/40 hover:shadow-glow"
        >
          <span className="text-2xl" aria-hidden>🎒</span>
          Inventaire
        </Link>
      </div>
    </div>
  );
}
