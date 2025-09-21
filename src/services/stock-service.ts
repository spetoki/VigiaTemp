
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
    const q = query(stockCol, orderBy('name', 'asc'));
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
