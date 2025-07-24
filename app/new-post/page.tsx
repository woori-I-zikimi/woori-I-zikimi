"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ScrollingSidebar from "../components/ScrollingSidebar"
import { Save, Eye } from 'lucide-react'

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Here you would make your actual API call to create the post
      console.log("New post created:", { title, content, category })
      
      // Redirect to the new post (simulate with ID)
      const newPostId = Math.floor(Math.random() * 1000) + 100
      router.push(`/post/${newPostId}`)
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = () => {
    // Save as draft logic
    console.log("Saved as draft:", { title, content, category })
    alert("Draft saved!")
  }

  return (
    <div className="pr-20">
      <ScrollingSidebar />
      
      <h1 className="text-3xl font-pixel mb-6">Create New Post</h1>
      
      <div className="bg-gray-800 rounded-lg pixelated-border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-pixel mb-2">
              Post Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-pixel mb-2">
              Category
            </label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tech">Tech</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-pixel mb-2">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your pixelated wisdom here..."
              className="font-mono min-h-[300px]"
              required
            />
          </div>

          {showPreview && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-pixel text-lg mb-2">Preview</h3>
              <div className="prose prose-invert prose-green max-w-none">
                <h1 className="font-pixel">{title || "Your Title Here"}</h1>
                {category && (
                  <span className="inline-block px-2 py-1 bg-green-600 text-black text-sm font-mono rounded mb-4">
                    {category}
                  </span>
                )}
                <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
                  {content || "Your content will appear here..."}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="font-pixel text-xs flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="font-pixel text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            
            <Button
              type="submit"
              className="font-pixel text-xs bg-green-600 hover:bg-green-500 flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="font-pixel text-sm text-green-400 hover:text-green-300"
        >
          ← Cancel
        </Button>
      </div>
    </div>
  )
}
