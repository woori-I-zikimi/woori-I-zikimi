"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Comment {
  id: string
  content: string
  authorId: string
  postId: string
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState({ authorId: "", content: "" })

    // 댓글 불러오기
  useEffect(() => {
    async function fetchComments() {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();
      if (data.success) setComments(data.comments);
    }
    fetchComments();
  }, [postId]);

  
  // 댓글 추가
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handel 실행됨');
    console.log("postId:", postId, "content:", newComment);
    
    e.preventDefault();
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, ...newComment }),
      credentials: "include",
    });

    setNewComment({ authorId: "", content: "" });
     // 다시 댓글 목록 불러오기
    const res = await fetch(`/api/comments?postId=${postId}`);
    const data = await res.json();
    if (data.success) setComments(data.comments);



  }

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg pixelated-border">
      <h3 className="text-2xl font-pixel mb-4">Comments</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 p-2 bg-gray-700 rounded">
          {/* <p className="font-mono text-green-400">{comment.authorId}:</p> */}
          <p className="font-mono">{comment.content}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-4">
        {/* <Input
          type="text"
          placeholder="Your name"
          value={newComment.authorId}
          onChange={(e) => setNewComment({ ...newComment, authorId: e.target.value })}
          className="mb-2 font-mono"
        /> */}
        <Textarea
          placeholder="Your comment"
          value={newComment.content}
          onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
          className="mb-2 font-mono"
        />
        <Button type="submit" className="font-pixel">
          Submit
        </Button>
      </form>
    </div>
  )
}


