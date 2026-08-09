import Constants from "expo-constants";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, signInAnonymously } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

type FirebaseClientConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const runtimeEnv = ((globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ??
  {}) as Record<string, string | undefined>;

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: runtimeEnv.EXPO_PUBLIC_FIREBASE_API_KEY ?? Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: runtimeEnv.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: runtimeEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: runtimeEnv.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId:
    runtimeEnv.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: runtimeEnv.EXPO_PUBLIC_FIREBASE_APP_ID ?? Constants.expoConfig?.extra?.firebaseAppId,
};

export function hasFirebaseConfig(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseConfig()) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

export async function ensureAnonymousUser(): Promise<{ uid: string; isMock: boolean }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { uid: `local-${Date.now()}`, isMock: true };
  }

  if (auth.currentUser) {
    return { uid: auth.currentUser.uid, isMock: false };
  }

  const credential = await signInAnonymously(auth);
  return { uid: credential.user.uid, isMock: false };
}
