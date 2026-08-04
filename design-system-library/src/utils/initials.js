/* =============================================================================
   Convert a display name to up to 2 initials.
   "Jane Doe"        → "JD"
   "Javier"          → "J"
   "Jane Marie Doe"  → "JD"   (first + last word)
   ""                → ""     (caller falls back to placeholder)
   ============================================================================= */

export function getInitials(name) {
  if (!name) return '';
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  const first = words[0].charAt(0);
  const last = words[words.length - 1].charAt(0);
  return (first + last).toUpperCase();
}
