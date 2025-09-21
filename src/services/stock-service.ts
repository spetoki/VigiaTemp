
'use server';

import { db } from '@/lib/firebase';
import type { StockItem, StockItemFormData } from '@/types';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';

const stockItemFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): StockItem => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    category: data.category,
    quantity: data.quantity,
    unit: data.unit,
    supplier: data.supplier,
    lastUpdated: (data.lastUpdated as Timestamp).toDate().toISOString(),
  };
};

export async function getStockItems(collectionPath: string): Promise<StockItem[]> {
  if (!db || !collectionPath.startsWith('users/')) {
    console.warn('Firestore is not configured or collection path is invalid. Returning empty stock list.');
    return [];
  }
  try {
    const stockCol = collection(db, collectionPath);
    const q = query(stockCol, orderBy('lastUpdated', 'desc'));
    const stockSnapshot = await getDocs(q);
    return stockSnapshot.docs.map(stockItemFromDoc);
  } catch (error) {
    console.error('Error fetching stock items from Firestore:', error);
    throw new Error('Não foi possível carregar os itens do estoque.');
  }
}

export async function addStockItem(collectionPath: string, itemData: StockItemFormData): Promise<StockItem> {
  if (!db || !collectionPath.startsWith('users/')) {
    throw new Error('Firestore não está configurado. Não é possível adicionar o item.');
  }
  const stockCol = collection(db, collectionPath);
  const newItemPayload = {
    ...itemData,
    lastUpdated: Timestamp.now(),
  };
  const docRef = await addDoc(stockCol, newItemPayload);
  return {
    ...newItemPayload,
    id: docRef.id,
    lastUpdated: newItemPayload.lastUpdated.toDate().toISOString(),
  };
}

export async function updateStockItem(collectionPath: string, itemId: string, itemData: StockItemFormData): Promise<void> {
  if (!db || !collectionPath.startsWith('users/')) {
    throw new Error('Firestore não está configurado. Não é possível atualizar o item.');
  }
  const itemDoc = doc(db, collectionPath, itemId);
  await updateDoc(itemDoc, {
    ...itemData,
    lastUpdated: Timestamp.now(),
  });
}

export async function deleteStockItem(collectionPath: string, itemId: string): Promise<void> {
  if (!db || !collectionPath.startsWith('users/')) {
    throw new Error('Firestore não está configurado. Não é possível excluir o item.');
  }
  const itemDoc = doc(db, collectionPath, itemId);
  await deleteDoc(itemDoc);
}


export async function adjustStockItemQuantity(collectionPath: string, itemId: string, amount: number): Promise<void> {
  if (!db || !collectionPath.startsWith('users/')) {
    throw new Error('Firestore não está configurado. Não é possível ajustar o estoque.');
  }
  const itemDocRef = doc(db, collectionPath, itemId);

  try {
    await runTransaction(db, async (transaction) => {
      const itemDoc = await transaction.get(itemDocRef);
      if (!itemDoc.exists()) {
        throw new Error("Item do estoque não encontrado.");
      }
      
      const currentQuantity = itemDoc.data().quantity || 0;
      const newQuantity = currentQuantity + amount;

      if (newQuantity < 0) {
        throw new Error("A quantidade em estoque não pode ser negativa.");
      }

      transaction.update(itemDocRef, { 
        quantity: newQuantity,
        lastUpdated: Timestamp.now() 
      });
    });
  } catch (error) {
     console.error("Transaction failed: ", error);
     if (error instanceof Error) {
        throw error;
     }
     throw new Error("Ocorreu um erro ao atualizar o estoque.");
  }
}

    