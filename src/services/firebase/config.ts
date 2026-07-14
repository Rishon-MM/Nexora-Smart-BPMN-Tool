import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (isDemo ? 'demo-api-key' : ''),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (isDemo ? 'demo.firebaseapp.com' : ''),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (isDemo ? 'demo-project' : ''),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (isDemo ? 'demo.appspot.com' : ''),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isDemo ? '000000000' : ''),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (isDemo ? '1:000000000:web:abcdef' : '')
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);