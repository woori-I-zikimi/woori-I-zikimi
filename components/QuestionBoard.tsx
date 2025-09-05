"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send } from "lucide-react";
import p5 from "p5";

import { bubbleColors } from "./bubbleColors";
import { Question, Comment } from "./types";
import { parseQuestionText } from "./utils";
import BubbleCanvas from "./BubbleCanvas";
import QuestionModal from "./QuestionModal";

export default function QuestionBoard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [newComment, setNewComment] = useState("");
  const [inputRows, setInputRows] = useState(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 질문 등록
  const handleSubmit = (e: React.FormEvent) => {
    /* ... */
  };

  // 댓글 등록
  const handleAddComment = (e: React.FormEvent) => {
    /* ... */
  };

  // Enter 입력 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    /* ... */
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
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-slate-50 border-t border-gray-200 flex items-center justify-center px-4 z-50">
        <div className="w-full max-w-lg">
          <textarea
            ref={inputRef}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요"
            rows={inputRows}
            className="w-full px-4 py-3 text-black placeholder:text-gray-500 bg-white border-2 border-gray-300 rounded-2xl shadow-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
