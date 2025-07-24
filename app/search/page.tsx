"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { posts } from "../data/posts"
import ScrollingSidebar from "../components/ScrollingSidebar"
import SearchAndNewPost from "../components/SearchAndNewPost"
import { Search } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const searchResults = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="pr-16">
      <ScrollingSidebar />

      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-green-400" />
        <h1 className="text-2xl font-pixel">Search Results</h1>
      </div>

      <SearchAndNewPost />

      <p className="font-mono text-gray-400 mb-6">
        {query ? (
          <>
            Found <span className="text-green-400 font-bold">{searchResults.length}</span> results for "{query}"
          </>
        ) : (
          "Please enter a search term"
        )}
      </p>

      {searchResults.length > 0 ? (
        <div className="space-y-6">
          {searchResults.map((post) => (
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
                  <span className="text-xs font-mono text-gray-500">
                    Match found in {post.title.toLowerCase().includes(query.toLowerCase()) ? "title" : "content"}
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-mono text-gray-400">
                  <span>💬 {Math.floor(Math.random() * 15) + 3}</span>
                  <span>❤️ {Math.floor(Math.random() * 40) + 8}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-pixel mb-2">No Results Found</h2>
          <p className="font-mono text-gray-400 mb-6">
            Try searching with different keywords or browse our categories.
          </p>
          <Link
            href="/"
            className="font-pixel text-sm bg-green-600 text-black px-4 py-2 rounded hover:bg-green-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      ) : null}

      {query && (
        <div className="mt-8 text-center">
          <Link href="/" className="font-pixel text-sm text-green-400 hover:text-green-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      )}
    </div>
  )
}
