'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { TeamList } from '@/components/TeamPage/TeamList';
import { getInventoryItemImageUrl } from '@/lib/inventoryImages';
import type { TeamPokemon } from '@/components/TeamPage/TeamList';

interface ViewerUser {
  id: number;
  username: string;
  poke_coins: number;
}

interface ViewerTeamItem {
  id: number;
  pokemon_id: number;
  level: number;
  current_hp: number;
  is_shiny: boolean;
  pokemons: {
    id: number;
    pokedex_id: number;
    name: string;
    type_1: string;
    type_2: string | null;
    sprite_url: string | null;
    image_url: string | null;
  } | null;
}

interface ViewerBadge {
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

interface ViewerInventoryItem {
  id: number;
  item_id: number;
  quantity: number;
  shop_items: {
    id: number;
    name: string;
    description: string | null;
    sprite_url: string | null;
  } | null;
}

interface ViewerData {
  user: ViewerUser;
  team: ViewerTeamItem[];
  badges: ViewerBadge[];
  inventory: ViewerInventoryItem[];
}

export default function ViewerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = typeof params.userId === 'string' ? params.userId : '';
  const [data, setData] = useState<ViewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/viewer/${userId}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Viewer introuvable');
          throw new Error('Erreur lors du chargement');
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
          Chargement du profil…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-slate-600/50 bg-slate-800/50 p-8 text-center">
        <p className="mb-4 text-slate-300">{error ?? 'Profil introuvable.'}</p>
        <button
          type="button"
          onClick={() => router.push('/classement')}
          className="btn-primary"
        >
          Retour au classement
        </button>
      </div>
    );
  }

  const teamForList: TeamPokemon[] = data.team.map((t) => ({
    id: t.id,
    user_id: data.user.id,
    pokemon_id: t.pokemon_id,
    level: t.level,
    xp: 0,
    current_hp: t.current_hp,
    is_shiny: t.is_shiny,
    captured_at: '',
    is_ko: false,
    pokemons: t.pokemons
      ? {
          ...t.pokemons,
          base_hp: null,
          rarity: '',
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Navigation */}
      <Link
        href="/classement"
        className="inline-block text-sm text-slate-400 transition hover:text-slate-200"
      >
        ← Retour au classement
      </Link>

      {/* Carte profil */}
      <header className="rounded-2xl border border-slate-600/50 bg-slate-800/50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {data.user.username}
          </h1>
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 px-4 py-2">
            <span className="text-lg" aria-hidden>💰</span>
            <span className="font-semibold text-amber-200">
              {data.user.poke_coins.toLocaleString()}
            </span>
            <span className="text-slate-400">Pokédollars</span>
          </div>
        </div>
      </header>

      {/* Sections en colonne unique */}
      <section className="rounded-2xl border border-slate-600/50 bg-slate-800/50 p-5">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-slate-400">
          Équipe
        </h2>
        <TeamList team={teamForList} />
      </section>

      <section className="rounded-2xl border border-slate-600/50 bg-slate-800/50 p-5">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-slate-400">
          Badges
        </h2>
        {data.badges.length === 0 ? (
          <p className="py-6 text-center text-slate-500">Aucun badge.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data.badges.map((ub) => {
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

      <section className="rounded-2xl border border-slate-600/50 bg-slate-800/50 p-5">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-slate-400">
          Inventaire
        </h2>
        {data.inventory.length === 0 ? (
          <p className="py-6 text-center text-slate-500">Inventaire vide.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.inventory.map((row) => {
              const itemImgUrl = getInventoryItemImageUrl(row.shop_items);
              return (
              <div
                key={row.id}
                className="flex items-center gap-4 rounded-xl bg-slate-900/40 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  {itemImgUrl ? (
                    <Image
                      src={itemImgUrl}
                      alt={row.shop_items?.name ?? 'Objet'}
                      width={40}
                      height={40}
                      className="object-contain"
                      unoptimized={!itemImgUrl.startsWith('/')}
                    />
                  ) : (
                    <span className="text-xl text-slate-500">🎒</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-200">
                    {row.shop_items?.name ?? 'Objet'}
                  </p>
                  <p className="text-sm text-slate-500">x{row.quantity}</p>
                  {row.shop_items?.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                      {row.shop_items.description}
                    </p>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
