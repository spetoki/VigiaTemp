
// NOTE: This file is intentionally configured to prevent Firebase initialization.
// The application will use mock data and localStorage instead of a database.
// To enable Firebase, you must provide valid credentials in your environment
// variables and update the logic below.

import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Firestore } from "firebase/firestore";

// Intentionally export undefined to disable database features.
const app: FirebaseApp | undefined = undefined;
const db: Firestore | undefined = undefined;

console.warn("Firebase is not configured. The application will run in offline/demo mode using local storage and mock data. To enable database features, configure your Firebase credentials in environment variables and update 'src/lib/firebase.ts'.");

export { app, db };
