"use client";

import { Comment } from "./types"; 

export default function CommentList({
  comments,
  color,
}: {
  comments: Comment[];
  color: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          아직 댓글이 없어요.
          <br />첫 번째 댓글을 남겨보세요! 💬
        </p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {comment.author}
              </span>
              <span className="text-xs text-gray-500">
                {comment.timestamp.toLocaleString("ko-KR")}
              </span>
            </div>
            <p className="text-gray-800">{comment.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
