"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PasswordChangeModal } from "@/components/password-change-modal";
import {
    Home,
    User,
    Plus,
    ThumbsUp,
    MessageCircle,
    Clock,
    Reply,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import Link from "next/link";
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

export default function PostDetailPage({ params }: { params: { id: string } }) {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(12);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            content:
                "저도 비슷한 문제를 겪었는데, 팀 내에서 코드 리뷰 프로세스를 도입하니까 많이 개선되었어요.",
            author: "익명1",
            isAuthor: false,
            timeAgo: "1시간 전",
            likes: 3,
            replies: [
                {
                    id: 11,
                    content: "코드 리뷰 도구는 어떤 걸 사용하셨나요?",
                    author: "익명2",
                    isAuthor: false,
                    timeAgo: "30분 전",
                    likes: 1,
                    replies: [],
                },
                {
                    id: 12,
                    content:
                        "GitHub의 Pull Request 기능을 주로 사용했습니다. 팀원들과 소통하기에 좋더라고요.",
                    author: "작성자",
                    isAuthor: true,
                    timeAgo: "25분 전",
                    likes: 2,
                    replies: [],
                },
            ],
            isExpanded: true,
        },
        {
            id: 2,
            content:
                "프로젝트 관리 도구도 중요한 것 같아요. Jira나 Notion 같은 걸 활용해보시는 건 어떨까요?",
            author: "익명3",
            isAuthor: false,
            timeAgo: "45분 전",
            likes: 5,
            replies: [],
            isExpanded: false,
        },
    ]);

    // Mock post data
    const post = {
        id: params.id,
        title: "프로젝트 진행 상황",
        content: `현재 진행 중인 프로젝트에서 팀원들과의 **협업 방식**에 대해 궁금한 점이 있습니다.

특히 다음과 같은 부분들이 어려워요:

1. 코드 스타일 통일
2. 작업 분담 및 일정 관리
3. 의사소통 방식

\`\`\`javascript
// 예시 코드
function teamCollaboration() {
  console.log("How to improve team collaboration?");
}
\`\`\`

경험이 있으신 분들의 조언을 구합니다!`,
        category: { name: "프로젝트", color: "bg-blue-100 text-blue-800" },
        author: "작성자",
        timeAgo: "2시간 전",
    };
    const router = useRouter();

    // 홈 핸들
    const handleHomeClick = () => {
        router.push("/");
        router.refresh();
    };

    // 새 글 핸들
    const handleNewPost = () => {
        router.push("/new-post");
    };

    // 내 글 보기 핸들
    const handleMyPost = () => {
        router.push("/my-posts");
    };

    // 로그아웃 핸들
    const handleLogout = async () => {
        // console.log("로그아웃 클릭됨");
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
        });

        router.push("/login");
        router.refresh();
    };

    const handleLike = () => {
        if (!isLiked) {
            setIsLiked(true);
            setLikeCount((prev) => prev + 1);
        }
    };

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

    const renderMarkdown = (text: string) => {
        return text
            .replace(
                /```(\w+)?\n([\s\S]*?)```/g,
                '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>'
            )
            .replace(
                /`([^`]+)`/g,
                '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>'
            )
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/^\d+\.\s/gm, "<li>")
            .replace(/\n/g, "<br>");
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
            {comment.replies.length > 0 && (
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
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[#0074c9] text-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left - Home Button (icon only) */}
                        <Button
                            variant="ghost"
                            className="text-white hover:text-blue-100 hover:bg-[#005fa3]"
                            onClick={() => handleHomeClick()}
                        >
                            <Home className="w-4 h-4" />
                        </Button>

                        {/* Center - Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-[#0074c9]" />
                            </div>
                            <h1 className="text-lg font-bold text-white">
                                woori I zikimi
                            </h1>
                        </div>

                        {/* Right - Write Button & Profile */}
                        <div className="flex items-center gap-4">
                            <Button
                                className="bg-white text-[#0074c9] hover:bg-gray-50"
                                onClick={() => handleNewPost()}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Write
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-8 h-8 rounded-full p-0 text-white hover:text-blue-100 hover:bg-[#005fa3]"
                                    >
                                        <User className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        onClick={() => handleMyPost()}
                                    >
                                        View My Posts
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setIsPasswordModalOpen(true)
                                        }
                                    >
                                        Change Password
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => handleLogout()}
                                    >
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Post Content */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="mb-4">
                            <Badge className={post.category.color}>
                                {post.category.name}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <span className="font-medium">{post.author}</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{post.timeAgo}</span>
                            </div>
                        </div>
                        <div
                            className="prose max-w-none mb-6"
                            dangerouslySetInnerHTML={{
                                __html: renderMarkdown(post.content),
                            }}
                        />
                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button
                                variant={isLiked ? "default" : "outline"}
                                size="sm"
                                onClick={handleLike}
                                disabled={isLiked}
                                className={
                                    isLiked
                                        ? "bg-[#1976D2] hover:bg-blue-700"
                                        : "hover:bg-gray-50"
                                }
                            >
                                <ThumbsUp
                                    className={`w-4 h-4 mr-1 ${
                                        isLiked ? "fill-current" : ""
                                    }`}
                                />
                                {likeCount}
                            </Button>
                            <div className="flex items-center gap-1 text-gray-500">
                                <MessageCircle className="w-4 h-4" />
                                <span>{comments.length} 댓글</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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

            {/* Password Change Modal */}
            {isPasswordModalOpen && (
                <PasswordChangeModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />
            )}
        </div>
    );
}
