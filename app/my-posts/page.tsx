"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CATEGORIES, type Category } from "@/lib/category";
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
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UUID } from "crypto";

type PostItem = {
    id: UUID;
    category: Category;
    title: string;
    content: string;
    likes: number;
    comments: number;
    createdAt: string;
};

export default function MyPostsPage() {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 서버에서 내 글 가져오기
    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch("/api/my-posts", {
                credentials: "include", // 쿠키 보내기
                cache: "no-store", // 캐싱 방지
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts);
            } else {
                console.error("불러오기 실패", res.status);
            }
            setLoading(false);
        })();
    }, []);

    // const [selectedCategory, setSelectedCategory] = useState("전체");
    // const categories = ["전체", "프론트엔드", "백엔드", "프로젝트"];

    type CategoryFilter = "전체" | Category;
    const [selectedCategory, setSelectedCategory] =
        useState<CategoryFilter>("전체");
    const categories = useMemo(() => ["전체", ...CATEGORIES] as const, []);

    const router = useRouter();

    const handleDeletePost = (postId: UUID) => {
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

    const filteredPosts = posts.filter((p) => {
        const byCat =
            selectedCategory === "전체" || p.category === selectedCategory;
        return byCat;
    });

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
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Posts
                    </h1>
                    <p className="text-gray-600">
                        총 {posts.length}개의 글을 작성했습니다
                    </p>
                </div>

                {/* 검색바 넣을 곳 */}

                {/* My Posts Section */}
                <div className="mb-6 flex items-center justify-between">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    // setCurrentPage(1);
                                }}
                                className={`border border-gray-300 font-medium transition-colors ${
                                    selectedCategory === cat
                                        ? "bg-[#0074c9] text-white border-[#0074c9] hover:bg-[#005ba3] hover:border-[#005ba3]"
                                        : "text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {/* 정렬 */}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="text-gray-600 hover:text-gray-900 border-gray-300"
                                >
                                    {sortBy === "latest" ? "Latest" : "Popular"}
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setSortBy("latest")}
                                >
                                    Latest
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setSortBy("popular")}
                                >
                                    Popular
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Posts List */}
                <div className="space-y-4 mb-8">
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
                                                variant="secondary"
                                                className="bg-blue-50 text-[#0074c9] hover:bg-blue-100 border-blue-200"
                                            >
                                                {post.category}
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
                                                <span>{post.createdAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Link href={`/edit-post/${post.id}`}>
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
                                            // className={`${
                                            //     post.canDelete
                                            //         ? "hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                                            //         : "opacity-50 cursor-not-allowed"
                                            // }`}
                                            // disabled={!post.canDelete}
                                            // onClick={() =>
                                            //     post.canDelete &&
                                            //     handleDeletePost(post.id)
                                            // }
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
                                <Plus className="w-4 h-4 mr-1" />첫 글 작성하기
                            </Button>
                        </Link>
                    </div>
                )}
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
