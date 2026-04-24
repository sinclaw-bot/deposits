import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@gravity-ui/uikit';
import { tg } from '../lib/telegram';

const THEME_STORAGE_KEY = 'deposits-theme';

export type ThemeOption = 'light' | 'dark' | 'telegram';

function resolveTelegramTheme(option: ThemeOption): Theme {
  if (option === 'telegram') {
    return tg?.colorScheme === 'dark' ? 'dark' : 'light';
  }
  return option;
}

export function useThemeState() {
  const [themeOption, setThemeOption] = useState<ThemeOption>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'telegram' || saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const theme: Theme = resolveTelegramTheme(themeOption);

  const setTheme = useCallback((option: ThemeOption) => {
    setThemeOption(option);
    localStorage.setItem(THEME_STORAGE_KEY, option);
  }, []);

  const toggleTheme = useCallback(() => {
    if (themeOption === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [themeOption, setTheme]);

  // sync to localStorage on change
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeOption);
  }, [themeOption]);

  return { theme, themeOption, setTheme, toggleTheme };
}
