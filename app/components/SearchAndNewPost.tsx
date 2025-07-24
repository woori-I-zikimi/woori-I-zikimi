"use client"

import { useState } from "react"
import { Search, Plus } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

const SearchAndNewPost = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleNewPost = () => {
    router.push('/new-post')
  }

  return (
    <div className="flex items-center gap-3 mb-8">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="font-mono pl-10 pr-4 bg-gray-800 border-gray-600 focus:border-green-400 pixelated-border w-80"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </form>
      
      <Button
        onClick={handleNewPost}
        className="font-pixel text-xs bg-green-600 hover:bg-green-500 flex items-center gap-2 pixelated-border"
      >
        <Plus className="w-4 h-4" />
        New Post
      </Button>
    </div>
  )
}

export default SearchAndNewPost
