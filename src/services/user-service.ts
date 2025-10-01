
'use server';

import { getDb } from '@/lib/firebase';
import type { User, UserFormData } from '@/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface UserDocument extends Omit<User, 'id' | 'createdAt'> {
    createdAt: Timestamp;
}

export async function getUsers(collectionPath: string): Promise<User[]> {
    if (!collectionPath) return [];
    try {
        const db = getDb();
        const usersCol = collection(db, collectionPath);
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => {
            const data = doc.data() as UserDocument;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
        return userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
        throw new Error("Não foi possível buscar os usuários.");
    }
}

export async function addUser(collectionPath: string, userData: UserFormData): Promise<User> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    
    const dataToSave = {
        ...userData,
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, collectionPath), dataToSave);
    
    return {
        id: docRef.id,
        ...userData,
        createdAt: new Date().toISOString(),
    };
}

export async function updateUser(collectionPath: string, userId: string, userData: Partial<UserFormData>): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    const userRef = doc(db, collectionPath, userId);
    await updateDoc(userRef, userData);
}

export async function deleteUser(collectionPath: string, userId: string): Promise<void> {
    if (!collectionPath) throw new Error("Caminho da coleção inválido.");
    const db = getDb();
    await deleteDoc(doc(db, collectionPath, userId));
}
