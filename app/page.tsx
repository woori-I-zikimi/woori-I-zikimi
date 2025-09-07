import React from "react";
import dynamic from "next/dynamic";

// Firebase를 참조하는 클라이언트 컴포넌트
const QuestionBoard = dynamic(() => import("@/components/QuestionBoard"), {
    ssr: false, // 🚫 서버사이드 렌더링 금지
});

export default function Page() {
    return (
        <main className="min-h-screen bg-slate-50">
            <QuestionBoard />
        </main>
    );
}
