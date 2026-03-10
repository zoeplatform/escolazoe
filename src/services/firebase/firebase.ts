import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase config (MVP)
 * IMPORTANT: apiKey is not a secret in Firebase web apps.
 * Later: move to .env (VITE_FIREBASE_*) for easier environment switching.
 */
const firebaseConfig = {
  apiKey: "AIzaSyA5w1UloMwe_bRgKRo7NnulpjzYkTiFSdg",
  authDomain: "escolazoe-a4bfd.firebaseapp.com",
  projectId: "escolazoe-a4bfd",
  storageBucket: "escolazoe-a4bfd.firebasestorage.app",
  messagingSenderId: "113122361083",
  appId: "1:113122361083:web:569b458b7da3d7fe1dba5e",
  measurementId: "G-FGSCTLV9RJ"
};


export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

/**
 * Firestore simples — sem persistentMultipleTabManager.
 *
 * O tabManager anterior causava travamento em:
 *   - iOS Safari / WKWebView (Capacitor)
 *   - Chrome modo incógnito
 *   - Navegadores sem suporte a IndexedDB
 *
 * A resiliência offline é tratada no AuthContext via localStorage,
 * não dependendo do cache do Firestore.
 */
export const db = getFirestore(firebaseApp);
