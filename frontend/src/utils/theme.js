/**
 * File: frontend/src/utils/theme.js
 * Purpose: Theme context — light / dark toggle, persisted in localStorage.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('nist_theme') === 'dark'; }
    catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('nist_theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Theme colour palettes
export const themes = {
  light: {
    bg:          '#f5f7f5',
    card:        '#ffffff',
    sidebar:     '#1a1a1a',
    topbar:      '#ffffff',
    border:      '#e8ede8',
    text:        '#1a1a1a',
    textMuted:   '#6b7280',
    inputBg:     '#f9fafb',
    inputBorder: '#e5e7eb',
    green:       '#7bc67e',
    greenDark:   '#5a9e5e',
    greenBg:     '#f0faf0',
  },
  dark: {
    bg:          '#0f1210',
    card:        '#1c2420',
    sidebar:     '#111714',
    topbar:      '#1c2420',
    border:      '#2a3a2a',
    text:        '#e8f5e9',
    textMuted:   '#7a9e7a',
    inputBg:     '#162018',
    inputBorder: '#2a3a2a',
    green:       '#7bc67e',
    greenDark:   '#9ed4a0',
    greenBg:     '#162018',
  },
};
