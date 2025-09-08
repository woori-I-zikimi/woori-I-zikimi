// 질문 목록 실시간 구독 훅
"use client";

import { useEffect, useState } from "react";
import { listenQuestions } from "@/lib/db";
import type { Question } from "@/components/types";

export function useQuestions() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = listenQuestions((items) => {
            setQuestions(items as Question[]);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { questions, loading };
}
