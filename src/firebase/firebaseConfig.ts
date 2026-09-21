import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqiTZP3knWeCdJrNz-OmlXYqZ3HwltTno",
  authDomain: "asbesoc-nigeria.firebaseapp.com",
  projectId: "asbesoc-nigeria",
  storageBucket: "asbesoc-nigeria.firebasestorage.app",
  messagingSenderId: "825713589236",
  appId: "1:825713589236:web:bf54ee5ef27d22090b97a1",
  measurementId: "G-5JMXZLDTD6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;