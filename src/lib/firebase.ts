
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Cole aqui o objeto de configuração que você copiou do Firebase Console.
// Exemplo:
// const firebaseConfig = {
//   apiKey: "AIzaSy...",
//   authDomain: "seu-projeto.firebaseapp.com",
//   ...
// };
const firebaseConfig = {
  /* COLE SEU firebaseConfig AQUI */
};

// Inicializa o Firebase
// Esta lógica evita que o app seja inicializado várias vezes.
let app;
if (!getApps().length) {
  // @ts-ignore
  if (!firebaseConfig.projectId) {
    console.error("Configuração do Firebase está faltando! Cole o objeto firebaseConfig em src/lib/firebase.ts");
    app = null;
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

const db = app ? getFirestore(app) : null;

// Função para obter a instância do Firestore.
// Adicionada verificação para garantir que o app foi inicializado.
function getDb() {
  if (!db) {
    throw new Error("O Firestore não foi inicializado. Verifique sua configuração do Firebase.");
  }
  return db;
}

export { app, getDb };
