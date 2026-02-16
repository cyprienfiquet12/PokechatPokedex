import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TypeBadgesClient } from '@/components/TypeBadgesClient';

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pokedexId = parseInt(id, 10);
  if (Number.isNaN(pokedexId)) notFound();

  const admin = createAdminClient();
  // Utiliser pokedex_id (numéro national) pour que l'URL corresponde aux données affichées
  const { data: pokemon, error } = await admin
    .from('pokemons')
    .select('*')
    .eq('pokedex_id', pokedexId)
    .single();

  if (error || !pokemon) notFound();

  const pokemonPk = pokemon.id;

  const { data: nextEvolutions } = await admin
    .from('pokemon_evolutions')
    .select('evolution_pokedex_id, evolution_name')
    .eq('pokemon_id', pokemonPk);

  const evolutionPokedexIds = (nextEvolutions ?? []).map((e) => e.evolution_pokedex_id);
  let nextEvolutionPokemons: { id: number; pokedex_id: number; name: string; sprite_url: string | null; image_url: string | null }[] = [];
  if (evolutionPokedexIds.length > 0) {
    const { data: nextPokes } = await admin
      .from('pokemons')
      .select('id, pokedex_id, name, sprite_url, image_url')
      .in('pokedex_id', evolutionPokedexIds);
    nextEvolutionPokemons = nextPokes ?? [];
  }

  let preEvolution: { id: number; pokedex_id: number; name: string; sprite_url: string | null; image_url: string | null } | null = null;
  if (pokemon.pre_evolution_pokedex_id != null) {
    const { data: pre } = await admin
      .from('pokemons')
      .select('id, pokedex_id, name, sprite_url, image_url')
      .eq('pokedex_id', pokemon.pre_evolution_pokedex_id)
      .single();
    preEvolution = pre ?? null;
  }

  let captured = false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const providerId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
    const { data: appUser } = await admin.from('users').select('id').eq('twitch_id', String(providerId)).single();
    if (appUser) {
      const { data: entry } = await admin.from('user_pokedex').select('first_captured_at').eq('user_id', appUser.id).eq('pokemon_id', pokemonPk).single();
      captured = !!entry;
    }
  }

  const hasEvolutions = preEvolution != null || nextEvolutionPokemons.length > 0 || (pokemon.evolution_details != null && pokemon.evolution_details.trim() !== '');

  return (
    <div className="max-w-3xl">
      <Link
        href="/pokedex"
        className="mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-pokemon-cream"
      >
        ← Retour au Pokédex
      </Link>

      {/* En-tête type fiche Pokédex */}
      <div className="border-b border-slate-600 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono text-lg">
            #{String(pokemon.pokedex_id).padStart(3, '0')}
          </span>
          <h1 className="text-2xl font-bold text-slate-100">{pokemon.name}</h1>
          {captured && (
            <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
              Capturé
            </span>
          )}
        </div>
      </div>

      {/* Corps : sprite + infos en colonnes */}
      <div className="mt-6 grid gap-8 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/50 p-4">
            {pokemon.sprite_url || pokemon.image_url ? (
              <Image
                src={pokemon.sprite_url || pokemon.image_url || ''}
                alt={pokemon.name}
                width={180}
                height={180}
                className="object-contain"
                unoptimized
              />
            ) : (
              <span className="text-5xl text-slate-600">?</span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Type
            </h2>
            <div className="mt-1">
              <TypeBadgesClient type1={pokemon.type_1} type2={pokemon.type_2} size="md" />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rareté
            </h2>
            <p className={`mt-1 font-semibold rarity-${pokemon.rarity}`}>
              {pokemon.rarity}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stats de base
            </h2>
            <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {pokemon.base_hp != null && (
                <>
                  <dt className="text-slate-500">PV</dt>
                  <dd className="text-slate-200">{pokemon.base_hp}</dd>
                  {pokemon.base_attack != null && (
                    <>
                      <dt className="text-slate-500">Attaque</dt>
                      <dd className="text-slate-200">{pokemon.base_attack}</dd>
                    </>
                  )}
                  {pokemon.base_defense != null && (
                    <>
                      <dt className="text-slate-500">Défense</dt>
                      <dd className="text-slate-200">{pokemon.base_defense}</dd>
                    </>
                  )}
                  {pokemon.base_special_attack != null && (
                    <>
                      <dt className="text-slate-500">Att. Spé.</dt>
                      <dd className="text-slate-200">{pokemon.base_special_attack}</dd>
                    </>
                  )}
                  {pokemon.base_special_defense != null && (
                    <>
                      <dt className="text-slate-500">Déf. Spé.</dt>
                      <dd className="text-slate-200">{pokemon.base_special_defense}</dd>
                    </>
                  )}
                  {pokemon.base_speed != null && (
                    <>
                      <dt className="text-slate-500">Vitesse</dt>
                      <dd className="text-slate-200">{pokemon.base_speed}</dd>
                    </>
                  )}
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Évolutions */}
      {hasEvolutions && (
        <section className="mt-10 border-t border-slate-600 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Évolution
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {preEvolution && (
              <>
                <Link
                  href={`/pokedex/${preEvolution.pokedex_id}`}
                  className="flex flex-col items-center rounded-lg border border-slate-600 bg-slate-800/50 p-3 transition hover:border-slate-500 hover:bg-slate-700/50"
                >
                  <div className="relative h-16 w-16">
                    {preEvolution.sprite_url || preEvolution.image_url ? (
                      <Image
                        src={preEvolution.sprite_url || preEvolution.image_url || ''}
                        alt={preEvolution.name}
                        width={64}
                        height={64}
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-700 text-2xl text-slate-500">?</div>
                    )}
                  </div>
                  <span className="mt-1 text-xs text-slate-400">#{String(preEvolution.pokedex_id).padStart(3, '0')}</span>
                  <span className="text-sm font-medium text-slate-200">{preEvolution.name}</span>
                </Link>
                <span className="text-slate-500">→</span>
              </>
            )}

            <div className="flex flex-col items-center rounded-lg border-2 border-pokemon-red/50 bg-slate-800/70 px-4 py-3">
              <div className="relative h-16 w-16">
                {pokemon.sprite_url || pokemon.image_url ? (
                  <Image
                    src={pokemon.sprite_url || pokemon.image_url || ''}
                    alt={pokemon.name}
                    width={64}
                    height={64}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-700 text-2xl text-slate-500">?</div>
                )}
              </div>
              <span className="mt-1 text-xs text-slate-400">#{String(pokemon.pokedex_id).padStart(3, '0')}</span>
              <span className="text-sm font-bold text-slate-100">{pokemon.name}</span>
            </div>

            {nextEvolutionPokemons.length > 0 && (
              <>
                <span className="text-slate-500">→</span>
                {nextEvolutionPokemons.map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/pokedex/${ev.pokedex_id}`}
                    className="flex flex-col items-center rounded-lg border border-slate-600 bg-slate-800/50 p-3 transition hover:border-slate-500 hover:bg-slate-700/50"
                  >
                    <div className="relative h-16 w-16">
                      {ev.sprite_url || ev.image_url ? (
                        <Image
                          src={ev.sprite_url || ev.image_url || ''}
                          alt={ev.name}
                          width={64}
                          height={64}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-700 text-2xl text-slate-500">?</div>
                      )}
                    </div>
                    <span className="mt-1 text-xs text-slate-400">#{String(ev.pokedex_id).padStart(3, '0')}</span>
                    <span className="text-sm font-medium text-slate-200">{ev.name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {pokemon.evolution_details != null && pokemon.evolution_details.trim() !== '' && (
            <div className="mt-4 rounded-lg border border-slate-600 bg-slate-800/30 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Condition d’évolution
              </h3>
              <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">
                {pokemon.evolution_details}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
