
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

// --- CONFIGURAÇÃO ---
// Adicione aqui as chaves de 4 dígitos que seu aplicativo aceitará.
const ACCESS_KEYS: string[] = ["8352", "5819", "2743", "9067", "1482"];

// Chave mestra para resetar o tempo de bloqueio (não dá acesso, apenas libera a tela).
const MASTER_UNLOCK_KEY = '6894';

// Nomes usados para salvar os dados no localStorage do navegador.
const UNLOCKED_KEY_PREFIX = 'myapp_unlocked_status';
const ACTIVE_KEY_STORAGE = 'myapp_active_key';
const FAILED_ATTEMPTS_KEY = 'myapp_failed_attempts';
const LOCKOUT_END_TIME_KEY = 'myapp_lockout_end_time';

// Tempos de bloqueio em minutos (aumenta a cada tentativa errada após as 3 primeiras).
const lockoutTimes = [1, 2, 5, 10, 30]; 


// --- TIPOS E INTERFACES ---
interface AuthContextType {
  isLocked: boolean;
  unlockApp: (key: string) => boolean;
  lockApp: () => void;
  activeKey: string | null;
  storageKeys: { [key: string]: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- FUNÇÕES AUXILIARES ---
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};


// --- COMPONENTE PRINCIPAL (PROVIDER) ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<string | null>(() => getInitialState<string | null>(ACTIVE_KEY_STORAGE, null));
  
  // Efeito para verificar o estado inicial ao carregar a página
  useEffect(() => {
    const savedActiveKey = localStorage.getItem(ACTIVE_KEY_STORAGE);
    if (savedActiveKey) {
        const unlockedStatus = localStorage.getItem(`${UNLOCKED_KEY_PREFIX}_${savedActiveKey}`);
        if (unlockedStatus === 'true') {
            setActiveKey(savedActiveKey);
            setIsLocked(false);
        } else {
            lockApp(); // Garante que o estado esteja limpo se algo estiver inconsistente
        }
    } else {
        setIsLocked(true);
    }
  }, []);

  // Cria caminhos de coleção dinâmicos baseados na chave ativa.
  // Adapte para as necessidades do seu app.
  const storageKeys = {
    sensors: activeKey ? `users/${activeKey}/sensors` : '',
    alerts: activeKey ? `users/${activeKey}/alerts` : '',
    lots: activeKey ? `users/${activeKey}/lots` : '',
  };

  const unlockApp = (key: string): boolean => {
    if (ACCESS_KEYS.includes(key)) {
      localStorage.setItem(`${UNLOCKED_KEY_PREFIX}_${key}`, 'true');
      localStorage.setItem(ACTIVE_KEY_STORAGE, key);
      setActiveKey(key);
      setIsLocked(false);
      // Reseta as tentativas falhas no sucesso
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_END_TIME_KEY);
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

  return (
    <AuthContext.Provider value={{ isLocked, unlockApp, lockApp, activeKey, storageKeys }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- HOOK CUSTOMIZADO ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
