import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDea-tkor-HH5CqEmu4sK5F29SCTJc62-s",
  authDomain: "memoapp-db4e6.firebaseapp.com",
  projectId: "memoapp-db4e6",
  storageBucket: "memoapp-db4e6.firebasestorage.app",
  messagingSenderId: "349587799395",
  appId: "1:349587799395:web:4251c3ae0882418d8a2756",
  measurementId: "G-FBDDYKWCH8",
};

const app = initializeApp(firebaseConfig);

// Analytics solo si está soportado (evita fallos en SSR/tests)
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});

export const auth = getAuth(app);
// Asegurar persistencia local (sesión sobrevivirá a F5)
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Ignorar si el entorno no soporta (debería en web)
});
export const db = getFirestore(app);


