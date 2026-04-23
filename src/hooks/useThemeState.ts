import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'deposits-theme';

export function useThemeState() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // sync to localStorage on change
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
