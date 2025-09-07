// 클라이언트 전용 초기화
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FB_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 익명 로그인 보장 유틸
export async function ensureAnonSignIn(): Promise<string> {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  await signInAnonymously(auth);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.uid) { unsub(); resolve(u.uid); }
    });
  });
}
