import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'deposits-theme';
const HIDE_KEY = 'deposits-hide-amounts';

export function useThemeState() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [hideAmounts, setHideAmounts] = useState(() => {
    return localStorage.getItem(HIDE_KEY) === 'true';
  });

  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
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
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, hideAmounts, setTheme, toggleTheme, toggleHideAmounts };
}
