"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {

    ThumbsUp,
    Clock,
    Reply,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import { useRouter } from "next/navigation";

interface Comment {
    id: number;
    content: string;
    author: string;
    isAuthor: boolean;
    timeAgo: string;
    likes: number;
    replies: Comment[];
    isExpanded?: boolean;
}

export default function Comment({ postId }: { postId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(12);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");
    // const [comments, setComments] = useState<Comment[]>([
    //     {
    //         id: 1,
    //         content:
    //             "저도 비슷한 문제를 겪었는데, 팀 내에서 코드 리뷰 프로세스를 도입하니까 많이 개선되었어요22.",
    //         author: "익명1",
    //         isAuthor: false,
    //         timeAgo: "1시간 전",
    //         likes: 3,
    //         replies: [
    //             {
    //                 id: 11,
    //                 content: "코드 리뷰 도구는 어떤 걸 사용하셨나요?",
    //                 author: "익명2",
    //                 isAuthor: false,
    //                 timeAgo: "30분 전",
    //                 likes: 1,
    //                 replies: [],
    //             },
    //             {
    //                 id: 12,
    //                 content:
    //                     "GitHub의 Pull Request 기능을 주로 사용했습니다. 팀원들과 소통하기에 좋더라고요.",
    //                 author: "작성자",
    //                 isAuthor: true,
    //                 timeAgo: "25분 전",
    //                 likes: 2,
    //                 replies: [],
    //             },
    //         ],
    //         isExpanded: true,
    //     }
    // ]);
    const [comments, setComments] = useState<Comment[]>([])


    // 댓글 불러오기
    useEffect(() => {
        async function fetchComments() {
            const res = await fetch(`/api/comments?postId=${postId}`);
            const data = await res.json();
            if (data.success) setComments(data.comments);
        }
        fetchComments();
    }, [postId]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now(),
            content: newComment,
            author: `익명${comments.length + 1}`,
            isAuthor: false,
            timeAgo: "방금 전",
            likes: 0,
            replies: [],
            isExpanded: false,
        };

        setComments((prev) => [...prev, comment]);
        setNewComment("");
    };

    const handleReplySubmit = (commentId: number) => {
        if (!replyContent.trim()) return;

        const reply: Comment = {
            id: Date.now(),
            content: replyContent,
            author: `익명${Math.floor(Math.random() * 100)}`,
            isAuthor: false,
            timeAgo: "방금 전",
            likes: 0,
            replies: [],
        };

        setComments((prev) =>
            prev.map((comment) =>
                comment.id === commentId
                    ? {
                          ...comment,
                          replies: [...comment.replies, reply],
                          isExpanded: true,
                      }
                    : comment
            )
        );
        setReplyContent("");
        setReplyTo(null);
    };

    const toggleReplies = (commentId: number) => {
        setComments((prev) =>
            prev.map((comment) =>
                comment.id === commentId
                    ? { ...comment, isExpanded: !comment.isExpanded }
                    : comment
            )
        );
    };

    const CommentComponent = ({
        comment,
        isReply = false,
    }: {
        comment: Comment;
        isReply?: boolean;
    }) => (
        <div
            className={`${
                isReply ? "ml-8 border-l-2 border-gray-200 pl-4" : ""
            }`}
        >
            <Card className="mb-3">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                                {comment.author}
                            </span>
                            {comment.isAuthor && (
                                <Badge className="bg-[#1976D2] text-white text-xs">
                                    작성자
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{comment.timeAgo}</span>
                        </div>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-[#1976D2]"
                        >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {comment.likes}
                        </Button>
                        {!isReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-[#1976D2]"
                                onClick={() =>
                                    setReplyTo(
                                        replyTo === comment.id
                                            ? null
                                            : comment.id
                                    )
                                }
                            >
                                <Reply className="w-4 h-4 mr-1" />
                                답글
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reply Form */}
            {replyTo === comment.id && (
                <div className="ml-8 mb-4">
                    <div className="flex gap-2">
                        <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="답글을 작성하세요..."
                            className="flex-1"
                            rows={2}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                className="bg-[#1976D2] hover:bg-blue-700"
                                onClick={() => handleReplySubmit(comment.id)}
                            >
                                답글
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReplyTo(null)}
                            >
                                취소
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Replies */}
            {/* {comment.replies.length > 0 && (
                <div className="ml-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#1976D2] mb-2"
                        onClick={() => toggleReplies(comment.id)}
                    >
                        {comment.isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                답글 숨기기
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                답글 {comment.replies.length}개 보기
                            </>
                        )}
                    </Button>
                    {comment.isExpanded &&
                        comment.replies.map((reply) => (
                            <CommentComponent
                                key={reply.id}
                                comment={reply}
                                isReply={true}
                            />
                        ))}
                </div>
            )} */}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">

                {/* Comments Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        댓글 {comments.length}개
                    </h2>

                    {/* Comment Form */}
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={handleCommentSubmit}>
                                <Textarea
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    placeholder="댓글을 작성하세요..."
                                    className="mb-3"
                                    rows={3}
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        익명으로 댓글이 작성됩니다
                                    </span>
                                    <Button
                                        type="submit"
                                        className="bg-[#1976D2] hover:bg-blue-700"
                                    >
                                        댓글 작성
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentComponent
                                key={comment.id}
                                comment={comment}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


