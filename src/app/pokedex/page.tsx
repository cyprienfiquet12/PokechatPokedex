'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { TypeBadge } from '@/components/TypeBadge';
import { useTypes } from '@/hooks/useTypes';

interface PokedexEntry {
  id: number;
  pokedex_id: number;
  name: string;
  type_1: string;
  type_2: string | null;
  sprite_url: string | null;
  image_url: string | null;
  rarity: string;
  captured: boolean;
  first_captured_at: string | null;
}

const PAGE_SIZE = 48;

export default function PokedexPage() {
  const { typesByName } = useTypes();
  const [pokemons, setPokemons] = useState<PokedexEntry[]>([]);
  const [stats, setStats] = useState<{ total: number; captured: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/pokedex/stats')
      .then((res) => res.json())
      .then((data) => setStats({ total: data.total ?? 0, captured: data.captured ?? 0 }))
      .catch(() => setStats(null));
  }, []);

  const loadingMoreRef = useRef(false);
  const loadPage = useCallback(async (offset: number, append: boolean) => {
    if (offset === 0) setLoading(true);
    else {
      setLoadingMore(true);
      loadingMoreRef.current = true;
    }
    try {
      const res = await fetch(
        `/api/pokedex?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = await res.json();
      const list = data.pokemons ?? [];
      setPokemons((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length === PAGE_SIZE);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage(0, false);
  }, [loadPage]);

  const lengthRef = useRef(0);
  lengthRef.current = pokemons.length;

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingMoreRef.current || !hasMore) return;
        const offset = lengthRef.current;
        if (offset === 0) return;
        loadPage(offset, true);
      },
      { rootMargin: '200px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadPage]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-100">
            Pokédex
          </h1>
          <p className="text-slate-400">
            Parcours le catalogue et repère ceux que tu as déjà capturés.
          </p>
        </div>
        {stats != null && (
          <div className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-5 py-3">
            <span className="text-2xl font-bold text-green-400">{stats.captured}</span>
            <span className="mx-2 text-slate-500">/</span>
            <span className="text-2xl font-bold text-slate-200">{stats.total}</span>
            <span className="ml-2 text-sm text-slate-500">capturés</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
          Chargement…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {pokemons.map((p) => (
              <a
                key={`${p.id}-${p.pokedex_id}`}
                href={`/pokedex/${p.pokedex_id}`}
                className="card-pokemon group flex flex-col items-center rounded-xl border border-slate-600/50 bg-slate-800/50 p-4 transition"
              >
                <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-slate-900/80 shadow-inner-screen">
                  {p.sprite_url || p.image_url ? (
                    <Image
                      src={p.sprite_url || p.image_url || ''}
                      alt={p.name}
                      width={72}
                      height={72}
                      className="object-contain transition group-hover:scale-105"
                      unoptimized={p.sprite_url?.startsWith('http')}
                    />
                  ) : (
                    <span className="text-3xl text-slate-600">?</span>
                  )}
                  {p.captured && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow"
                      title="Capturé"
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span className="mt-2 truncate text-center text-sm font-semibold text-slate-100">
                  #{String(p.pokedex_id).padStart(3, '0')} {p.name}
                </span>
                <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                  <TypeBadge typeName={p.type_1} typesByName={typesByName} size="sm" />
                  {p.type_2 && (
                    <TypeBadge typeName={p.type_2} typesByName={typesByName} size="sm" />
                  )}
                </div>
                <span className={`badge-type mt-0.5 rarity-${p.rarity}`}>
                  {p.rarity}
                </span>
              </a>
            ))}
          </div>
          <div ref={sentinelRef} className="flex h-12 items-center justify-center py-4">
            {loadingMore && (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
