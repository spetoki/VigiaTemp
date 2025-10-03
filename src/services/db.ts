
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

let app: FirebaseApp;
let db: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
}

// Chame a inicialização para garantir que as instâncias sejam criadas.
initializeFirebase();

const getDb = (): Firestore => {
  // A instância 'db' já foi inicializada e está disponível globalmente neste módulo.
  // Isso garante que a mesma instância seja usada em todo o lado do servidor.
  return db;
};

export { db, getDb };
