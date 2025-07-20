
"use client";

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// --- Firebase Desabilitado ---
// A lógica de conexão com o Firebase foi removida para simplificar o deploy
// e garantir que o aplicativo funcione sem a necessidade de configurar
// variáveis de ambiente externas no Vercel.

// A autenticação e o gerenciamento de dados agora são simulados via localStorage.
// Isso torna o protótipo totalmente autocontido.

const isFirebaseEnabled = false;

// Objetos dummy para evitar erros de importação em outras partes do código.
const app = {} as FirebaseApp;
const auth = {} as Auth;
const db = {} as Firestore;

export { app, auth, db, isFirebaseEnabled };
