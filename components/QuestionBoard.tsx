// QuestionBoard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { bubbleColors } from "./bubbleColors";
import { Question, Comment } from "./types";
import { parseQuestionText } from "./util";
import BubbleCanvas from "./BubbleCanvas";
import QuestionModal from "./QuestionModal";
import { addQuestion, listenQuestions } from "@/lib/db";

export default function QuestionBoard() {
    const [questions, setQuestions] = useState<Question[]>([]); // 현재 보드에 떠 있는 모든 질문
    const [newQuestion, setNewQuestion] = useState(""); // 입력 중인 질문 텍스트
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
        null
    ); // 모달에 열려 있는 현재 선택 질문
    const [newComment, setNewComment] = useState(""); // 모달에서 입력 중인 댓글 텍스트
    const [inputRows, setInputRows] = useState(1); // textarea 높이(줄 수) 자동 조절
    const inputRef = useRef<HTMLTextAreaElement>(null); // 제출 후 포커스 유지

    const uid = () => Math.random().toString(36).slice(2, 10);

    // Firestore: questions 실시간 구독
    useEffect(() => {
        const unsubscribe = listenQuestions((items) => {
            // db.ts에서 toDate() 변환까지 끝난 객체 배열이 넘어옴
            setQuestions(items as Question[]);
        });
        return () => unsubscribe();
    }, []);

    // 풍선 생성 위치
    const initialPosFor = () => {
        const screenW =
            typeof window !== "undefined" ? window.innerWidth : 1200;
        const screenH =
            typeof window !== "undefined" ? window.innerHeight : 800;

        const margin = 40; // 좌우 안전 여백
        const x = Math.random() * (screenW - margin * 2) + margin; // 좌우 전체 랜덤
        const y = screenH - 150 + Math.random() * 40; // 화면 아래쪽에서 살짝 랜덤

        return { x, y };
    };

    // 질문 등록
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const raw = newQuestion.trim();
        if (!raw) return;

        // parseQuestionText로 제목/본문 분리(없으면 첫 줄을 제목)
        const { title = "", body = "" } = parseQuestionText
            ? parseQuestionText(raw)
            : { title: raw, body: "" };

        // 색상 랜덤 선택
        const color =
            bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
        const { x, y } =
            typeof window !== "undefined"
                ? initialPosFor()
                : { x: 200, y: 500 };

        // ⬆️ 초기 속도를 위쪽(음수)로 조금 부여해서 “툭- 떠오르는” 느낌
        const initialVy = -1.1 - Math.random() * 0.6;
        const initialVx = (Math.random() - 0.5) * 0.4;

        try {
            // Firestore에 질문 저장
            await addQuestion({
                title: title || raw.split("\n")[0],
                content: body || raw,
                color,
            });

            // 구독으로 자동 반영되므로 로컬 prepend는 하지 않음
            setNewQuestion("");
            setInputRows(1);
            requestAnimationFrame(() => inputRef.current?.focus());

            console.log("질문 등록 성공");
        } catch (err) {
            console.error("[handleSubmit] addQuestion failed:", err);
        }

        const q: Question = {
            id: uid(),
            title: title || raw.split("\n")[0],
            text: raw,
            body,
            color,
            x,
            y,
            // 물리 초기값 추가
            vx: initialVx as any,
            vy: initialVy as any,
            mass: 1.2 as any,
            comments: [],
            createdAt: new Date(),
        } as unknown as Question;

        // // textarea 초기화 및 한 줄로 축소
        // setQuestions((prev) => [q, ...prev]);
        // setNewQuestion("");
        // setInputRows(1);

        // // requestAnimationFrame 후 다시 포커스로 UX 유지
        // requestAnimationFrame(() => inputRef.current?.focus());
    };

    // const handleAddComment = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     const txt = newComment.trim();
    //     if (!txt || !selectedQuestion) return;

    //     const cmt: Comment = {
    //         id: uid(),
    //         text: txt,
    //         author: "익명",
    //         timestamp: new Date(),
    //     } as unknown as Comment;

    //     setQuestions((prev) =>
    //         prev.map((q) =>
    //             q.id === selectedQuestion.id
    //                 ? { ...q, comments: [...(q.comments ?? []), cmt] }
    //                 : q
    //         )
    //     );

    //     setSelectedQuestion((prev) =>
    //         prev ? { ...prev, comments: [...(prev.comments ?? []), cmt] } : prev
    //     );

    //     setNewComment("");
    // };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (val: string) => {
        setNewQuestion(val);
        const lines = val.split("\n").length;
        setInputRows(Math.min(5, Math.max(1, lines)));
    };

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            <BubbleCanvas
                questions={questions}
                setQuestions={setQuestions}
                selectedQuestion={selectedQuestion}
                setSelectedQuestion={setSelectedQuestion}
            />

            {/* 하단 입력창 */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-50 flex items-center justify-center px-4 py-4 z-50">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="w-full max-w-2xl flex items-center gap-2"
                >
                    <textarea
                        ref={inputRef}
                        value={newQuestion}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="질문을 입력하세요 (Enter 제출 · Shift+Enter 줄바꿈)"
                        rows={inputRows}
                        className="flex-1 px-4 py-3 text-black placeholder:text-gray-500 bg-white border-2 border-gray-300 rounded-2xl shadow-lg resize-none outline-none"
                    />
                    <button
                        type="submit"
                        className="h-11 px-4 rounded-xl bg-blue-600 text-white shadow active:scale-[0.98] disabled:opacity-50"
                        disabled={!newQuestion.trim()}
                        aria-label="질문 등록"
                        title="질문 등록"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* 로고 */}
            <div className="fixed bottom-4 right-6" style={{ zIndex: 9998 }}>
                <div className="text-primary font-bold text-lg">
                    woori | zikimi
                </div>
            </div>

            {/* 질문 모달 */}
            {selectedQuestion && (
                <QuestionModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                />
            )}
        </div>
    );
}
