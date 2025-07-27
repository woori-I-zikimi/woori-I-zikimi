"use client"

import Link from "next/link"
import ScrollingSidebar from "./components/ScrollingSidebar"
import SearchAndNewPost from "./components/SearchAndNewPost"
import { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
        async function fetchPosts() {
            const res = await fetch("/api/posts");
            const data = await res.json();
            if (data.success) {
                setPosts(data.posts);
                
            }
        }
        fetchPosts();
    }, []);



  return (
    <div className="pr-16">
      {" "}
      {/* Reduced right padding */}
      <ScrollingSidebar />
      <SearchAndNewPost />
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h4 className="text-lg font-pixel mb-2">{post.title}</h4>
            <p className="font-mono text-sm mb-3 text-gray-300">{post.content.slice(0, 150)}...</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-green-600 text-black text-sm font-mono rounded">
                  {post.category}
                </span>
                <span className="text-xs font-mono text-gray-500">2 days ago</span>
              </div>
              <div className="flex gap-4 text-xs font-mono text-gray-400">
                <span>💬 {8}</span>
                <span>❤️ {Number(post.likeCount ?? 0)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
