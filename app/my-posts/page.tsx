"use client"

import Link from "next/link"
import { useState } from "react"
import { posts } from "../data/posts"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ScrollingSidebar from "../components/ScrollingSidebar"
import SearchAndNewPost from "../components/SearchAndNewPost"

// Simulate user's posts (in a real app, this would come from your database)
const userPosts = posts.filter((_, index) => index % 2 === 0) // Mock: every other post belongs to user

export default function MyPostsPage() {
  const [myPosts, setMyPosts] = useState(userPosts)

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setMyPosts(myPosts.filter((post) => post.id !== postId))
      // In a real app, you'd make an API call here
      console.log(`Deleted post ${postId}`)
    }
  }

  const handleEditPost = (postId: number) => {
    // In a real app, navigate to edit page
    console.log(`Edit post ${postId}`)
  }

  return (
    <div className="pr-16">
      {" "}
      {/* Reduced right padding */}
      <ScrollingSidebar />
      <h1 className="text-3xl font-pixel mb-6">My Posts</h1>
      <SearchAndNewPost />
      {myPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-pixel mb-2">No Posts Yet</h2>
          <p className="font-mono text-gray-400 mb-6">
            You haven't written any posts yet. Start sharing your pixelated wisdom!
          </p>
          <Button className="font-pixel text-xs bg-green-600 hover:bg-green-500">Write Your First Post</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {myPosts.map((post) => (
            <div key={post.id} className="p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/post/${post.id}`} className="text-xl font-pixel hover:text-green-300 transition-colors">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-2 py-1 bg-green-600 text-black text-sm font-mono rounded">
                      {post.category}
                    </span>
                    <span className="text-sm font-mono text-gray-400">Published 2 days ago</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditPost(post.id)}
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="font-mono text-sm text-gray-300 mb-4">{post.content.slice(0, 200)}...</p>

              <div className="flex justify-between items-center text-sm font-mono text-gray-400">
                <div className="flex gap-4">
                  <span>👀 42 views</span>
                  <span>💬 8 comments</span>
                  <span>❤️ 15 likes</span>
                </div>
                <Link href={`/post/${post.id}`} className="text-green-400 hover:text-green-300 transition-colors">
                  View Post →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 text-center">
        <Link href="/" className="font-pixel text-sm text-green-400 hover:text-green-300 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
