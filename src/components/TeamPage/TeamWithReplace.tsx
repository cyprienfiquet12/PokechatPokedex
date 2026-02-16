'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { TypeBadge } from '@/components/TypeBadge';
import { useTypes } from '@/hooks/useTypes';

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

export interface CapturedEntry {
  pokemon_id: number;
  first_captured_at: string;
  pokemons: {
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

type TypesByName = Record<string, { id: number; name: string; sprite_url: string | null }>;

interface TeamWithReplaceProps {
  team: TeamPokemon[];
  captured: CapturedEntry[];
  onReplace: (userPokemonId: number, newPokemonId: number) => Promise<void>;
  onRefresh: () => void;
}

export function TeamWithReplace({
  team,
  captured,
  onReplace,
  onRefresh,
}: TeamWithReplaceProps) {
  const { typesByName } = useTypes();
  const [activeCaptured, setActiveCaptured] = useState<CapturedEntry | null>(null);

  const teamPokemonIds = new Set(team.map((t) => t.pokemon_id));
  const capturedFiltered = captured.filter(
    (c) => !teamPokemonIds.has(c.pokemon_id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith('captured-')) {
      const pokemonId = parseInt(id.replace('captured-', ''), 10);
      const entry = capturedFiltered.find((c) => c.pokemon_id === pokemonId);
      setActiveCaptured(entry ?? null);
    }
  }, [capturedFiltered]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveCaptured(null);
      const { active, over } = event;
      if (!over) return;
      const overId = String(over.id);
      const activeId = String(active.id);
      if (!activeId.startsWith('captured-') || !overId.startsWith('team-')) return;
      const newPokemonId = parseInt(activeId.replace('captured-', ''), 10);
      const userPokemonId = parseInt(overId.replace('team-', ''), 10);
      await onReplace(userPokemonId, newPokemonId);
      onRefresh();
    },
    [onReplace, onRefresh]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-200">
            Ton équipe
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Glisse un Pokémon capturé sur un slot pour le remplacer.
          </p>
          <div className="flex flex-col gap-3">
            {team.length === 0 ? (
              <div className="card-pokemon rounded-xl border border-slate-600/50 bg-slate-800/40 p-6 text-center">
                <p className="text-slate-500">
                  Aucun Pokémon en équipe. Les captures se font via le stream.
                </p>
              </div>
            ) : (
              team.map((up) => (
                <TeamSlot
                  key={up.id}
                  userPokemon={up}
                  typesByName={typesByName}
                />
              ))
            )}
          </div>
        </div>

        <div className="hidden flex-shrink-0 items-center lg:flex">
          <div
            className="h-full min-h-[200px] w-px bg-slate-600"
            aria-hidden
          />
        </div>
        <div className="border-t border-slate-600 pt-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">
            Choix possibles
          </h2>
          <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-2">
            {capturedFiltered.length === 0 ? (
              <p className="text-slate-500">
                Aucun pokémon disponible.
              </p>
            ) : (
              capturedFiltered.map((entry) => (
                <CapturedRow
                  key={entry.pokemon_id}
                  entry={entry}
                  typesByName={typesByName}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCaptured?.pokemons ? (
          <div className="card-pokemon flex items-center gap-4 rounded-xl border-2 border-pokemon-red/50 bg-slate-800/95 p-4 shadow-xl">
            {(activeCaptured.pokemons.sprite_url || activeCaptured.pokemons.image_url) ? (
              <Image
                src={
                  activeCaptured.pokemons.sprite_url ||
                  activeCaptured.pokemons.image_url ||
                  ''
                }
                alt={activeCaptured.pokemons.name}
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-slate-700" />
            )}
            <div>
              <p className="font-semibold text-slate-100">
                {activeCaptured.pokemons.name}
              </p>
              <div className="mt-0.5 flex gap-1">
                <TypeBadge
                  typeName={activeCaptured.pokemons.type_1}
                  typesByName={typesByName}
                  size="sm"
                />
                {activeCaptured.pokemons.type_2 && (
                  <TypeBadge
                    typeName={activeCaptured.pokemons.type_2}
                    typesByName={typesByName}
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function TeamSlot({
  userPokemon,
  typesByName,
}: {
  userPokemon: TeamPokemon;
  typesByName: TypesByName;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${userPokemon.id}`,
  });
  const p = userPokemon.pokemons;

  return (
    <div
      ref={setNodeRef}
      className={`card-pokemon flex items-center gap-4 rounded-xl border-2 p-4 transition ${
        isOver
          ? 'border-pokemon-red bg-slate-700/80'
          : 'border-slate-600/50 bg-slate-800/50'
      }`}
    >
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 shadow-inner-screen">
        {p && (p.sprite_url || p.image_url) ? (
          <Image
            src={p.sprite_url || p.image_url || ''}
            alt={p.name}
            width={56}
            height={56}
            className="object-contain"
            unoptimized
          />
        ) : (
          <span className="text-xl text-slate-600">?</span>
        )}
        {userPokemon.is_shiny && (
          <span className="absolute -right-0.5 -top-0.5 rounded bg-amber-400 px-1 py-0.5 text-[10px] font-bold text-slate-900">
            ★
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-100">{p?.name ?? '?'}</p>
        <p className="text-sm text-slate-500">
          Niv. {userPokemon.level} · PV {userPokemon.current_hp}
        </p>
        {p?.type_1 && (
          <div className="mt-1 flex gap-1">
            <TypeBadge typeName={p.type_1} typesByName={typesByName} size="sm" />
            {p.type_2 && (
              <TypeBadge typeName={p.type_2} typesByName={typesByName} size="sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CapturedRow({
  entry,
  typesByName,
}: {
  entry: CapturedEntry;
  typesByName: TypesByName;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `captured-${entry.pokemon_id}`,
    data: { pokemonId: entry.pokemon_id },
  });
  const p = entry.pokemons;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card-pokemon flex cursor-grab items-center gap-3 rounded-xl border border-slate-600/50 bg-slate-800/50 p-3 active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'hover:border-slate-500'
      }`}
    >
      {p && (p.sprite_url || p.image_url) ? (
        <Image
          src={p.sprite_url || p.image_url || ''}
          alt={p.name}
          width={40}
          height={40}
          className="shrink-0 object-contain"
          unoptimized
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-700" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-100">{p?.name ?? '?'}</p>
        <div className="flex gap-1">
          <TypeBadge typeName={p?.type_1 ?? ''} typesByName={typesByName} size="sm" />
          {p?.type_2 && (
            <TypeBadge typeName={p.type_2} typesByName={typesByName} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}
