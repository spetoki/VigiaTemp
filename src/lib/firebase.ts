
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxlONjf4kw4Ix75rGFJVvz_WXSvmorFhw",
  authDomain: "vigiatemp.firebaseapp.com",
  databaseURL: "https://vigiatemp-default-rtdb.firebaseio.com",
  projectId: "vigiatemp",
  storageBucket: "vigiatemp.firebasestorage.app",
  messagingSenderId: "75900061601",
  appId: "1:75900061601:web:ac19591587d74fccdf2de0"
};

// Inicializa o Firebase
// Esta lógica evita que o app seja inicializado várias vezes.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// Função para obter a instância do Firestore.
function getDb() {
  if (!db) {
    throw new Error("O Firestore não foi inicializado. Verifique sua configuração do Firebase.");
  }
  return db;
}

export { app, getDb };
