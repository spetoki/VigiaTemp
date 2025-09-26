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

let app: FirebaseApp;
let db: Firestore | null = null; // Allow db to be null initially

function initializeDb() {
  if (!isConfigValid(firebaseConfig)) {
    if (typeof window !== 'undefined') {
        console.warn("Firebase client configuration is missing or invalid. Firebase services will not be available on the client-side.");
    }
    // Do not proceed with initialization if config is invalid
    return;
  }

  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      db = null; // Ensure db is null on failure
    }
  } else {
    app = getApp();
    db = getFirestore(app);
  }
}

// Initialize on load.
initializeDb();

// Export a function to get the db instance, ensuring it's available.
export const getDb = (): Firestore => {
    if (!db) {
      // This might happen in a serverless function cold start or if config was initially invalid.
      // Re-running initialization can safely resolve this.
      console.log("Firestore not initialized. Attempting re-initialization...");
      initializeDb();
    }
    if (!db) {
         // If it's still null, throw an error to make the problem obvious.
         throw new Error("Firestore database is not initialized. Check your Firebase configuration and environment variables are correctly set in your hosting environment (e.g., Vercel).");
    }
    return db;
}


export { app }; // db is no longer exported directly to enforce usage of getDb()
