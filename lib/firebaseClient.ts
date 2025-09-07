"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0]!;
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// 익명 로그인 보장 유틸
export async function ensureAnonSignIn(): Promise<string> {
    if (typeof window === "undefined") {
        throw new Error("ensureAnonSignIn must run on client.");
    }
    await setPersistence(auth, browserLocalPersistence);
    if (!auth.currentUser) {
        await signInAnonymously(auth); // 화면 없이 조용히 로그인
    }
    return auth.currentUser!.uid;
}
