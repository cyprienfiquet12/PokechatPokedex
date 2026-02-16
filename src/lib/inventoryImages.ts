/**
 * Images d'objets d'inventaire dans /public.
 * Priorité aux fichiers locaux, sinon fallback sur sprite_url de la BDD.
 */
const PUBLIC_ITEM_IMAGES: Record<string, string> = {
  pokeball: '/Pokeball.png',
  pokéball: '/Pokeball.png',
  'poké ball': '/Pokeball.png',
  'poke ball': '/Pokeball.png',
  'super ball': '/Superball.png',
  superball: '/Superball.png',
  super: '/Superball.png',
  'hyper ball': '/Hyperball.png',
  hyperball: '/Hyperball.png',
  hyper: '/Hyperball.png',
  'master ball': '/Masterball.png',
  masterball: '/Masterball.png',
  master: '/Masterball.png',
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

/**
 * Retourne l'URL d'image pour un objet d'inventaire :
 * - si un fichier correspondant existe dans /public (par nom), on le renvoie ;
 * - sinon on renvoie sprite_url (BDD) ou null.
 */
export function getInventoryItemImageUrl(
  item: { name: string; sprite_url?: string | null } | null | undefined
): string | null {
  if (!item?.name) return item?.sprite_url ?? null;
  const key = normalizeName(item.name);
  const publicPath = PUBLIC_ITEM_IMAGES[key];
  if (publicPath) return publicPath;
  return item.sprite_url ?? null;
}
