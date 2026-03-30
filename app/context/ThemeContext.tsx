import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light, dark, type Theme } from '@/app/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  colorScheme: 'light' | 'dark';
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = '@cedi:themeMode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      } catch {
        // ignore storage errors, fall back to system
      }
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // best-effort persistence
    });
  }, []);

  const colorScheme: 'light' | 'dark' = useMemo(() => {
    if (mode === 'light' || mode === 'dark') return mode;
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }, [mode, systemColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colorScheme,
      theme: colorScheme === 'dark' ? dark : light,
      setMode,
    }),
    [mode, colorScheme, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

