"use client";

import { db, ensureAnonSignIn } from "./firebaseClient";
import { doc, runTransaction, getDoc } from "firebase/firestore";

// 채택 토글: 이미 채택된 댓글이면 해제, 아니면 해당 cid로 채택
export async function toggleAccept(qid: string, cid: string) {
    const uid = await ensureAnonSignIn();
    const qRef = doc(db, "questions", qid);

    await runTransaction(db, async (tx) => {
        const snap = await tx.get(qRef);
        if (!snap.exists()) throw new Error("Question not found");

        const q = snap.data() as {
            authorUid: string;
            acceptedCommentId?: string;
        };
        if (q.authorUid !== uid)
            throw new Error("권한 없음(작성자만 채택 가능)");

        const next =
            q.acceptedCommentId && q.acceptedCommentId === cid ? null : cid;

        tx.update(qRef, { acceptedCommentId: next });
    });
}
