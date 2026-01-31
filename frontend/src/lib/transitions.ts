/**
 * Hardware-accelerated transitions
 * CSS-only, using transform and opacity for 60fps GPU acceleration
 */

export const transitions = {
  fast: 'transition-smooth',
  normal: 'transition-smooth',
  slow: 'transition-smooth',
} as const

export const animations = {
  fadeIn: 'fade-in',
  slideIn: 'slide-in',
  pulse: 'pulse',
} as const
