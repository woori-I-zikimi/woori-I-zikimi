"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { se } from "date-fns/locale";

type UUIDString = string;

/**
 * CommentLikeButton 컴포넌트 Props
 * - commentId: 좋아요를 누를 대상 댓글의 ID
 * - initialLikes:  초기 좋아요 개수
 * - initialLikedByMe:내가 이미 좋아요 눌렀는지 여부
 * - className: 부모 컴포넌트에서 추가 스타일링할 수 있도록 className 지원
 * - onSync: 서버와 최종 동기화된 likeCount, likedByMe 값을 부모에 전달
 */
type Props = {
  commentId: UUIDString;
  initialLikes: number;
  initialLikedByMe: boolean;
  className?: string;
  onSync?: (likes: number, likedByMe: boolean) => void;
};

export default function PostLikeButton({
    commentId,
    initialLikes,
    initialLikedByMe = false,
    className,
    onSync,
}: Props) {

/**
 * 로컬 상태 정의
 * - likes: 현재 화면에 보여줄 좋아요 개수
 * - liked: 사용자가 이 댓글에 좋아요를 눌렀는지 여부
 * - pending: 서버로 요청 중인지 여부 (중복 클릭 방지)
 */
  const [likes, setLikes] = useState(() => Number(initialLikes));
  const [liked, setLiked] = useState(initialLikedByMe);
  const [pending, setPending] = useState(false);


  /**
   * commentId가 바뀌거나 서버에서 내려주는 값이 갱신되었을 때
   * 상태를 초기화/동기화해주는 useEffect
   */
  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialLikedByMe);
  }, [commentId, initialLikes, initialLikedByMe]);

  /**
   * 좋아요 버튼 클릭 핸들러
   * - 이미 liked 상태거나 서버 요청중이면 동작하지 않음
   * - 클릭하면 즉시 UI에 반영(낙관적 업데이트)
   * - 서버 요청 실패 시에는 롤백하여 원상태 복구
   * - 성공 시 서버에서 내려준 최신 likeCount로 동기화
   */
  const handleClick = async () => {
    if (liked || pending) return;

    // 낙관적 업데이트 = UI에 상태 즉시 반영
    setLiked(true);
    setLikes((v) => v + 1);
    setPending(true);

    try {
        const res = await fetch(`/api/comments/${commentId}/like`,{ method: "POST" });
        const data = await res.json();

        // 서버 응답 실패 -> 롤백
        if (!res.ok || !data?.success) {
            setLiked(false);
            setLikes((v) => v - 1);
            return;
        }

        // 서버 응답 성공 -> 동기화
        const next = Number(data.likeCount ?? likes);
        setLikes(next);
        setLiked(true);

        // 부모 컴포넌트에 동기화된 값 전달
        onSync?.(next, true);
    } catch (e) {
      console.error(e);
      setLiked(false);
      setLikes((v) => v - 1);
    } finally {
        setPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      // liked 상태면 버튼을 흐리게/비활성화해서 다시 못 누르도록 처리
      className={`text-gray-500 hover:text-[#1976D2] ${liked ? "opacity-70 pointer-events-none" : ""} ${className ?? ""}`}
      onClick={handleClick}
      disabled={pending || liked} // 요청중이거나 이미 좋아요 한 경우 비활성화
      aria-pressed={liked} // 접근성(스크린리더) 지원
      title={liked ? "이미 좋아요를 눌렀습니다" : "좋아요"} // 마우스 hover 시 안내 문구
    >
      {/* 좋아요 아이콘 + 좋아요 개수 */}
      <ThumbsUp className="w-4 h-4 mr-1" />
      {likes}
    </Button>
  );
}
