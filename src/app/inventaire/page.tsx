'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { getInventoryItemImageUrl } from '@/lib/inventoryImages';

interface InventoryItem {
  id: number;
  user_id: number;
  item_id: number;
  quantity: number;
  shop_items: {
    id: number;
    name: string;
    price: number;
    effect_type: string;
    description: string | null;
    sprite_url: string | null;
  } | null;
}

export default function InventairePage() {
  const { appUser, loading: authLoading } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => setInventory(data.inventory ?? []))
      .catch(() => setInventory([]))
      .finally(() => setLoading(false));
  }, [appUser]);

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
        <h1 className="mb-2 text-2xl font-bold text-slate-100">Inventaire</h1>
        <p className="mb-6 text-slate-400">
          Connecte-toi avec Twitch pour voir ton inventaire.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Connexion Twitch
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-100">
            Inventaire
          </h1>
          <p className="text-slate-400">
            Objets en ta possession.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-3">
          <span className="text-lg" aria-hidden>💰</span>
          <span className="font-semibold text-amber-200">
            {appUser.poke_coins.toLocaleString()}
          </span>
          <span className="text-slate-400">Pokédollars</span>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
          Chargement…
        </div>
      ) : inventory.length === 0 ? (
        <div className="card-pokemon rounded-xl border border-slate-600/50 bg-slate-800/40 p-8 text-center">
          <p className="text-slate-500">Ton inventaire est vide.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {inventory.map((row) => {
            const itemImgUrl = getInventoryItemImageUrl(row.shop_items);
            return (
            <div
              key={row.id}
              className="card-pokemon flex items-center gap-6 rounded-2xl border border-slate-600/50 bg-slate-800/50 p-6"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-900/80 shadow-inner-screen">
                {itemImgUrl ? (
                  <Image
                    src={itemImgUrl}
                    alt={row.shop_items?.name ?? 'Objet'}
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized={!itemImgUrl.startsWith('/')}
                  />
                ) : (
                  <span className="text-4xl text-slate-600">🎒</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-semibold text-slate-100">
                  {row.shop_items?.name ?? 'Objet'}
                </p>
                <p className="mt-1 text-base text-slate-500">x{row.quantity}</p>
                {row.shop_items?.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {row.shop_items.description}
                  </p>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
