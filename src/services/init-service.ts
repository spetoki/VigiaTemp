
'use server';

import { getDb } from './db';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import type { User, UserFormData } from '@/types';

const ADMIN_USER_EMAIL = 'admin@vigiatemp.com';

/**
 * Verifica se o usuário administrador padrão já existe para a chave de acesso.
 * Se não existir, ele o cria.
 * @param accessKey A chave de acesso atual.
 */
export async function initializeAdminUser(accessKey: string): Promise<void> {
  if (!accessKey) {
    console.error('[Init Service] Chave de acesso inválida.');
    return;
  }

  const usersCollectionPath = `users/${accessKey}/users`;
  
  try {
    const db = getDb();
    const usersCol = collection(db, usersCollectionPath);
    
    // 1. Verifica se a coleção de usuários para esta chave de acesso já possui algum usuário.
    // Uma verificação mais simples para evitar múltiplas leituras.
    const snapshot = await getDocs(query(usersCol));

    if (!snapshot.empty) {
      // Coleção já tem dados, assume-se que o admin já foi (ou será) criado.
      console.log(`[Init Service] A coleção de usuários para a chave ${accessKey} já existe. Nenhuma ação necessária.`);
      return;
    }

    // 2. Se a coleção estiver vazia, cria o usuário admin.
    console.log(`[Init Service] Criando usuário administrador padrão para a nova chave ${accessKey}...`);
    
    const adminUserData: UserFormData = {
      name: 'Admin Padrão',
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
