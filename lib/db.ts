"use client";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { db, ensureAnonSignIn } from "./firebaseClient";

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

export async function deleteQuestion(id: string) {
    await deleteDoc(doc(db, "questions", id));
}

// === Comments === (그대로 사용)
// 댓글 추가
export async function addComment(questionId: string, text: string) {
    const ref = collection(db, "questions", questionId, "comments");
    await addDoc(ref, {
        text,
        author: "익명", // 필요하다면 사용자 정보 넣기
        createdAt: serverTimestamp(),
        adopt: false,
    });
}

// // 댓글 구독 (이미 있으심)
// export function listenComments(
//     questionId: string,
//     callback: (items: any[]) => void
// ) {
//     const ref = collection(db, "questions", questionId, "comments");
//     const q = query(ref, orderBy("createdAt", "asc"));
//     return onSnapshot(q, (snap) => {
//         const items = snap.docs.map((d) => ({
//             id: d.id,
//             ...d.data(),
//             createdAt: d.data().createdAt?.toDate?.() ?? null,
//         }));
//         callback(items);
//     });
// }

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
