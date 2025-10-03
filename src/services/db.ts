
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
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

// Estrutura para garantir uma única instância (Singleton Pattern)
interface FirebaseInstances {
  app: FirebaseApp;
  db: Firestore;
}

let instances: FirebaseInstances | null = null;

function initializeFirebase(): FirebaseInstances {
    if (typeof window !== 'undefined' && instances) {
        return instances;
    }

    if (!getApps().length) {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        instances = { app, db };
    } else {
        const app = getApp();
        const db = getFirestore(app);
        instances = { app, db };
    }
    return instances;
}

/**
 * Retorna uma instância funcional do Firestore.
 * Garante que o Firebase seja inicializado apenas uma vez.
 * @returns A instância do Firestore.
 */
export const getDb = (): Firestore => {
    if (!instances) {
        initializeFirebase();
    }
    // O 'instances' nunca será nulo aqui devido à chamada acima.
    // O '!' é uma asserção de não-nulidade para o TypeScript.
    return instances!.db;
};

// Garante que a inicialização ocorra quando o módulo é carregado no servidor
if (!instances) {
    initializeFirebase();
}
