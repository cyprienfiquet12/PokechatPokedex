import Link from 'next/link';
import { TWITCH_CHANNEL_URL } from '@/lib/constants';

const TwitchIcon = () => (
  <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-700/50 bg-slate-900/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-center text-sm text-slate-500">
          Pokéchat Pokédex · Données liées à ton compte Twitch
        </p>
        <Link
          href={TWITCH_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-xl bg-[#9146ff] px-5 py-2.5 font-semibold text-white shadow-lg transition hover:bg-[#772ce8] hover:shadow-[#9146ff]/40 hover:scale-[1.02]"
        >
          <TwitchIcon />
          <span>Rejoindre le live</span>
          <span className="text-white/80 transition group-hover:translate-x-0.5" aria-hidden>→</span>
        </Link>
      </div>
    </footer>
  );
}
