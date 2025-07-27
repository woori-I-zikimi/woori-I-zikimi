"use client";

import { useEffect, useState, useTransition } from "react";

type Props = {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
};

export default function PostLikeButton({
  postId,
  initialLiked,
  initialCount,
}: Props) {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // SSR에서 받은 초기값을 클라이언트 상태로 확실히 반영
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const toggleLike = async () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to toggle like");

        const data = await res.json();

        setLiked(data.liked);
        setCount(data.count);
      } catch (err) {
        console.error("Error toggling like", err);
      }
    });
  };

  if (liked === null || count === null) {
    return null; // or 로딩 상태 반환해도 됨
  }

  return (
    <button
      onClick={toggleLike}
      disabled={isPending}
      className={`text-sm font-mono px-4 py-2 rounded-full transition-colors ${
        liked
          ? "bg-green-600 text-black hover:bg-green-500"
          : "bg-gray-700 text-gray-200 hover:bg-gray-600"
      }`}
    >
      ❤️ {count}
    </button>
  );
}
