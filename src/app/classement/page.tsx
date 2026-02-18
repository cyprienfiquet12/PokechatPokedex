'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  level: number;
  xp: number;
  poke_coins: number;
  captured_count: number;
}

function fetchLeaderboard() {
  const url = `/api/leaderboard?_t=${Date.now()}`;
  return fetch(url, {
    cache: 'no-store',
    credentials: 'omit',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
    .then((res) => res.json())
    .then((data) => (data.leaderboard ?? []) as LeaderboardEntry[]);
}

export default function ClassementPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetchLeaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  // Chargement initial à l'arrivée sur la page
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refetch quand l'utilisateur revient sur l'onglet (évite le cache stale)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [refresh]);

  // Rafraîchissement automatique toutes les 30 s (compte de captures à jour)
  const POLL_INTERVAL_MS = 30 * 1000;
  useEffect(() => {
    const interval = setInterval(() => refresh(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-100">
          Classement
        </h1>
        <p className="text-slate-400">
          Classement des viewers selon le nombre de Pokémon capturés. Clique sur une ligne pour voir le profil du viewer.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
          Chargement du classement…
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-lg border border-slate-600 bg-slate-800/40 p-8 text-center">
          <p className="text-slate-500">Aucune capture enregistrée pour l’instant.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-600">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-600 bg-slate-800/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Rang
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Viewer
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pokémon capturés
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.user_id}
                  className={`cursor-pointer border-b border-slate-700/50 transition ${
                    appUser?.id === entry.user_id
                      ? 'bg-pokemon-red/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/classement/${entry.user_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/classement/${entry.user_id}`);
                    }
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        entry.rank === 1
                          ? 'bg-amber-500/20 text-amber-400'
                          : entry.rank === 2
                            ? 'bg-slate-400/20 text-slate-300'
                            : entry.rank === 3
                              ? 'bg-amber-700/30 text-amber-600'
                              : 'bg-slate-700/80 text-slate-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {entry.username}
                    {appUser?.id === entry.user_id && (
                      <span className="ml-2 text-xs text-slate-500">(toi)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-green-400">
                      {entry.captured_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
