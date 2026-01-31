/**
 * Transition and animation utility constants
 * These provide consistent timing and easing across the application
 * All animations are optimized for 60fps using transform and opacity only
 */

/**
 * Transition duration classes for smooth property changes
 * - fast: 150ms for instant feedback (hover states, toggles)
 * - normal: 200ms for standard UI transitions (color changes, size changes)
 * - slow: 300ms for complex animations (slide-ins, fade-ins)
 */
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
} as const;

/**
 * Animation classes for entrance and loading effects
 * - fadeIn: Simple opacity transition (200ms)
 * - slideIn: Slide from right with fade (300ms)
 * - pulse: Subtle pulsing effect for loading states (2s loop)
 */
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-right duration-300',
  pulse: 'animate-pulse',
} as const;

/**
 * Performance-optimized animation properties
 * Only use transform and opacity for 60fps animations
 */
export const PERF_SAFE_PROPS = ['transform', 'opacity'] as const;
