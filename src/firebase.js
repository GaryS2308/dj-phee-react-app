// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDbF1rUNfbvJwhMAJIAiwaXjo-m74BKKP4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dj-phee-bookings.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dj-phee-bookings",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dj-phee-bookings.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "827748567494",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:827748567494:web:7d4f9da1fc1bed01b8cac7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0FHGPWSFKK"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let analyticsInstance = null;
export const initAnalytics = async () => {
  if (analyticsInstance || typeof window === 'undefined') return analyticsInstance;
  try {
    const { isSupported, getAnalytics } = await import('firebase/analytics');
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  } catch (error) {
    analyticsInstance = null;
  }
  return analyticsInstance;
};

const db = getFirestore(app);
const auth = getAuth(app);
export { app, auth, db };
