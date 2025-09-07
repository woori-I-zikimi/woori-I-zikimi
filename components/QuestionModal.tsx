// QuestionModal.tsx
"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Question } from "./types";
import { parseQuestionText } from "./util";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

interface QuestionModalProps {
  selectedQuestion: Question;
  setSelectedQuestion: (q: Question | null) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
   // 🔽 추가: 채택 토글 핸들러
  onToggleAccept: (commentId: string) => void;
}

export default function QuestionModal({
  selectedQuestion,
  setSelectedQuestion,
  newComment,
  setNewComment,
  handleAddComment,
  onToggleAccept, // 🔽
}: QuestionModalProps) {
  const displayDate = (() => {
    const raw =
      (selectedQuestion as any).createdAt ?? (selectedQuestion as any).timestamp;
    if (!raw) return null;
    return raw instanceof Date ? raw : new Date(raw);
  })();

  return (
    // 바깥 overlay (풍선 색상 반투명)
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: `${selectedQuestion.color}CC` }} // CC = 약간 투명(hex alpha)
      onClick={() => setSelectedQuestion(null)} // 바깥 클릭 → 닫기
    >
      {/* 모달 본체 */}
      <div
        className="bg-white/95 backdrop-blur-sm rounded-3xl w-full max-w-6xl h-[80vh] shadow-2xl flex overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 내부 클릭은 전파 차단
      >
        {/* 질문 영역 */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div
                className="w-8 h-8 rounded-full mb-4"
                style={{ backgroundColor: selectedQuestion.color }}
              />
              {displayDate && (
                <p className="text-sm text-gray-500 mb-2">
                  {displayDate.toLocaleString("ko-KR")}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedQuestion(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* content */}
          {(() => {
            const { title, body } = parseQuestionText(selectedQuestion.text);
            return (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <div className="bg-gray-50 rounded-2xl p-6 mt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {body || "이 질문에 대한 답변을 기다리고 있어요! 🎈"}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        {/* 댓글 영역 */}
        <div className="w-96 border-l border-gray-200 flex flex-col">
          <CommentList
            comments={selectedQuestion.comments}
            color={selectedQuestion.color}
             question={selectedQuestion}                 // 🔽 질문 상태 전달
            onToggleAccept={onToggleAccept}             // 🔽 클릭 핸들러 전달
          />
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            handleAddComment={handleAddComment}
            color={selectedQuestion.color}
          />
        </div>
      </div>
    </div>
  );
}
