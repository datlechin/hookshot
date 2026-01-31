/**
 * Design System Tokens
 * Based on GitHub Dark Dimmed + Geist Mono + 8px grid
 */

// 8px spacing system
export const spacing = {
  xs: 'var(--space-1)',  // 8px
  sm: 'var(--space-2)',  // 16px
  md: 'var(--space-3)',  // 24px
  lg: 'var(--space-4)',  // 32px
  xl: 'var(--space-5)',  // 40px
  '2xl': 'var(--space-6)', // 48px
} as const

// Typography scale
export const fontSize = {
  xs: '11px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
} as const

// Hardware-accelerated transition presets
export const transitions = {
  fast: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// Animation classes
export const animations = {
  fadeIn: 'fade-in',
  slideIn: 'slide-in',
  pulse: 'pulse',
} as const

// Colors from GitHub Dark Dimmed
export const colors = {
  background: 'var(--background)',
  surface: 'var(--surface)',
  surfaceHover: 'var(--surface-hover)',
  border: 'var(--border)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',
  blue: 'var(--accent-blue)',
  green: 'var(--accent-green)',
  red: 'var(--accent-red)',
  yellow: 'var(--accent-yellow)',
  orange: 'var(--accent-orange)',
  purple: 'var(--accent-purple)',
} as const
