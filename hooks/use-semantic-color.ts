import { SemanticColors, type SemanticColorKey } from '@/constants/semantic-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Returns the semantic color value for the current theme (light/dark).
 * Components should use this hook instead of referencing primitive tokens directly.
 */
export function useSemanticColor(key: SemanticColorKey): string {
  const scheme = useColorScheme() ?? 'light';
  return SemanticColors[scheme][key];
}

/**
 * Returns a getter function for semantic colors — useful when you need multiple colors
 * without calling the hook multiple times.
 */
export function useSemanticColors(): (key: SemanticColorKey) => string {
  const scheme = useColorScheme() ?? 'light';
  return (key: SemanticColorKey) => SemanticColors[scheme][key];
}
