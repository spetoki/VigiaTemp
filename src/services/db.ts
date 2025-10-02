
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBlH6j-IpV7w3JAwngeWAWZqi5iyftuNY",
  authDomain: "vigiatemp-91072.firebaseapp.com",
  projectId: "vigiatemp-91072",
  storageBucket: "vigiatemp-91072.appspot.com",
  messagingSenderId: "141850921697",
  appId: "1:141850921697:web:50280fbc83ee3e5c2305a0",
  measurementId: "G-F46DRD1DX4"
};

// Declaração da instância para o escopo do módulo
let db: Firestore;

/**
 * Inicializa o Firebase e o Firestore, garantindo que seja feito apenas uma vez (padrão Singleton).
 * Esta função é robusta para ambientes de cliente e servidor no Next.js.
 * @returns A instância do Firestore.
 */
function initializeDb(): Firestore {
    // Se já foi inicializado, apenas retorna a instância existente.
    if (getApps().length) {
        return getFirestore(getApp());
    }
    // Se não, inicializa o app e o Firestore.
    const app = initializeApp(firebaseConfig);
    return getFirestore(app);
}

/**
 * Retorna uma instância funcional do Firestore.
 * Chama a inicialização se a instância 'db' ainda não foi criada.
 * @returns A instância do Firestore.
 */
export const getDb = (): Firestore => {
    if (!db) {
        db = initializeDb();
    }
    return db;
};
