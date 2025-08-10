"use client";

import {
  Search,
  Plus,
  ThumbsUp,
  MessageCircle,
  Clock,
  Home,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WooriQAPlatform() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const router = useRouter();

  const categories = ["전체", "자유", "프로젝트", "취업", "수업"];

  const allQuestions = [
    {
      id: 1,
      category: "프로젝트",
      title: "프로젝트 진행 상황",
      content:
        "현재 진행 중인 프로젝트에서 팀원들과의 협업 방식에 대해 궁금한 점이 있습니다.",
      likes: 12,
      comments: 5,
      timeAgo: "2시간 전",
    },
    {
      id: 2,
      category: "자유",
      title: "면접 후기 공유",
      content: "최근 대기업 개발자 면접을 보고 온 후기를 공유하고 싶습니다.",
      likes: 8,
      comments: 3,
      timeAgo: "3시간 전",
    },
    {
      id: 3,
      category: "취업",
      title: "신입 개발자 포트폴리오 조언",
      content:
        "신입 개발자로서 포트폴리오를 어떻게 구성해야 할지 조언을 구합니다.",
      likes: 15,
      comments: 7,
      timeAgo: "5시간 전",
    },
    {
      id: 4,
      category: "수업",
      title: "React 강의 추천",
      content: "React를 처음 배우는데 좋은 온라인 강의가 있을까요?",
      likes: 6,
      comments: 4,
      timeAgo: "1일 전",
    },
    {
      id: 5,
      category: "프로젝트",
      title: "데이터베이스 설계 질문",
      content:
        "사용자 관리 시스템의 데이터베이스를 설계하고 있는데 조언이 필요합니다.",
      likes: 20,
      comments: 12,
      timeAgo: "1일 전",
    },
    {
      id: 6,
      category: "자유",
      title: "개발자 커뮤니티 추천",
      content: "개발 관련 정보를 얻을 수 있는 좋은 커뮤니티를 추천해주세요.",
      likes: 9,
      comments: 6,
      timeAgo: "2일 전",
    },
    {
      id: 7,
      category: "취업",
      title: "코딩테스트 준비 방법",
      content: "코딩테스트를 효율적으로 준비할 수 있는 방법이 있을까요?",
      likes: 25,
      comments: 15,
      timeAgo: "2일 전",
    },
    {
      id: 8,
      category: "수업",
      title: "알고리즘 공부 순서",
      content: "알고리즘을 체계적으로 공부하려면 어떤 순서로 접근해야 할까요?",
      likes: 18,
      comments: 9,
      timeAgo: "3일 전",
    },
    {
      id: 9,
      category: "프로젝트",
      title: "API 설계 베스트 프랙티스",
      content:
        "RESTful API를 설계할 때 지켜야 할 베스트 프랙티스가 궁금합니다.",
      likes: 22,
      comments: 11,
      timeAgo: "3일 전",
    },
    {
      id: 10,
      category: "자유",
      title: "개발자 성장 경험담",
      content:
        "주니어에서 시니어로 성장하면서 겪었던 경험을 공유하고 싶습니다.",
      likes: 30,
      comments: 18,
      timeAgo: "4일 전",
    },
    {
      id: 11,
      category: "취업",
      title: "이력서 작성 팁",
      content: "개발자 이력서를 작성할 때 주의해야 할 점들을 알려주세요.",
      likes: 14,
      comments: 8,
      timeAgo: "4일 전",
    },
    {
      id: 12,
      category: "수업",
      title: "JavaScript 심화 학습",
      content:
        "JavaScript의 고급 개념들을 학습할 수 있는 자료를 찾고 있습니다.",
      likes: 16,
      comments: 10,
      timeAgo: "5일 전",
    },
  ];

  // Filter questions by category
  const filteredQuestions =
    selectedCategory === "전체"
      ? allQuestions
      : allQuestions.filter((q) => q.category === selectedCategory);

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likes - a.likes;
    }
    return a.id - b.id; // Latest first (assuming lower id = newer)
  });

  // Pagination
  const totalPages = Math.ceil(sortedQuestions.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentQuestions = sortedQuestions.slice(
    startIndex,
    startIndex + postsPerPage
  );

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="bg-gray-50 min-h-screen">
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
              <h1 className="text-lg font-bold text-white">woori I zikimi</h1>
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>View My Posts</DropdownMenuItem>
                  <DropdownMenuItem>Change Password</DropdownMenuItem>
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

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search questions or categories..."
              className="pl-10 h-12 text-base border-gray-300 focus:border-[#0074c9] focus:ring-[#0074c9]"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Questions Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Questions
            </h2>

            {/* Sort Dropdown */}
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
                <DropdownMenuItem onClick={() => setSortBy("latest")}>
                  Latest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  Popular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`border border-gray-300 font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#0074c9] text-white border-[#0074c9] hover:bg-[#005ba3] hover:border-[#005ba3]"
                    : "text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4 mb-8">
          {currentQuestions.map((question) => (
            <Card
              key={question.id}
              className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-[#0074c9] hover:bg-blue-100 border-blue-200"
                  >
                    {question.category}
                  </Badge>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {question.timeAgo}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#0074c9] transition-colors">
                  {question.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {question.content}
                </p>

                <hr className="border-gray-200 mb-4" />

                <div className="flex items-center gap-6 text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {question.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {question.comments} 댓글
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 ${
                currentPage === page
                  ? "text-[#0074c9] border-b-2 border-[#0074c9] font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#0074c9] hover:bg-[#005ba3] text-white shadow-lg z-40"
          size="sm"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
