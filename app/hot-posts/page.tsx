import Link from "next/link"
import { posts } from "../data/posts"
import { Flame } from "lucide-react"
import ScrollingSidebar from "../components/ScrollingSidebar"
import CategorySearchAndNewPost from "../components/CategorySearchAndNewPost"

// Simulate hot posts with mock like counts
const hotPosts = posts
  .map((post) => ({
    ...post,
    likes: Math.floor(Math.random() * 100) + 20, // Random likes between 20-120
    views: Math.floor(Math.random() * 1000) + 100, // Random views
    comments: Math.floor(Math.random() * 50) + 5, // Random comments
  }))
  .sort((a, b) => b.likes - a.likes) // Sort by likes descending

export default function HotPostsPage() {
  return (
    <div className="pr-16">
      {" "}
      {/* Add right padding for sidebar */}
      <ScrollingSidebar />
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-8 h-8 text-red-400" />
        <h1 className="text-3xl font-pixel">Hot Posts</h1>
        <Flame className="w-8 h-8 text-red-400" />
      </div>
      <CategorySearchAndNewPost />
      <p className="font-mono text-gray-400 mb-8">
        🔥 The most liked posts in the pixel universe! These posts are on fire!
      </p>
      <div className="space-y-6">
        {hotPosts.map((post, index) => (
          <div key={post.id} className="p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors relative">
            {/* Hot rank badge */}
            <div className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-pixel text-xs">
              #{index + 1}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Link href={`/post/${post.id}`} className="text-xl font-pixel hover:text-green-300 transition-colors">
                  {post.title}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2 py-1 bg-green-600 text-black text-sm font-mono rounded">
                    {post.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="font-mono text-sm text-gray-300 mb-4">{post.content.slice(0, 200)}...</p>

            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-sm font-mono">
                <span className="flex items-center gap-1 text-red-400">❤️ {post.likes} likes</span>
                <span className="flex items-center gap-1 text-blue-400">👀 {post.views} views</span>
                <span className="flex items-center gap-1 text-green-400">💬 {post.comments} comments</span>
              </div>
              <Link
                href={`/post/${post.id}`}
                className="font-pixel text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Read More →
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/" className="font-pixel text-sm text-green-400 hover:text-green-300 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
