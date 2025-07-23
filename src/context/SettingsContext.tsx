
"use client";

import type { TemperatureUnit, LanguageCode } from '@/types';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface Translations {
  [key: string]: string;
}

type Theme = 'light' | 'dark';

// This is the default key used if the text file isn't available.
const DEFAULT_ACCESS_KEY = '8352'; 
const UNLOCKED_KEY_PREFIX = 'vigiatemp_unlocked_status';
const ACTIVE_KEY_STORAGE = 'vigiatemp_active_key';


interface SettingsContextType {
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string, fallback?: string, replacements?: Record<string, string | number>) => string;
  isLocked: boolean;
  unlockApp: (key: string) => boolean;
  lockApp: () => void;
  activeKey: string | null;
  storageKeys: {
    sensors: string;
    alerts: string;
    lots: string;
    components: string;
    diagram: string;
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

async function importLocale(locale: LanguageCode): Promise<Translations> {
  const langShort = locale.split('-')[0];
  try {
    switch (langShort) {
      case 'en':
        return (await import('@/locales/en.json')).default;
      case 'es':
        return (await import('@/locales/es.json')).default;
      case 'pt':
      default:
        return (await import('@/locales/pt.json')).default;
    }
  } catch (error) {
    console.error(`Could not load locale: ${locale}`, error);
    if (locale !== 'pt-BR') {
        return (await import('@/locales/pt.json')).default; // Fallback to PT if EN or ES fails
    }
    return {};
  }
}

let ACCESS_KEYS: string[] = [DEFAULT_ACCESS_KEY];

// This logic now runs only on the server, preventing build errors.
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
        const fs = require('fs');
        const path = require('path');
        const keyFilePath = path.resolve(process.cwd(), 'chaves-de-desbloqueio.txt');
        const fileContent = fs.readFileSync(keyFilePath, 'utf-8');
        const keys = fileContent.match(/\b\d{4}\b/g);
        if (keys) {
            ACCESS_KEYS = keys;
        }
    } catch (error) {
        console.warn("Could not read 'chaves-de-desbloqueio.txt'. Falling back to default access key. Error:", error);
    }
}


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>('C');
  const [language, setLanguageState] = useState<LanguageCode>('pt-BR');
  const [theme, setThemeState] = useState<Theme>('light');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const storageKeys = {
    sensors: activeKey ? `${activeKey}_demo_sensors` : 'demo_sensors',
    alerts: activeKey ? `${activeKey}_demo_alerts` : 'demo_alerts',
    lots: activeKey ? `${activeKey}_demo_traceability_lots` : 'demo_traceability_lots',
    components: activeKey ? `${activeKey}_hardware_components` : 'hardware_components',
    diagram: activeKey ? `${activeKey}_hardware_diagram` : 'hardware_diagram'
  };

  useEffect(() => {
    // This effect runs once on mount to check initial state from localStorage
    const savedActiveKey = localStorage.getItem(ACTIVE_KEY_STORAGE);
    
    if (savedActiveKey) {
        // If there's an active key, check if it has an unlock flag
        const unlockedStatus = localStorage.getItem(`${UNLOCKED_KEY_PREFIX}_${savedActiveKey}`);
        if (unlockedStatus === 'true') {
            setIsLocked(false);
            setActiveKey(savedActiveKey);
        } else {
            // Key is present but not marked as unlocked, force lock
            setIsLocked(true);
            setActiveKey(null);
            localStorage.removeItem(ACTIVE_KEY_STORAGE);
        }
    } else {
        setIsLocked(true);
    }
    
    // Load other user preferences
    const storedUnit = localStorage.getItem('temperatureUnit') as TemperatureUnit | null;
    if (storedUnit) setTemperatureUnitState(storedUnit);

    const storedLang = localStorage.getItem('language') as LanguageCode | null;
    const initialLang = storedLang || 'pt-BR';
    setLanguageState(initialLang);
    loadTranslations(initialLang);

    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  useEffect(() => {
    // This effect handles applying the theme to the document
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }
  }, [theme]);
  
  const unlockApp = (key: string): boolean => {
    if (ACCESS_KEYS.includes(key)) {
      localStorage.setItem(`${UNLOCKED_KEY_PREFIX}_${key}`, 'true');
      localStorage.setItem(ACTIVE_KEY_STORAGE, key);
      setIsLocked(false);
      setActiveKey(key);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (activeKey) {
        localStorage.removeItem(`${UNLOCKED_KEY_PREFIX}_${activeKey}`);
    }
    localStorage.removeItem(ACTIVE_KEY_STORAGE);
    setIsLocked(true);
    setActiveKey(null);
  };

  const loadTranslations = useCallback(async (lang: LanguageCode) => {
    const loadedTranslations = await importLocale(lang);
    setTranslations(loadedTranslations);
  }, []);

  const setTemperatureUnit = (unit: TemperatureUnit) => {
    setTemperatureUnitState(unit);
    localStorage.setItem('temperatureUnit', unit);
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    loadTranslations(lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const t = useCallback((key: string, fallback?: string, replacements?: Record<string, string | number>): string => {
    let text = translations[key] || fallback || key;
    if (replacements) {
      for (const rKey in replacements) {
        text = text.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(replacements[rKey]));
      }
    }
    return text;
  }, [translations]);

  return (
    <SettingsContext.Provider value={{ temperatureUnit, setTemperatureUnit, language, setLanguage, theme, setTheme, t, isLocked, unlockApp, lockApp, activeKey, storageKeys }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
