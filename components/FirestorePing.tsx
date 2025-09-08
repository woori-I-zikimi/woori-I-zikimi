// Firestore DB 연결 확인용
"use client";

import { useState } from "react";
import { db } from "@/lib/firebaseClient";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function FirestorePing() {
    const [status, setStatus] = useState<string>("");

    async function handlePing() {
        try {
            const ref = await addDoc(collection(db, "_ping"), {
                ok: true,
                createdAt: serverTimestamp(),
            });
            console.log("[FirestorePing] Success:", ref.id);
            setStatus(`✅ Success! Document ID: ${ref.id}`);
        } catch (e: any) {
            console.error("[FirestorePing] Error:", e.code, e.message);
            setStatus(`❌ Error: ${e.code} - ${e.message}`);
        }
    }

    return (
        <div className="p-4 border rounded">
            <button
                onClick={handlePing}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Firestore Ping Test
            </button>
            {status && <p className="mt-2 text-sm">{status}</p>}
        </div>
    );
}
