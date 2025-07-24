import Link from "next/link"
import { posts } from "../../data/posts"
import { notFound } from "next/navigation"
import ScrollingSidebar from "../../components/ScrollingSidebar"
import CategorySearchAndNewPost from "../../components/CategorySearchAndNewPost"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)
  const categoryPosts = posts.filter((post) => post.category.toLowerCase() === params.slug)

  if (categoryPosts.length === 0) {
    notFound()
  }

  return (
    <div className="pr-16">
      {" "}
      {/* Reduced right padding */}
      <ScrollingSidebar />
      <h2 className="text-2xl font-pixel mb-6">{category} Posts</h2>
      <CategorySearchAndNewPost />
      <div className="grid gap-6">
        {categoryPosts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-pixel mb-2">{post.title}</h3>
            <p className="font-mono text-sm mb-3 text-gray-300">{post.content.slice(0, 150)}...</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-green-600 text-black text-sm font-mono rounded">
                  {post.category}
                </span>
                <span className="text-xs font-mono text-gray-500">3 days ago</span>
              </div>
              <div className="flex gap-4 text-xs font-mono text-gray-400">
                <span>💬 {Math.floor(Math.random() * 20) + 5}</span>
                <span>❤️ {Math.floor(Math.random() * 50) + 10}</span>
              </div>
            </div>
          </Link>
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
