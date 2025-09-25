import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getFirestore, Firestore }from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to check if the config has all necessary values.
const isConfigValid = (config: FirebaseOptions): boolean => {
    return !!config.apiKey && !!config.authDomain && !!config.projectId;
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Initialize Firebase only if the configuration is valid and we are in the browser or it hasn't been initialized yet.
if (isConfigValid(firebaseConfig)) {
    if (!getApps().length) {
        try {
            app = initializeApp(firebaseConfig);
            db = getFirestore(app);
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    } else {
        app = getApp();
        db = getFirestore(app);
    }
} else {
    // In a server environment, we might not have the NEXT_PUBLIC_ variables.
    // However, the Firebase Admin SDK (used in server-side functions) might be configured differently.
    // For the client-side, we issue a warning.
    if (typeof window !== 'undefined') {
        console.warn("Firebase client configuration is missing or invalid. Firebase services will not be available on the client-side.");
    }
}

// Export a function to get the db instance, ensuring it's available.
const getDb = () => {
    if (!db) {
         if (isConfigValid(firebaseConfig) && getApps().length) {
            db = getFirestore(getApp());
        }
        if (!db) {
            // This is a fallback if initialization failed for some reason.
            // It might happen in a serverless function cold start.
            if(isConfigValid(firebaseConfig) && !getApps().length) {
                 app = initializeApp(firebaseConfig);
                 db = getFirestore(app);
            } else if (isConfigValid(firebaseConfig)) {
                 app = getApp();
                 db = getFirestore(app);
            }
        }
    }
    if (!db) {
         // If it's still null, throw an error to make the problem obvious.
         throw new Error("Firestore database is not initialized. Check your Firebase configuration.");
    }
    return db;
}


export { app, db, getDb };
