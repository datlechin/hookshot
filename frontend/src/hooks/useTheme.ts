import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

/**
 * Custom hook for managing dark/light theme with localStorage persistence
 *
 * Priority:
 * 1. Check localStorage for saved preference
 * 2. Fall back to system preference
 * 3. Default to 'dark' if no preference detected
 *
 * @returns Object containing current theme and toggleTheme function
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored as Theme;
    }

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to dark
    return 'dark';
  });

  useEffect(() => {
    // Persist theme to localStorage
    localStorage.setItem('theme', theme);

    // Toggle dark class on document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
