"use client";

import { useEffect, useState } from "react";
import type { Comment, Question } from "./types";
import { X } from "lucide-react";
import { getQuestion, addComment, listenComments } from "@/lib/db";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

interface QuestionModalProps {
    question: Question;
    onClose: () => void;
    selectedQuestion: Question;
    setSelectedQuestion: (q: Question | null) => void;
    newComment: string;
    setNewComment: (val: string) => void;
    // handleAddComment: (e: React.FormEvent) => void;
    // 🔽 추가: 채택 토글 핸들러
    onToggleAccept: (commentId: string) => void;
}

export default function QuestionModal({
    question,
    onClose,
    selectedQuestion,
    setSelectedQuestion,
    newComment,
    setNewComment,
    // handleAddComment,
    onToggleAccept, // 🔽
}: QuestionModalProps) {
    const [data, setData] = useState<Question | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    // 1) 부모로부터 받은 question으로 먼저 채우고,
    // 2) getQuestion으로 최신화(딥링크/새로고침 대비)
    useEffect(() => {
        if (!question?.id) return;
        let mounted = true;

        // 즉시 표시
        setData(question);

        (async () => {
            try {
                const fresh = await getQuestion(String(question.id));
                if (mounted && fresh) setData(fresh as Question);
            } catch (e) {
                console.error("[QuestionModal] getQuestion error:", e);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [question?.id]);

    // 댓글 실시간 구독
    useEffect(() => {
        if (!question?.id) return;
        const unsub = listenComments(String(question.id), (items) => {
            setComments(items as Comment[]);
        });
        return () => unsub();
    }, [question?.id]);

    // 날짜 표시
    const displayDate = (() => {
        const raw = (data as any)?.createdAt ?? (question as any)?.createdAt;
        if (!raw) return null;
        return raw instanceof Date ? raw : new Date(raw);
    })();

    // 안전한 배경색 (data 없으면 question의 color 사용)
    const safeColor = (data?.color || question?.color || "#38bdf8").toString();
    const overlayBg = `${safeColor}${safeColor.length === 7 ? "CC" : ""}`; // #RRGGBB → #RRGGBBCC

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: overlayBg }}
            onClick={onClose}
        >
            <div
                className="bg-white/95 backdrop-blur-sm rounded-3xl w-full max-w-6xl h-[80vh] shadow-2xl flex overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 질문 영역 */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <div
                                className="w-8 h-8 rounded-full mb-4"
                                style={{ backgroundColor: safeColor }}
                            />
                            {displayDate && (
                                <p className="text-sm text-gray-500 mb-2">
                                    {displayDate.toLocaleString("ko-KR")}
                                </p>
                            )}
                        </div>
                        <button
                            aria-label="닫기"
                            className="p-2 rounded-lg hover:bg-gray-100 active:scale-[0.98] transition"
                            onClick={onClose}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* content (스키마: title + content) */}
                    <h2 className="text-2xl font-bold text-gray-900 break-words">
                        {data?.title || "제목 없음"}
                    </h2>
                    <div className="bg-gray-50 rounded-2xl p-6 mt-4">
                        <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {data?.content ||
                                "이 질문에 대한 답변을 기다리고 있어요! 🎈"}
                        </p>
                    </div>
                </div>

                {/* 댓글 영역 */}
                <div className="w-96 border-l border-gray-200 flex flex-col">
                    <CommentList
                        comments={selectedQuestion.comments ? selectedQuestion.comments : []}
                        color={selectedQuestion.color}
                        question={selectedQuestion} // 🔽 질문 상태 전달
                        onToggleAccept={onToggleAccept} // 🔽 클릭 핸들러 전달
                    />
                    <CommentForm
                        newComment={newComment}
                        setNewComment={setNewComment}
                        // handleAddComment={handleAddComment}
                        color={selectedQuestion.color}
                        questionId={selectedQuestion.id} // ⬅️ 추가
                    />
                </div>

                {/* 댓글 영역 */}
                {/* <div className="w-96 border-l border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="font-semibold text-gray-700">댓글</h4>
                        <span className="text-sm text-gray-500">
                            총 {(data?.commentsCount ?? 0) as number}개
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {comments.length === 0 && (
                            <div className="text-sm text-gray-500">
                                아직 댓글이 없어요.
                            </div>
                        )}
                        {comments.map((c) => (
                            <div key={String(c.id)} className="text-sm">
                                <div className="text-xs text-gray-400">
                                    {c.createdAt instanceof Date
                                        ? c.createdAt.toLocaleString("ko-KR")
                                        : (c as any)?.createdAt
                                              ?.toDate?.()
                                              ?.toLocaleString?.("ko-KR") ?? ""}
                                </div>
                                <div className="mt-1 bg-gray-50 rounded-xl px-3 py-2">
                                    {c.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={handleAddComment}
                        className="p-4 border-t border-gray-200 flex gap-2"
                    >
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="댓글 입력"
                            className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow active:scale-[0.98] disabled:opacity-50"
                            disabled={!text.trim() || sending}
                        >
                            {sending ? "등록중..." : "등록"}
                        </button>
                    </form>
                </div> */}
            </div>
        </div>
    );
}
