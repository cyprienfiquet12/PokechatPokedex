'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  TeamWithReplace,
  type TeamPokemon,
  type CapturedEntry,
} from '@/components/TeamPage/TeamWithReplace';
import Link from 'next/link';

interface BadgeEntry {
  id: number;
  badge_id: number;
  earned_at: string;
  badges: {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    sprite_url: string | null;
  } | null;
}

export default function EquipePage() {
  const { appUser, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<TeamPokemon[]>([]);
  const [captured, setCaptured] = useState<CapturedEntry[]>([]);
  const [badges, setBadges] = useState<BadgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!appUser) return;
    setLoading(true);
    setError(null);
    try {
      const [teamRes, capturedRes, badgesRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/team/captured'),
        fetch('/api/badges'),
      ]);
      if (!teamRes.ok) {
        const d = await teamRes.json().catch(() => ({}));
        throw new Error(d.error ?? 'Erreur équipe');
      }
      if (!capturedRes.ok) {
        const d = await capturedRes.json().catch(() => ({}));
        throw new Error(d.error ?? 'Erreur capturés');
      }
      const teamData = await teamRes.json();
      const capturedData = await capturedRes.json();
      const badgesData = badgesRes.ok ? await badgesRes.json() : { badges: [] };
      setTeam(teamData.team ?? []);
      setCaptured(capturedData.captured ?? []);
      setBadges(badgesData.badges ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }, [appUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReplace = useCallback(
    async (userPokemonId: number, newPokemonId: number) => {
      const res = await fetch('/api/team/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPokemonId, newPokemonId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erreur remplacement');
      }
    },
    []
  );

  if (authLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
        Chargement…
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="card-pokemon rounded-2xl border border-slate-600/50 bg-slate-800/50 p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-slate-100">Mon équipe</h1>
        <p className="mb-6 text-slate-400">
          Connecte-toi avec Twitch pour voir et gérer ton équipe.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Connexion Twitch
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-100">
        Mon équipe
      </h1>
      <p className="mb-6 text-slate-400">
        Remplace un Pokémon de ton équipe en glissant une espèce capturée dessus (niveau et PV sont réinitialisés).
      </p>
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-red-200">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
          Chargement…
        </div>
      ) : (
        <>
          <TeamWithReplace
            team={team}
            captured={captured}
            onReplace={handleReplace}
            onRefresh={fetchData}
          />
          <section className="mt-8 rounded-2xl border border-slate-600/50 bg-slate-800/50 p-5">
            <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-slate-400">
              Badges
            </h2>
            {badges.length === 0 ? (
              <p className="py-6 text-center text-slate-500">Aucun badge.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {badges.map((ub) => {
                  const b = ub.badges;
                  const img = b?.sprite_url ?? b?.image_url;
                  return (
                    <div
                      key={ub.id}
                      className="flex flex-col items-center rounded-xl bg-slate-900/40 p-4 text-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                        {img ? (
                          <Image
                            src={img}
                            alt={b?.name ?? 'Badge'}
                            width={40}
                            height={40}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xl text-slate-500">🏅</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-200">
                        {b?.name ?? 'Badge'}
                      </p>
                      {b?.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {b.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
