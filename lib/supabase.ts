import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = "https://gmualcoqyztvtsqhjlzb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWFsY29xeXp0dnRzcWhqbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDg4NjIsImV4cCI6MjA2NjQyNDg2Mn0.qQxh6IPHrvDQ5Jsma42eHpRTjeG9vpa0rIkErPeCJe0";

// Provide a safe storage for web/SSR where AsyncStorage is unavailable
const isWeb = Platform.OS === 'web';
const isSSR = typeof window === 'undefined';
const safeStorage: any = isWeb && !isSSR
  ? {
      getItem: (key: string) => window.localStorage.getItem(key),
      setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
      removeItem: (key: string) => window.localStorage.removeItem(key),
      getItemAsync: async (key: string) => window.localStorage.getItem(key),
      setItemAsync: async (key: string, value: string) => window.localStorage.setItem(key, value),
      removeItemAsync: async (key: string) => window.localStorage.removeItem(key),
    }
  : {
      getItem: (_key: string) => null,
      setItem: (_key: string, _value: string) => {},
      removeItem: (_key: string) => {},
      getItemAsync: async (_key: string) => null,
      setItemAsync: async (_key: string, _value: string) => {},
      removeItemAsync: async (_key: string) => {},
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: isWeb ? safeStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});