import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '@/types';
import { useColorScheme } from 'react-native';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useTheme = () => {
  const systemTheme = useColorScheme() as Theme;
  const { theme, setTheme, toggleTheme } = useThemeStore();
  
  return {
    theme,
    systemTheme,
    setTheme,
    toggleTheme,
  };
};