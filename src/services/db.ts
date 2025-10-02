
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBlH6j-IpV7w3JAwngeWAWZqi5iyftuNY",
  authDomain: "vigiatemp-91072.firebaseapp.com",
  projectId: "vigiatemp-91072",
  storageBucket: "vigiatemp-91072.appspot.com",
  messagingSenderId: "141850921697",
  appId: "1:141850921697:web:50280fbc83ee3e5c2305a0",
  measurementId: "G-F46DRD1DX4"
};

// Singleton para a instância do Firestore
let db: ReturnType<typeof getFirestore> | null = null;

function initializeDb() {
    if (!db) {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
    }
    return db;
}

export const getDb = () => {
    if (!db) {
        return initializeDb();
    }
    return db;
};
