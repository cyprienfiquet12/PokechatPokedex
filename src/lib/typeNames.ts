/**
 * Correspondance noms de types EN <-> FR pour matcher la BDD (français)
 * et les sprites éventuellement nommés en anglais.
 */
export const TYPE_NAME_EN_TO_FR: Record<string, string> = {
  Fire: 'Feu',
  Water: 'Eau',
  Grass: 'Plante',
  Electric: 'Électrik',
  Ice: 'Glace',
  Fighting: 'Combat',
  Poison: 'Poison',
  Ground: 'Sol',
  Flying: 'Vol',
  Psychic: 'Psy',
  Bug: 'Insecte',
  Rock: 'Roche',
  Ghost: 'Spectre',
  Dragon: 'Dragon',
  Dark: 'Ténèbres',
  Steel: 'Acier',
  Fairy: 'Fée',
  Normal: 'Normal',
};

export const TYPE_NAME_FR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_NAME_EN_TO_FR).map(([en, fr]) => [fr, en])
);

/** Tous les alias (FR et EN) pour un type : [nameEn, nameFr] */
export const TYPE_ALIASES: [string, string][] = Object.entries(
  TYPE_NAME_EN_TO_FR
).map(([en, fr]) => [en, fr]);
