"use client";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { db, ensureAnonSignIn } from "./firebase";

// === Questions ===
export async function addQuestion({
    title,
    content,
    color,
}: {
    title: string;
    content: string;
    color: string;
}) {
    const uid = await ensureAnonSignIn(); // 👈 조용히 UID 확보

    try {
        const ref = await addDoc(collection(db, "questions"), {
            authorUid: uid, // ✅ 작성자 UID 저장
            title,
            content,
            color,
            commentsCount: 0,
            createdAt: serverTimestamp(),
            acceptedCommentId: null,
        });
        return ref.id;
    } catch (e: any) {
        console.error("[addQuestion] FirebaseError:", e?.code, e?.message);
        throw e;
    }
}

export function listenQuestions(cb: (docs: any[]) => void) {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    return onSnapshot(
        q,
        (snap) => {
            const items = snap.docs.map((d) => {
                const data = d.data() as any;

                return {
                    id: d.id,
                    title: typeof data.title === "string" ? data.title : "",
                    content:
                        typeof data.content === "string" ? data.content : "",
                    color: data.color,
                    commentsCount: data.commentsCount ?? 0,
                    createdAt: data.createdAt?.toDate?.() ?? null,
                };
            });
            cb(items);
        },
        (e) => {
            console.error(
                "[listenQuestions] FirebaseError:",
                (e as any)?.code,
                (e as any)?.message
            );
        }
    );
}

export async function getQuestion(id: string) {
    try {
        if (!id || typeof id !== "string") {
            throw new Error(`getQuestion: invalid id "${String(id)}"`);
        }

        const ref = doc(db, "questions", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;

        const data = snap.data() as any;
        return {
            id: snap.id,
            title: typeof data.title === "string" ? data.title : "",
            content: typeof data.content === "string" ? data.content : "",
            color: data.color ?? "#cccccc",
            commentsCount:
                typeof data.commentsCount === "number" ? data.commentsCount : 0,
            createdAt: data.createdAt?.toDate?.() ?? null,
        };
    } catch (e: any) {
        console.error("[getQuestion] FirebaseError:", e?.code, e?.message, e);
        throw e;
    }
}

// === Comments === (그대로 사용)
export async function addComment(
    questionId: string,
    { text }: { text: string }
) {
    try {
        const commentsCol = collection(db, "questions", questionId, "comments");
        await addDoc(commentsCol, { text, createdAt: serverTimestamp() });
        await updateDoc(doc(db, "questions", questionId), {
            commentsCount: increment(1),
        });
    } catch (e: any) {
        console.error("[addComment] FirebaseError:", e?.code, e?.message);
        throw e;
    }
}

export function listenComments(questionId: string, cb: (docs: any[]) => void) {
    const q = query(
        collection(db, "questions", questionId, "comments"),
        orderBy("createdAt", "asc")
    );
    return onSnapshot(
        q,
        (snap) => {
            const items = snap.docs.map((d) => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    text: data.text,
                    createdAt: data.createdAt?.toDate?.() ?? null,
                };
            });
            cb(items);
        },
        (e) => {
            console.error(
                "[listenComments] FirebaseError:",
                (e as any)?.code,
                (e as any)?.message
            );
        }
    );
}
