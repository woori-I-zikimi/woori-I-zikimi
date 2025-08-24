"use client";

import type React from "react";

import { useEffect, useState, use } from "react"; // [ADD] React.use()로 params 언랩
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PasswordChangeModal } from "@/components/password-change-modal";
import {
  MessageCircle,
  Clock,
  Pencil, // 수정 버튼 아이콘
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Comment from "@/components/Comment";
import { UUID } from "crypto";
import PostLikeButton from "@/components/PostLikeButton";
import { Header } from "@/components/Header";

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

// params 타입을 Promise로 받고 React.use()
export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likePending, setLikePending] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // 서버에서 가져온 게시글/플래그 상태
  const [post, setPost] = useState<PostDetail | null>(null);
  const [flags, setFlags] = useState<Flags>({
    isMine: false,
    likedByMe: false,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // 상세 데이터 로드 (API 연동)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!data?.success) throw new Error(data?.message || "LOAD_FAILED");

        setPost(data.post as PostDetail);
        setFlags(data.flags as Flags);
        setIsLiked(Boolean(data.flags?.likedByMe)); // 좋아요 상태 유지
        setLikeCount(Number(data.post?.likeCount ?? 0)); // 좋아요 수 반영
        setCommentCount(Number(data.post?.commentCount ?? 0)); // 댓글 수 반영
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]); // 의존성도 id로

  // 댓글이 추가되었을 때 댓글 수 증가 핸들러
  const handleCommentAdded = () => {
    setCommentCount((count) => count + 1);
  }

  // 기존 마크다운 렌더 함수 유지
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

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", // 타임존 고정
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
      <Header pathname={pathname} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Post Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="mb-4">
              {/* 카테고리는 문자열로 내려오므로 기본 배지로 표기 */}
              <Badge variant="secondary">{post.category}</Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

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

            {/* 좋아요/댓글 + 수정하기 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t">
              {/* 왼쪽: 좋아요 & 댓글 */}
              <div className="flex items-center gap-4">
                <PostLikeButton
                  postId={post.id as string}
                  initialLiked={flags.likedByMe}
                  initialCount={post.likeCount}
                />
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{commentCount} 댓글</span>
                </div>
              </div>

              {/* 오른쪽: 내 글이면 수정 버튼 */}
              {flags.isMine && (
                <Link href={`/posts/${post.id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    수정하기
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        {/* <Comment postId={post.id} autorId={post.authorId} /> */}
        <Comment postId={post.id} post_authorId={post.authorId} onAdded={handleCommentAdded} />
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
