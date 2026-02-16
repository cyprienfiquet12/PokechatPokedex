/**
 * Types alignés sur le schéma Supabase (tables public)
 */

export type PokemonRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Pokemon {
  id: number;
  pokedex_id: number;
  name: string;
  type_1: string;
  type_2: string | null;
  base_hp: number;
  base_attack: number;
  base_defense: number | null;
  base_special_attack: number | null;
  base_special_defense: number | null;
  base_speed: number | null;
  rarity: PokemonRarity;
  capture_rate: number;
  spawn_weight: number;
  sprite_url: string | null;
  image_url: string | null;
  slug: string | null;
  generation: number | null;
  pre_evolution_pokedex_id: number | null;
  experience_growth: string | null;
  experience_growth_total: number | null;
  evolution_details: string | null;
  created_at?: string;
}

export interface User {
  id: number;
  twitch_id: string;
  username: string;
  xp: number;
  level: number;
  poke_coins: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserPokemon {
  id: number;
  user_id: number;
  pokemon_id: number;
  level: number;
  xp: number;
  current_hp: number;
  is_shiny: boolean;
  captured_at: string;
  is_ko: boolean;
}

export interface UserPokedexEntry {
  user_id: number;
  pokemon_id: number;
  first_captured_at: string;
}

export interface UserInventoryItem {
  id: number;
  user_id: number;
  item_id: number;
  quantity: number;
}

export interface ShopItem {
  id: number;
  name: string;
  price: number;
  effect_type: string;
  effect_value: number;
  description: string | null;
  sprite_url: string | null;
  created_at?: string;
}

/** Pour les jointures équipe + pokemon */
export interface UserPokemonWithDetails extends UserPokemon {
  pokemon?: Pokemon;
}

/** Pour le Pokédex avec indicateur capturé */
export interface PokemonWithCaptured extends Pokemon {
  captured?: boolean;
  first_captured_at?: string | null;
}
