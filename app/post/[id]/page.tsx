"use client";

import type React from "react";

import { useEffect, useState, use } from "react"; // [ADD] React.use()로 params 언랩
import { Button } from "@/components/ui/button";
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
  Pencil, // 수정 버튼 아이콘
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Comment from "@/components/Comment";
import { UUID } from "crypto";
import PostLikeButton from "@/components/PostLikeButton";

// API 응답 타입
type PostDetail = {
  id: UUID;
  authorId: string;
  title: string;
  content: string;
  code: string;
  category: string;
  isAnswered: boolean;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
};

type Flags = {
  isMine: boolean;
  likedByMe: boolean;
};

// [MOD] 이름 충돌 방지: 컴포넌트(Comment)와 겹치지 않도록 인터페이스 이름 변경
interface CommentItem {
  id: number;
  content: string;
  author: string;
  isAuthor: boolean;
  timeAgo: string;
  likes: number;
  replies: CommentItem[];
  isExpanded?: boolean;
}

// [MOD] params 타입을 Promise로 받고 React.use()로 언랩
export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);      
  const [likeCount, setLikeCount] = useState(0);         
  const [likePending, setLikePending] = useState(false);

  // [ADD] 서버에서 가져온 게시글/플래그 상태
  const [post, setPost] = useState<PostDetail | null>(null);
  const [flags, setFlags] = useState<Flags>({ isMine: false, likedByMe: false });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // [MOD] 상세 데이터 로드 (API 연동) - params.id 대신 언랩된 id 사용
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!data?.success) throw new Error(data?.message || "LOAD_FAILED");

        setPost(data.post as PostDetail);
        setFlags(data.flags as Flags);
        setIsLiked(Boolean(data.flags?.likedByMe));                 // 좋아요 상태 유지
        setLikeCount(Number(data.post?.likeCount ?? 0));            // 좋아요 수 반영
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]); // [MOD] 의존성도 id로

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
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    router.push("/login");
    router.refresh();
  };


  // [MOD] 좋아요: 토글 안 함, 한 번만 누를 수 있게
  const handleLike = async () => {
    if (!post || isLiked || likePending) return; // 이미 눌렀으면 동작하지 않도로 설정

    try {
      setLikePending(true);
      setIsLiked(true);
    
      // 실제 구현된 엔드포인트에 맞게 경로/메서드 조정
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "PUT" });
      const data = await res.json();

      // 성공 시 서버 동기화
      if (data?.success) {
        setLikeCount(Number(data.likeCount ?? likeCount));
      } else {
        setIsLiked(flags.likedByMe); // 실패할 경우 롤백
      }
    } catch (e) {
      console.error(e);
      setIsLiked(flags.likedByMe);
    } finally {
      setLikePending(false);
    }
  };


  // 기존 마크다운 렌더 함수 유지
  const renderMarkdown = (text: string) => {
    return text
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>'
      )
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^\d+\.\s/gm, "<li>")
      .replace(/\n/g, "<br>");
  };

  const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",   // 타임존 고정
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(iso));
};

  if (loading) {
    return <div className="p-6">불러오는 중…</div>;
  }
  if (!post) {
    return <div className="p-6">게시글을 찾을 수 없습니다.</div>;
  }

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
                  <DropdownMenuItem onClick={() => handleMyPost()}>
                    View My Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)}>
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
              {/* 카테고리는 문자열로 내려오므로 기본 배지로 표기 */}
              <Badge variant="secondary">{post.category}</Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              {/* 작성자 표기는 항상 '작성자'로 */}
              <span className="font-medium">작성자</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {/* createdAt만 사용 */}
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>

            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {/* 첨부 코드가 있으면 표시 */}
            {post.code && (
              <pre className="overflow-auto rounded-md border p-4 text-sm mb-6">
                {post.code}
              </pre>
            )}

            {/* 수정하기 버튼과 좋아요/댓글 영역 */}
            <div className="flex flex-row-reverse items-center justify-between pt-4 border-t">
              {/* 내 글이면 수정 버튼 */}
              {flags.isMine && (
                <Link href={`/posts/${post.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Pencil className="w-4 h-4 mr-2" />
                    수정하기
                  </Button>
                </Link>
              )}

              {/* 좋아요 & 댓글 */}
              <div className="flex items-center gap-4">
                <PostLikeButton
                  postId={post.id as string}
                  initialLiked={flags.likedByMe}
                  initialCount={post.likeCount}
                />

                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentCount} 댓글</span> {/* 댓글 개수 표시 */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        {/* postId를 동적으로 전달 */}
        <Comment postId={post.id} />
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
