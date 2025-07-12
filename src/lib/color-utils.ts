const colorPalette: { bg: string; text: string }[] = [
  { bg: 'bg-blue-600', text: 'text-blue-50' },
  { bg: 'bg-emerald-600', text: 'text-emerald-50' },
  { bg: 'bg-purple-600', text: 'text-purple-50' },
  { bg: 'bg-red-600', text: 'text-red-50' },
  { bg: 'bg-amber-500', text: 'text-amber-950' },
  { bg: 'bg-indigo-600', text: 'text-indigo-50' },
  { bg: 'bg-pink-600', text: 'text-pink-50' },
  { bg: 'bg-teal-600', text: 'text-teal-50' },
  { bg: 'bg-orange-600', text: 'text-orange-50' },
  { bg: 'bg-cyan-600', text: 'text-cyan-50' },
];

/**
 * Genera un hash numérico simple a partir de una cadena.
 * @param str La cadena de entrada (ej: ID del personaje).
 * @returns Un hash numérico no negativo.
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convertir a entero de 32 bits
  }
  return Math.abs(hash);
};

/**
 * Obtiene un par de colores (fondo y texto) para un ID de personaje dado.
 * El color es consistente para el mismo ID.
 * @param characterId El ID del personaje.
 * @returns Un objeto con las clases de Tailwind para `bg` y `text`.
 */
export const getCharacterColor = (characterId: string): { bg: string; text: string } => {
  if (!characterId) {
    return { bg: 'bg-gray-500', text: 'text-white' }; // Color por defecto
  }
  const hash = simpleHash(characterId);
  const index = hash % colorPalette.length;
  return colorPalette[index];
};