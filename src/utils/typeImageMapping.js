/**
 * Mapping des types Pokémon à leurs ID (pour les images)
 * Les images des types sont nommées 1.png, 2.png, ... 18.png
 */
export const TYPE_IMAGE_MAP = {
  'Normal': 1,
  'Fire': 2,
  'Water': 3,
  'Grass': 4,
  'Flying': 5,
  'Fight': 6,
  'Fighting': 6,
  'Poison': 7,
  'Ground': 8,
  'Rock': 9,
  'Bug': 10,
  'Ghost': 11,
  'Steel': 12,
  'Psychic': 13,
  'Ice': 14,
  'Dragon': 15,
  'Dark': 16,
  'Fairy': 17,
  'Unknow': 18,
  'Unknown': 18,
};

/**
 * Récupère le numéro du type pour construire le chemin de l'image
 * @param {string} typeName - Nom du type (ex: "Fire", "Water")
 * @returns {number} ID du type (1-18)
 */
export const getTypeImageId = (typeName) => {
  return TYPE_IMAGE_MAP[typeName] || 18; // Par défaut, Unknown
};

/**
 * Construit le chemin complet vers l'image du type
 * @param {string} typeName - Nom du type
 * @returns {string} Chemin de l'image (ex: "/assets/types/2.png")
 */
export const getTypeImagePath = (typeName) => {
  const typeId = getTypeImageId(typeName);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${API_BASE}/assets/types/${typeId}.png`;
};

/**
 * Construit le chemin complet vers l'image du Pokémon
 * @param {number} pokemonId - ID du Pokémon
 * @returns {string} Chemin de l'image (ex: "/assets/pokemons/25.png")
 */
export const getPokemonImagePath = (pokemonId) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${API_BASE}/assets/pokemons/${pokemonId}.png`;
};
