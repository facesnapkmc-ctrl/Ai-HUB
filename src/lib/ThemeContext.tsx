/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, type ReactNode } from 'react';

type ThemeMode = 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'dark';
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const setTheme = () => {
    // No-op since we only support dark theme
  };

  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark', setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
