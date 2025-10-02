
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBlH6j-IpV7w3JAwngeWAWZqi5iyftuNY",
  authDomain: "vigiatemp-91072.firebaseapp.com",
  projectId: "vigiatemp-91072",
  storageBucket: "vigiatemp-91072.appspot.com",
  messagingSenderId: "141850921697",
  appId: "1:141850921697:web:50280fbc83ee3e5c2305a0",
  measurementId: "G-F46DRD1DX4"
};

// Initialize Firebase
// This logic prevents the app from being initialized multiple times.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// Function to get the Firestore instance.
function getDb() {
  if (!db) {
    throw new Error("Firestore has not been initialized. Check your Firebase configuration.");
  }
  return db;
}

export { app, getDb };
