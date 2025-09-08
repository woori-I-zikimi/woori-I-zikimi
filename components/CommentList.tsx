"use client";

import AcceptButton from "./AcceptButton";
import { Comment, Question } from "./types";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebaseClient";

export default function CommentList({
    comments,
    color,
    question,
    onToggleAccept,
}: {
    comments: Comment[];
    color: string;
    question: Question;
    onToggleAccept: (commentId: string) => void;
}) {
    // ✅ 훅은 최상단에서 한 번만
    const [user] = useAuthState(auth);
    const isAuthor = !!user?.uid && user.uid === question.authorUid;

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    아직 댓글이 없어요.
                    <br />첫 번째 댓글을 남겨보세요! 💬
                </p>
            ) : (
                comments.map((comment) => {
                    const raw =
                        (comment as any).createdAt ??
                        (comment as any).timestamp;
                    const date = raw
                        ? raw instanceof Date
                            ? raw
                            : new Date(raw)
                        : null;
                    const accepted = question.acceptedCommentId === comment.id;

                    return (
                        <div
                            key={comment.id}
                            className="bg-gray-50 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2">
                                {isAuthor && (
                                    <AcceptButton
                                        questionId={question.id}
                                        commentId={comment.id}
                                        accepted={accepted}
                                    />
                                )}
                                {!isAuthor && accepted && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">
                                        채택된 댓글
                                    </span>
                                )}
                            </div>

                            {/* 날짜 표시는 필요시 노출 */}
                            {/* {date && (
                <div className="text-xs text-gray-400 mb-1">
                  {date.toLocaleString("ko-KR")}
                </div>
              )} */}

                            <p className="text-gray-800">{comment.text}</p>
                        </div>
                    );
                })
            )}
        </div>
    );
}
