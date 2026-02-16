'use client';

import Image from 'next/image';
import { TypeBadgesClient } from '@/components/TypeBadgesClient';

export interface TeamPokemon {
  id: number;
  user_id: number;
  pokemon_id: number;
  level: number;
  xp: number;
  current_hp: number;
  is_shiny: boolean;
  captured_at: string;
  is_ko: boolean;
  pokemons?: {
    id: number;
    pokedex_id: number;
    name: string;
    type_1: string;
    type_2: string | null;
    sprite_url: string | null;
    image_url: string | null;
    base_hp: number | null;
    rarity: string;
  } | null;
}

interface TeamListProps {
  team: TeamPokemon[];
}

export function TeamList({ team }: TeamListProps) {
  if (team.length === 0) {
    return (
      <div className="card-pokemon rounded-xl border border-slate-600/50 bg-slate-800/40 p-8 text-center">
        <p className="text-slate-400">
          Tu n’as pas encore de Pokémon dans ton équipe. Les captures se font via le stream.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {team.map((up) => {
        const p = up.pokemons;
        return (
          <div
            key={up.id}
            className="card-pokemon flex flex-col items-center rounded-xl border border-slate-600/50 bg-slate-800/50 p-4"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-slate-900/80 shadow-inner-screen">
              {p && (p.sprite_url || p.image_url) ? (
                <Image
                  src={p.sprite_url || p.image_url || ''}
                  alt={p.name}
                  width={72}
                  height={72}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-2xl text-slate-600">?</span>
              )}
              {up.is_shiny && (
                <span className="absolute -right-1 -top-1 rounded bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-slate-900">
                  ★
                </span>
              )}
            </div>
            <p className="mt-2 text-center font-semibold text-slate-100">
              {p?.name ?? '?'}
            </p>
            <p className="text-sm text-slate-500">Niv. {up.level}</p>
            {p?.type_1 && (
              <div className="mt-1 flex justify-center">
                <TypeBadgesClient
                  type1={p.type_1}
                  type2={p.type_2}
                  size="sm"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
