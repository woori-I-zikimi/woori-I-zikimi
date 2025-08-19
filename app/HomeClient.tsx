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
import { CATEGORIES, type Category } from "@/lib/category";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import PasswordChangeModal from "../components/password-change-modal";
import { UUID } from "crypto";
import { Header } from "@/components/Header";

type PostItem = {
  id: UUID;
  category: Category;
  title: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
};

export default function HomeClient({
  initialPosts,
}: {
  initialPosts: PostItem[];
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const postsPerPage = 10;

  //   const [selectedCategory, setSelectedCategory] = useState("전체");
  //   const categories = ["전체", "자유", "프로젝트", "취업", "수업", "기타"];

  type CategoryFilter = "전체" | Category;
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("전체");
  const categories = useMemo(() => ["전체", ...CATEGORIES] as const, []);

  // 스크롤 탑 버튼
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // 검색 + 카테고리 필터
  const filtered = initialPosts.filter((p) => {
    const byCat =
      selectedCategory === "전체" || p.category === selectedCategory;
    const bySearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    return byCat && bySearch;
  });

  // 정렬
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "popular") return b.likes - a.likes;
    // latest: createdAt 내림차순
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 페이지네이션
  const totalPages = Math.ceil(sorted.length / postsPerPage) || 1;
  const startIndex = (currentPage - 1) * postsPerPage;
  const current = sorted.slice(startIndex, startIndex + postsPerPage);

  // 페이지 변경 시 맨 위로
  useEffect(() => {
    scrollToTop();
  }, [currentPage, sortBy, selectedCategory]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Header />

      <section className="bg-[#0074c9] text-white py-20 relative overflow-hidden">
        {/* <div className="absolute inset-0 bg-[url('/tech-pattern.png')] opacity-10 "></div> */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            자유로운 질문, 열린 답변
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            편하게 묻고 답하며, 더 나은 FISA를 만들어가요
          </p>
        </div>
        <div className="h-4">
          {/* 검색 */}
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="질문이나 카테고리를 검색해주세요"
                className="pl-10 h-12 text-base border-gray-300 focus:border-[#0074c9] focus:ring-[#0074c9] bg-white text-black"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Questions
            </h2>
          </div>
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
                    setCurrentPage(1);
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
                  <DropdownMenuItem onClick={() => setSortBy("latest")}>
                    Latest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("popular")}>
                    Popular
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 mb-8">
          {current.map((q) => (
            <Card
              key={q.id}
              className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-[#0074c9] hover:bg-blue-100 border-blue-200"
                  >
                    {q.category}
                  </Badge>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(q.createdAt).toLocaleString()}
                  </div>
                </div>

                <Link href={`/post/${q.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#0074c9] cursor-pointer">
                    {q.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {q.content}
                </p>

                <hr className="border-gray-200 mb-4" />

                <div className="flex items-center gap-6 text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{q.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {q.comments} 댓글
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

      {/* Scroll to Top */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#0074c9] hover:bg-[#005ba3] text-white shadow-lg z-40"
          size="sm"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}

      {isPasswordModalOpen && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
}
