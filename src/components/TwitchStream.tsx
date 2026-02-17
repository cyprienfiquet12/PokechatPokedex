'use client';

import { useEffect, useState } from 'react';

interface TwitchStreamProps {
  channel: string;
  className?: string;
}

/**
 * Embed lecteur Twitch. Utilise le hostname actuel pour le paramètre parent (requis par Twitch).
 */
export function TwitchStream({ channel, className = '' }: TwitchStreamProps) {
  const [parent, setParent] = useState<string | null>(null);

  useEffect(() => {
    setParent(typeof window !== 'undefined' ? window.location.hostname : null);
  }, []);

  if (!parent) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-xl border border-slate-600/50 bg-slate-800/60 ${className}`}
      >
        <span className="text-slate-500">Chargement du lecteur…</span>
      </div>
    );
  }

  const embedUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}`;

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900 shadow-xl ${className}`}>
      <iframe
        src={embedUrl}
        title="Stream Twitch"
        allowFullScreen
        className="aspect-video w-full"
      />
    </div>
  );
}
