// firebase.ts - O sistema Firebase foi completamente removido.
// Este arquivo foi mantido para evitar erros de importação em potencial,
// mas não contém funcionalidade ativa.
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const isFirebaseEnabled = false;
const isFirebaseConfigured = false;

const app = {} as FirebaseApp;
const auth = {} as Auth;
const db = {} as Firestore;

export { app, auth, db, isFirebaseEnabled, isFirebaseConfigured };
