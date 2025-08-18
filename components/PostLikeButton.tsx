"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function PostLikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (liked || pending) return; // 토글 OFF 없음
    setLiked(true);
    setCount((c) => c + 1);

    setPending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "PUT",
        cache: "no-store",
      });
      const data = await res.json();
      if (!data?.success) {
        throw new Error(data?.message || "like failed");
      }
      // 서버 카운트로 동기화
      setCount(data.likeCount);
    } catch (e) {
      console.error(e);
      // 실패 시 롤백
      setLiked(initialLiked);
      setCount(initialCount);
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={liked || pending}
      className={liked ? "bg-[#1976D2] hover:bg-blue-700" : "hover:bg-gray-50"}
    >
      <ThumbsUp className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
      {count}
    </Button>
  );
}
