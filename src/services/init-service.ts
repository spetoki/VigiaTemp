
'use server';

import { getDb } from './db';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import type { User, UserFormData } from '@/types';

const ADMIN_USER_EMAIL = 'admin@vigiatemp.com';
const ADMIN_ACCESS_KEY = '8352';

/**
 * Verifica se o usuário administrador padrão já existe para a chave de acesso principal.
 * Se não existir, ele o cria.
 * @param accessKey A chave de acesso atual.
 */
export async function initializeAdminUser(accessKey: string): Promise<void> {
  // Executa a lógica apenas para a chave de acesso principal
  if (accessKey !== ADMIN_ACCESS_KEY) {
    return;
  }

  const usersCollectionPath = `users/${accessKey}/users`;
  
  try {
    const db = getDb();
    const usersCol = collection(db, usersCollectionPath);
    
    // 1. Verifica se o usuário admin já existe
    const q = query(usersCol, where("email", "==", ADMIN_USER_EMAIL));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Admin já existe, não faz nada
      console.log(`[Init Service] Usuário administrador para a chave ${accessKey} já existe.`);
      return;
    }

    // 2. Se não existir, cria o usuário admin
    console.log(`[Init Service] Criando usuário administrador padrão para a chave ${accessKey}...`);
    
    const adminUserData: UserFormData = {
      name: 'Admin VigiaTemp',
      email: ADMIN_USER_EMAIL,
      role: 'admin',
      status: 'active',
    };

    const dataToSave = {
      ...adminUserData,
      createdAt: serverTimestamp(),
    };

    await addDoc(usersCol, dataToSave);

    console.log(`[Init Service] Usuário administrador criado com sucesso para a chave ${accessKey}.`);

  } catch (error) {
    console.error(`[Init Service] Erro ao inicializar o usuário administrador para a chave ${accessKey}:`, error);
  }
}
