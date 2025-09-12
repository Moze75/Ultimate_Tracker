// Type definitions for D&D Ultimate Tracker

export interface Player {
  id: string;
  user_id: string;
  name: string;
  adventurer_name?: string;
  class?: string | DndClass;
  subclass?: string;
  level: number;
  race?: string;
  background?: string;
  alignment?: string;
  max_hp: number;
  current_hp: number;
  temporary_hp: number;
  avatar_url?: string;
  stats?: PlayerStats;
  abilities?: Ability[];
  spell_slots?: SpellSlots;
  class_resources?: ClassResources;
  created_at?: string;
  updated_at?: string;
}

export interface PlayerStats {
  armor_class: number;
  initiative: number;
  speed: number;
  proficiency_bonus: number;
  inspirations?: number;
}

export interface Ability {
  name: string;
  score: number;
  modifier?: number;
  proficient?: boolean;
}

export interface InventoryItem {
  id: string;
  player_id: string;
  name: string;
  quantity: number;
  description?: string;
  weight?: number;
  value?: number;
  equipped?: boolean;
  item_type?: string;
}

export interface Attack {
  id: string;
  player_id: string;
  name: string;
  attack_bonus: number;
  damage_dice: string;
  damage_bonus: number;
  damage_type: string;
  range?: string;
  description?: string;
}

export interface DndClass {
  name: string;
  description?: string;
  hit_die: string;
  primary_ability: string;
  subclasses?: DndSubclass[];
}

export interface DndSubclass {
  name: string;
  description?: string;
  class_name: string;
  features?: DndFeature[];
}

export interface DndFeature {
  name: string;
  level: number;
  description: string;
}

export interface PlayerBackground {
  name: string;
  description?: string;
  skill_proficiencies?: string[];
  language_proficiencies?: string[];
  equipment?: string[];
}

export interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

export interface KnownSpell {
  id: string;
  player_id: string;
  spell_id: string;
  spell_name: string;
  spell_level: number;
  spell_school?: string;
  spell_description?: string;
  always_prepared?: boolean;
}

export interface SpellSlots {
  level1?: number;
  level2?: number;
  level3?: number;
  level4?: number;
  level5?: number;
  level6?: number;
  level7?: number;
  level8?: number;
  level9?: number;
  used1?: number;
  used2?: number;
  used3?: number;
  used4?: number;
  used5?: number;
  used6?: number;
  used7?: number;
  used8?: number;
  used9?: number;
}

export interface ClassResources {
  [key: string]: number;
}