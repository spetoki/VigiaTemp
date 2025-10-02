
'use server';

import { getDb } from './db';
import { collection, doc, getDoc, setDoc, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore';
import type { UserFormData } from '@/types';

const ADMIN_USER_EMAIL = 'admin@vigiatemp.com';

/**
 * Garante que a estrutura básica para uma chave de acesso exista no Firestore.
 * Cria o documento do usuário principal e o usuário administrador padrão, se não existirem.
 * @param accessKey A chave de acesso atual.
 */
export async function initializeAdminUser(accessKey: string): Promise<void> {
  if (!accessKey) {
    console.error('[Init Service] Chave de acesso inválida.');
    return;
  }

  const db = getDb();
  const userDocRef = doc(db, 'users', accessKey);
  const usersSubCollectionRef = collection(userDocRef, 'users');

  try {
    const userDocSnap = await getDoc(userDocRef);

    // Etapa 1: Verificar e criar o documento principal da chave de acesso, se necessário.
    if (!userDocSnap.exists()) {
      console.log(`[Init Service] Documento para a chave ${accessKey} não existe. Criando...`);
      await setDoc(userDocRef, {
        createdAt: serverTimestamp(),
        owner: `user_of_${accessKey}`
      });
      console.log(`[Init Service] Documento principal para a chave ${accessKey} criado.`);
    }

    // Etapa 2: Verificar se o usuário admin já existe na subcoleção.
    const adminQuery = query(usersSubCollectionRef);
    const querySnapshot = await getDocs(adminQuery);

    if (querySnapshot.empty) {
      console.log(`[Init Service] Subcoleção 'users' está vazia para a chave ${accessKey}. Criando usuário admin...`);
      
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

      await addDoc(usersSubCollectionRef, dataToSave);
      console.log(`[Init Service] Usuário administrador criado com sucesso para a chave ${accessKey}.`);
    } else {
      console.log(`[Init Service] Usuários já existem para a chave ${accessKey}. Nenhuma ação necessária.`);
    }

  } catch (error) {
    console.error(`[Init Service] Erro ao inicializar o usuário administrador para a chave ${accessKey}:`, error);
  }
}
