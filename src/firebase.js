// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbF1rUNfbvJwhMAJIAiwaXjo-m74BKKP4",
  authDomain: "dj-phee-bookings.firebaseapp.com",
  projectId: "dj-phee-bookings",
  storageBucket: "dj-phee-bookings.firebasestorage.app",
  messagingSenderId: "827748567494",
  appId: "1:827748567494:web:7d4f9da1fc1bed01b8cac7",
  measurementId: "G-0FHGPWSFKK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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
export { db };
