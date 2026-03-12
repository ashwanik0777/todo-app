import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { loadTheme, saveTheme, StoredTheme } from '../storage/themeStorage';

type ThemeContextValue = {
  theme: StoredTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { setColorScheme } = useNativeWindColorScheme();
  const [theme, setTheme] = useState<StoredTheme>('light');

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await loadTheme();
      const nextTheme = saved ?? 'light';
      setTheme(nextTheme);
      setColorScheme(nextTheme);
    };

    void bootstrap();
  }, [setColorScheme]);

  const toggleTheme = () => {
    const nextTheme: StoredTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setColorScheme(nextTheme);
    void saveTheme(nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
