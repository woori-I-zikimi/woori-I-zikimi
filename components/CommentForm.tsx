"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { addComment } from "@/lib/db";

interface Props {
  newComment: string;
  setNewComment: (val: string) => void;
  // handleAddComment: (e: React.FormEvent) => void;
  color: string;
  questionId: string; // ⬅️ 현재 질문 ID 받아오기
}

export default function CommentForm({
  newComment,
  setNewComment,
  color,
  questionId,
}: Props) {

   const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = newComment.trim();
    if (!txt) return;

    try {
      await addComment(questionId, txt); // ⬅️ Firestore 저장
      setNewComment(""); // 입력창 비우기
    } catch (err) {
      console.error("[CommentForm] addComment failed:", err);
    }
  };


  return (
    <div className="p-6 border-t border-gray-200">
      <form onSubmit={handleAddComment} className="space-y-3">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full"
        />
        <Button
          type="submit"
          className="w-full"
          style={{ backgroundColor: color }}
        >
          <Send className="w-4 h-4 mr-2" /> 댓글 달기
        </Button>
      </form>
    </div>
  );
}