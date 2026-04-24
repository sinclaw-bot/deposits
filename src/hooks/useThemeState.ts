import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'deposits-theme';
const HIDE_KEY = 'deposits-hide-amounts';

export function useThemeState() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [hideAmounts, setHideAmounts] = useState(() => {
    return localStorage.getItem(HIDE_KEY) === 'true';
  });

  const setTheme = useCallback((t: Theme | 'telegram') => {
    const resolved = t === 'telegram' ? 'light' : t;
    setThemeState(resolved);
    localStorage.setItem(THEME_STORAGE_KEY, resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const toggleHideAmounts = useCallback(() => {
    setHideAmounts(prev => {
      const next = !prev;
      localStorage.setItem(HIDE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return { theme, hideAmounts, setTheme, toggleTheme, toggleHideAmounts };
}
