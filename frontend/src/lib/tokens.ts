/**
 * Design Tokens for Hookshot UI
 * Centralized design system tokens for consistent spacing, sizing, and styling
 */

export const tokens = {
  /**
   * Spacing scale (in Tailwind units)
   */
  spacing: {
    xs: '0.5', // 2px
    sm: '1', // 4px
    md: '2', // 8px
    lg: '3', // 12px
    xl: '4', // 16px
    '2xl': '6', // 24px
    '3xl': '8', // 32px
  },

  /**
   * List item tokens
   */
  listItem: {
    padding: '2', // p-2
    gap: '1.5', // gap-1.5
    borderRadius: 'rounded',
    borderWidth: '3', // border-l-3
  },

  /**
   * Badge tokens
   */
  badge: {
    padding: {
      sm: 'px-1 py-0.5',
      md: 'px-1.5 py-0.5',
      lg: 'px-2 py-1',
    },
    fontSize: {
      sm: 'text-[10px]',
      md: 'text-[11px]',
      lg: 'text-xs',
    },
    borderRadius: {
      sm: 'rounded-sm',
      md: 'rounded',
      lg: 'rounded-md',
    },
  },

  /**
   * Icon sizes
   */
  icon: {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-8 h-8',
  },

  /**
   * Button tokens
   */
  button: {
    padding: {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
      icon: 'p-2',
    },
    fontSize: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },

  /**
   * Transition durations
   */
  transition: {
    fast: 'duration-150',
    base: 'duration-200',
    slow: 'duration-300',
  },

  /**
   * Border radius scale
   */
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
} as const

/**
 * Semantic color tokens (using CSS variables)
 */
export const colors = {
  text: {
    primary: 'text-(--text-primary)',
    secondary: 'text-(--text-secondary)',
    tertiary: 'text-(--text-tertiary)',
  },
  bg: {
    primary: 'bg-(--background)',
    surface: 'bg-(--surface)',
    surfaceHover: 'bg-(--surface-hover)',
  },
  border: {
    default: 'border-(--border)',
  },
  accent: {
    blue: 'text-(--accent-blue)',
    green: 'text-(--accent-green)',
    yellow: 'text-(--accent-yellow)',
    red: 'text-(--accent-red)',
  },
} as const
