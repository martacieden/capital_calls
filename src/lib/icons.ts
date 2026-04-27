import * as TablerIcons from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'

/**
 * Typed lookup for Tabler icons by string name.
 *
 * Replaces the unsafe `(Icons as any)[name]` pattern used across the codebase.
 * Returns the icon component if found, or the provided fallback.
 *
 * @param name - Icon name string (e.g., 'IconHome', 'IconFileText')
 * @param fallback - Fallback icon component (defaults to IconFile)
 *
 * @example
 * const CatIcon = getIcon(category.icon) // IconFile if not found
 * const CatIcon = getIcon(category.icon, TablerIcons.IconFolder) // IconFolder if not found
 */
export function getIcon(name: string | undefined | null, fallback: Icon = TablerIcons.IconFile): Icon {
  if (!name) return fallback
  const icon = (TablerIcons as Record<string, unknown>)[name]
  return (icon != null ? icon : fallback) as Icon
}
