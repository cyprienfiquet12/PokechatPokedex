'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TWITCH_CHANNEL_URL, TWITCH_CHANNEL_NAME } from '@/lib/constants';
import { TwitchStream } from '@/components/TwitchStream';
import { useAuth } from '@/contexts/AuthContext';

const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

export default function HomePage() {
  const { appUser, loading, signInWithTwitch } = useAuth();
  const commentSectionRef = useRef<HTMLElement>(null);
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const section = commentSectionRef.current;
    if (!section) return;
    const updateArrow = () => {
      const top = section.getBoundingClientRect().top;
      setShowArrow(top > 80);
    };
    updateArrow();
    window.addEventListener('scroll', updateArrow, { passive: true });
    window.addEventListener('resize', updateArrow);
    return () => {
      window.removeEventListener('scroll', updateArrow);
      window.removeEventListener('resize', updateArrow);
    };
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Accueil : logo centré au-dessus, puis bloc contenu + lecteur côte à côte */}
      <section className="flex flex-col gap-10 py-12">
        {/* Logo centré au-dessus du reste */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Pokéchat Pokédex"
            width={200}
            height={200}
            className="h-auto w-48 object-contain sm:w-52"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,minmax(400px,560px)] lg:items-start">
          {/* Colonne gauche : titre, texte, boutons, CTA */}
          <div className="flex flex-col items-center gap-8 text-center lg:items-center lg:py-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Pokéchat <span className="text-pokemon-cream">Pokédex</span>
          </h1>
          <p className="max-w-md text-slate-400">
            Connecte-toi avec ton compte Twitch pour voir ton Pokédex, ton équipe et ton inventaire.
          </p>
          <div className="flex justify-center">
            {loading ? (
              <span className="flex items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 px-8 py-5 text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-pokemon-red" />
                Chargement…
              </span>
            ) : appUser ? (
              <Link
                href="/pokedex"
                className="card-pokemon flex items-center gap-3 rounded-xl border border-slate-600/50 bg-slate-800/60 px-8 py-5 font-semibold text-slate-100 transition hover:border-red-500/40 hover:shadow-glow"
              >
                <Image
                  src="/Pokeball.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                Voir mon pokedex
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => signInWithTwitch()}
                className="card-pokemon flex items-center gap-3 rounded-xl border border-slate-600/50 bg-slate-800/60 px-8 py-5 font-semibold text-slate-100 transition hover:border-red-500/40 hover:shadow-glow"
              >
                <Image
                  src="/Pokeball.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                Connecte-toi
              </button>
            )}
          </div>
          </div>

          {/* Colonne droite : lecteur Twitch + bouton Rejoindre le stream */}
          <div className="flex flex-col items-center lg:sticky lg:top-24">
            <div className="w-full max-w-xl">
              <TwitchStream channel={TWITCH_CHANNEL_NAME} className="w-full" />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Regarde le stream directement ici
            </p>
            <Link
              href={TWITCH_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex w-full max-w-xl items-center justify-center gap-3 rounded-2xl border-2 border-[#9146ff]/60 bg-[#9146ff]/20 px-6 py-4 transition hover:border-[#9146ff] hover:bg-[#9146ff]/30 hover:shadow-lg hover:shadow-[#9146ff]/20"
            >
              <TwitchIcon className="h-6 w-6 text-white" />
              <span className="font-bold text-white">Rejoindre le stream</span>
              <span className="text-white/80 transition group-hover:translate-x-0.5" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Flèche flottante : disparaît quand on dépasse le titre "Comment jouer ?" */}
      {showArrow && (
        <a
          href="#comment-jouer"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 justify-center transition hover:opacity-80"
          aria-label="Voir la suite du contenu"
        >
          <span className="animate-bounce text-slate-400">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </span>
        </a>
      )}

      {/* Documentation viewers */}
      <section id="comment-jouer" ref={commentSectionRef} className="mx-auto w-full max-w-3xl space-y-10 border-t border-slate-700/60 pt-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          Comment jouer ? 
        </h2>
          {/* Résumé nouveaux viewers */}
          <div className="rounded-2xl border border-pokemon-red/30 bg-slate-800/60 p-6">
          <h4 className="mb-4 font-semibold text-slate-100">
            En résumé pour les nouveaux viewers
          </h4>
          <ol className="list-inside list-decimal space-y-2 text-slate-400">
            <li><strong className="text-slate-300">Choisir un starter</strong> : écris <strong className="font-mono text-pokemon-cream">!start</strong> dans le chat, puis <strong className="font-mono text-pokemon-cream">!1</strong>, <strong className="font-mono text-pokemon-cream">!2</strong> ou <strong className="font-mono text-pokemon-cream">!3</strong> pour choisir ton premier Pokémon.</li>
            <li><strong className="text-slate-300">Acheter des Pokéballs</strong> : <strong className="font-mono text-pokemon-cream">!shop list</strong> pour voir la boutique, puis <strong className="font-mono text-pokemon-cream">!shop 1 pokéball</strong> (ou un autre nombre / objet) pour acheter.</li>
            <li><strong className="text-slate-300">Participer</strong> : quand un Pokémon apparaît à l’écran, utilise <strong className="font-mono text-pokemon-cream">!capture</strong>, <strong className="font-mono text-pokemon-cream">!combat</strong> ou <strong className="font-mono text-pokemon-cream">!fuite</strong> pour voter. Lors des arènes, <strong className="font-mono text-pokemon-cream">!combat</strong> ou <strong className="font-mono text-pokemon-cream">!fuite</strong> pour affronter ou fuir le champion.</li>
            <li><strong className="text-slate-300">Plus d’infos</strong> : <strong className="font-mono text-pokemon-cream">!pokéchat</strong> pour un rappel, <strong className="font-mono text-pokemon-cream">!pokéchat list</strong> pour toutes les commandes.</li>
          </ol>
          <p className="mt-4 text-slate-500 text-sm">
            Le <strong className="text-slate-400">widget overlay</strong> reprend ces étapes sous forme de slides pour que tout le monde puisse suivre même sans avoir lu ce guide.
          </p>
        </div>
        {/* Commandes – intro */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-200">
            Commandes en chat – Résumé
          </h3>
          <p className="text-slate-400">
            Toutes les commandes s’utilisent dans le <strong className="text-slate-300">chat Twitch</strong> du stream. Un délai (cooldown) peut s’appliquer entre deux utilisations de la même commande.
          </p>
        </div>

        {/* Démarrer */}
        <div className="space-y-3">
          <h4 className="font-semibold text-pokemon-cream">Démarrer</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="px-4 py-3 font-semibold text-slate-200">Commande</th>
                  <th className="px-4 py-3 font-semibold text-slate-200">Utilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!start</td>
                  <td className="px-4 py-3">Choisir ton premier Pokémon (starter). Le bot te propose 3 choix ; réponds avec <strong className="text-slate-300">!1</strong>, <strong className="text-slate-300">!2</strong> ou <strong className="text-slate-300">!3</strong> pour sélectionner.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!1, !2, !3</td>
                  <td className="px-4 py-3">Après <strong className="text-slate-300">!start</strong>, permet de choisir le starter correspondant (1, 2 ou 3).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Votes spawn / arène */}
        <div className="space-y-3">
          <h4 className="font-semibold text-pokemon-cream">Votes lors des événements (spawn / arène)</h4>
          <p className="text-slate-400">
            Quand un Pokémon sauvage apparaît à l’écran (ou un champion d’arène), tu peux voter pour décider de la suite :
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="px-4 py-3 font-semibold text-slate-200">Commande</th>
                  <th className="px-4 py-3 font-semibold text-slate-200">Utilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!capture</td>
                  <td className="px-4 py-3">Voter pour tenter de capturer le Pokémon. Tu peux préciser : <strong className="text-slate-300">pokéball</strong>, <strong className="text-slate-300">superball</strong>, <strong className="text-slate-300">hyperball</strong>, <strong className="text-slate-300">masterball</strong>.</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!combat / !battle</td>
                  <td className="px-4 py-3">Voter pour affronter le Pokémon (ou le champion d’arène). Un de tes Pokémon sera utilisé pour le combat.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!fuite / !flee</td>
                  <td className="px-4 py-3">Voter pour ne pas capturer ni combattre (fuir l’événement).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-sm">
            Lors d’une capture, si tu as plusieurs balls, le bot peut te demander laquelle utiliser ; réponds avec <strong className="text-slate-400">!1</strong>, <strong className="text-slate-400">!2</strong>, etc. selon la liste affichée.
          </p>
        </div>

        {/* Économie et boutique */}
        <div className="space-y-3">
          <h4 className="font-semibold text-pokemon-cream">Économie et boutique</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="px-4 py-3 font-semibold text-slate-200">Commande</th>
                  <th className="px-4 py-3 font-semibold text-slate-200">Utilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!shop list</td>
                  <td className="px-4 py-3">Afficher la liste des objets en vente et leurs prix (en Pokédollars).</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!shop [nombre] [objet]</td>
                  <td className="px-4 py-3">Acheter un objet. Exemple : <strong className="text-slate-300">!shop 5 pokéball</strong>.</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!pokedollars / !coins</td>
                  <td className="px-4 py-3">Voir ton solde de Pokédollars.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!inventaire / !inventory</td>
                  <td className="px-4 py-3">Voir le contenu de ton inventaire (balls, objets, etc.).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Équipe et Pokémon */}
        <div className="space-y-3">
          <h4 className="font-semibold text-pokemon-cream">Équipe et Pokémon</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="px-4 py-3 font-semibold text-slate-200">Commande</th>
                  <th className="px-4 py-3 font-semibold text-slate-200">Utilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!team</td>
                  <td className="px-4 py-3">Afficher les Pokémon de ton équipe.</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!soin / !heal</td>
                  <td className="px-4 py-3">Soigner tous les Pokémon de ton équipe (remettre les PV au maximum).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!evolution / !evolve</td>
                  <td className="px-4 py-3">Voir la liste de tes Pokémon prêts à évoluer. Ensuite, choisis avec <strong className="text-slate-300">!1</strong>, <strong className="text-slate-300">!2</strong>, etc.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-sm">
            <strong className="text-slate-400">!1</strong>, <strong className="text-slate-400">!2</strong>, <strong className="text-slate-400">!3</strong> servent aussi à : choisir un starter après !start ; choisir une ball lors d’une capture ; choisir un Pokémon à faire évoluer ou pour le combat quand le bot le demande.
          </p>
        </div>

        {/* Badges et classement */}
        <div className="space-y-3">
          <h4 className="font-semibold text-pokemon-cream">Badges et classement</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="px-4 py-3 font-semibold text-slate-200">Commande</th>
                  <th className="px-4 py-3 font-semibold text-slate-200">Utilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr>
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!badge / !badges</td>
                  <td className="px-4 py-3">Afficher les badges que tu as débloqués (arènes, défis, etc.).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-400">
            En participant aux <strong className="text-slate-300">!capture</strong> et <strong className="text-slate-300">!combat</strong> (et en gagnant des combats), tu peux progresser et apparaître dans le <strong className="text-slate-300">classement</strong> affiché par le stream.
          </p>
        </div>

        {/* Aide */}
        <div className="space-y-3">
          <h4 className="font-semibold text-pokemon-cream">Aide et informations</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="px-4 py-3 font-semibold text-slate-200">Commande</th>
                  <th className="px-4 py-3 font-semibold text-slate-200">Utilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!pokéchat</td>
                  <td className="px-4 py-3">Message d’accueil et explication rapide du système (votes, arènes, etc.).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-pokemon-cream">!pokéchat list</td>
                  <td className="px-4 py-3">Afficher la liste de toutes les commandes disponibles dans le chat.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
