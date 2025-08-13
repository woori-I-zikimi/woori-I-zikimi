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
import Comment from "@/components/Comment";
import { id } from "date-fns/locale";

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
                                <span> 댓글</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <Comment postId={ "1" } />
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
