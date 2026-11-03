/**
 * Utility sinh màu nền avatar đa sắc nhất quán (deterministic) dựa trên chuỗi tên hoặc email.
 * Phù hợp với chủ đề outdoor/nature của renTrek.
 */

const PALETTES = [
  { bg: '#047857', text: '#ffffff' }, // Forest Emerald
  { bg: '#0d9488', text: '#ffffff' }, // Teal Lake
  { bg: '#0284c7', text: '#ffffff' }, // Sky Blue
  { bg: '#4f46e5', text: '#ffffff' }, // Deep Indigo
  { bg: '#7c3aed', text: '#ffffff' }, // Alpine Violet
  { bg: '#c026d3', text: '#ffffff' }, // Wild Orchid
  { bg: '#d97706', text: '#ffffff' }, // Campfire Amber
  { bg: '#ea580c', text: '#ffffff' }, // Sunrise Orange
  { bg: '#e11d48', text: '#ffffff' }, // Canyon Rose
  { bg: '#334155', text: '#ffffff' }, // Slate Mountain
];

export function getAvatarColor(identifier = 'renTrek') {
  if (!identifier) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}
