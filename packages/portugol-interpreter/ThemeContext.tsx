"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ThemeSettings } from '../types/theme';

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (settings: ThemeSettings | ((prev: ThemeSettings) => ThemeSettings)) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<ThemeSettings>('idealg-theme', {
    mode: 'dark',
    accentColor: '#8b5cf6',
  });

  const toggleTheme = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
  }, [theme.mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
};