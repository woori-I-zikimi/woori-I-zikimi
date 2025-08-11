"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Search,
    ThumbsUp,
    MessageCircle,
    Clock,
    Edit,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyPostsPage() {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [posts, setPosts] = useState([
        {
            id: 1,
            title: "프로젝트 진행 상황",
            content:
                "현재 진행 중인 프로젝트에서 팀원들과의 협업 방식에 대해 궁금한 점이 있습니다.",
            category: { name: "프로젝트", color: "bg-blue-100 text-blue-800" },
            likes: 12,
            comments: 5,
            timeAgo: "2시간 전",
            canDelete: false, // 댓글이 있어서 삭제 불가
        },
        {
            id: 2,
            title: "React Hook 사용법 질문",
            content: "useState와 useEffect를 함께 사용할 때 주의사항이 있나요?",
            category: {
                name: "프론트엔드",
                color: "bg-green-100 text-green-800",
            },
            likes: 3,
            comments: 0,
            timeAgo: "1일 전",
            canDelete: true, // 댓글이 없어서 삭제 가능
        },
        {
            id: 3,
            title: "데이터베이스 설계 조언",
            content:
                "사용자 관리 시스템의 데이터베이스를 어떻게 설계하는 것이 좋을까요?",
            category: {
                name: "백엔드",
                color: "bg-purple-100 text-purple-800",
            },
            likes: 8,
            comments: 2,
            timeAgo: "3일 전",
            canDelete: false, // 댓글이 있어서 삭제 불가
        },
        {
            id: 4,
            title: "CSS Grid vs Flexbox",
            content: "언제 Grid를 사용하고 언제 Flexbox를 사용해야 하나요?",
            category: {
                name: "프론트엔드",
                color: "bg-green-100 text-green-800",
            },
            likes: 0,
            comments: 0,
            timeAgo: "1주 전",
            canDelete: true, // 댓글이 없어서 삭제 가능
        },
    ]);

    const [selectedCategory, setSelectedCategory] = useState("전체");
    const categories = ["전체", "프론트엔드", "백엔드", "프로젝트"];
    const router = useRouter();

    const handleDeletePost = (postId: number) => {
        if (confirm("정말로 이 글을 삭제하시겠습니까?")) {
            setPosts((prev) => prev.filter((post) => post.id !== postId));
        }
    };

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

    const filteredPosts = posts.filter(
        (post) =>
            selectedCategory === "전체" ||
            post.category.name === selectedCategory
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
                                    {/* <DropdownMenuItem
                                        onClick={() => handleMyPost()}
                                    >
                                        View My Posts
                                    </DropdownMenuItem> */}
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
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        내가 쓴 글
                    </h1>
                    <p className="text-gray-600">
                        총 {posts.length}개의 글을 작성했습니다
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="내 글에서 검색..."
                            className="pl-10 py-3 text-base"
                        />
                    </div>
                </div>

                {/* My Posts Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            My Posts
                        </h2>
                        <select className="px-4 py-2 border rounded-lg bg-white">
                            <option>Latest</option>
                            <option>Most Popular</option>
                            <option>Most Commented</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={
                                    selectedCategory === category
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                className={
                                    selectedCategory === category
                                        ? "bg-[#1976D2] hover:bg-blue-700"
                                        : ""
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4">
                        {filteredPosts.map((post) => (
                            <Card
                                key={post.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    className={
                                                        post.category.color
                                                    }
                                                >
                                                    {post.category.name}
                                                </Badge>
                                                {post.comments === 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-green-600 border-green-600"
                                                    >
                                                        삭제 가능
                                                    </Badge>
                                                )}
                                                {post.comments > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-red-600 border-red-600"
                                                    >
                                                        삭제 불가
                                                    </Badge>
                                                )}
                                            </div>
                                            <Link href={`/post/${post.id}`}>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#1976D2] cursor-pointer">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <p className="text-gray-600 mb-4 line-clamp-2">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>{post.likes}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>
                                                        {post.comments} 댓글
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{post.timeAgo}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            <Link
                                                href={`/edit-post/${post.id}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="hover:bg-gray-50 bg-transparent"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    수정
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={`${
                                                    post.canDelete
                                                        ? "hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                                                        : "opacity-50 cursor-not-allowed"
                                                }`}
                                                disabled={!post.canDelete}
                                                onClick={() =>
                                                    post.canDelete &&
                                                    handleDeletePost(post.id)
                                                }
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                작성한 글이 없습니다.
                            </p>
                            <Link href="/new-post">
                                <Button className="mt-4 bg-[#1976D2] hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-1" />첫 글
                                    작성하기
                                </Button>
                            </Link>
                        </div>
                    )}
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
