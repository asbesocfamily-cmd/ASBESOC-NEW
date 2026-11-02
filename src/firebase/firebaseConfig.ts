import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
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

const stagingFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfigForApp = (() => {
  if (import.meta.env.VITE_FIREBASE_CONFIG_MODE !== "staging") return firebaseConfig;

  const requiredKeys: Array<keyof typeof stagingFirebaseConfig> = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingKeys = requiredKeys.filter((key) => !stagingFirebaseConfig[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Staging Firebase configuration is incomplete: ${missingKeys.join(", ")}`);
  }

  return {
    ...firebaseConfig,
    apiKey: stagingFirebaseConfig.apiKey!,
    authDomain: stagingFirebaseConfig.authDomain!,
    projectId: stagingFirebaseConfig.projectId!,
    storageBucket: stagingFirebaseConfig.storageBucket!,
    messagingSenderId: stagingFirebaseConfig.messagingSenderId!,
    appId: stagingFirebaseConfig.appId!,
    measurementId: stagingFirebaseConfig.measurementId,
  };
})();

const app = initializeApp(firebaseConfigForApp);

if (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY) {
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY), isTokenAutoRefreshEnabled: true });
}

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
