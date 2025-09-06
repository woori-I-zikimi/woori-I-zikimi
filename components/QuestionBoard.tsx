// QuestionBoard.tsx
"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { bubbleColors } from "./bubbleColors";
import { Question, Comment } from "./types";
import { parseQuestionText } from "./util";
import BubbleCanvas from "./BubbleCanvas";
import QuestionModal from "./QuestionModal";

export default function QuestionBoard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newComment, setNewComment] = useState("");
  const [inputRows, setInputRows] = useState(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const uid = () => Math.random().toString(36).slice(2, 10);

  // 풍선 생성 위치
  const initialPosFor = (count: number) => {
  const col = count % 4;
  const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

  const x = (col + 1) * (screenW / 5);

  // 화면 전체 높이 기준으로 footer 바로 위쪽에서 시작
  const bottomBandTop = screenH - 80;
  const y = screenH - 160 + Math.random() * 50;

  return { x, y };
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const raw = newQuestion.trim();
    if (!raw) return;

    const { title = "", body = "" } = parseQuestionText ? parseQuestionText(raw) : { title: raw, body: "" };

    const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    const { x, y } = typeof window !== "undefined" ? initialPosFor(questions.length) : { x: 200, y: 500 };

    // ⬆️ 초기 속도를 위쪽(음수)로 조금 부여해서 “툭- 떠오르는” 느낌
    const initialVy = -1.1 - Math.random() * 0.6;
    const initialVx = (Math.random() - 0.5) * 0.4;

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

    setQuestions((prev) => [q, ...prev]);
    setNewQuestion("");
    setInputRows(1);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = newComment.trim();
    if (!txt || !selectedQuestion) return;

    const cmt: Comment = {
      id: uid(),
      text: txt,
      author: "익명",
      timestamp: new Date(),
    } as unknown as Comment;

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === selectedQuestion.id
          ? { ...q, comments: [...(q.comments ?? []), cmt] }
          : q
      )
    );

    setSelectedQuestion((prev) =>
      prev ? { ...prev, comments: [...(prev.comments ?? []), cmt] } : prev
    );

    setNewComment("");
  };

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
      <div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-gray-200 flex items-center justify-center px-4 py-4 z-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="w-full max-w-2xl flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={newQuestion}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요 (Enter 제출 · Shift+Enter 줄바꿈)"
            rows={inputRows}
            className="flex-1 px-4 py-3 text-black placeholder:text-gray-500 bg-white border-2 border-gray-300 rounded-2xl shadow-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="text-primary font-bold text-lg">woori | zikimi</div>
      </div>

      {/* 질문 모달 */}
      {selectedQuestion && (
        <QuestionModal
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
