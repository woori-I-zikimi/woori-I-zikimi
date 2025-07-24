"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Monitor, Palette, DollarSign, Flame, Home } from 'lucide-react'

interface ScrollingSidebarProps {
  onCategoryFilter?: (category: string | null) => void
  selectedCategory?: string | null
}

const ScrollingSidebar = ({ onCategoryFilter, selectedCategory }: ScrollingSidebarProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const categories = [
    { name: "All", value: null, icon: Home, href: "/" },
    { name: "자유", value: "Free", icon: Monitor, href: "/category/free" },
    { name: "면접", value: "Art", icon: Palette, href: "/category/interview" },
    { name: "프로젝트", value: "Finance", icon: DollarSign, href: "/category/project" },
    { name: "수업", value: "Finance", icon: DollarSign, href: "/category/class" },
  ]

  return (
    <div
      className={`fixed right-2 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
    >
      <div className="bg-gray-800 rounded-lg pixelated-border p-3 space-y-2 shadow-lg">
        {/* Categories */}
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = 
              (category.value === null && pathname === "/") ||
              (category.value && pathname === `/category/${category.value.toLowerCase()}`)
            
            return (
              <Link
                key={category.name}
                href={category.href}
                className={`w-full flex flex-col items-center p-2 rounded transition-colors text-xs font-pixel ${
                  isActive
                    ? "bg-green-600 text-black"
                    : "hover:bg-gray-700 text-green-400"
                }`}
                title={category.name}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px]">{category.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-600 my-2"></div>

        {/* Hot Posts Button */}
        <Link
          href="/hot-posts"
          className={`flex flex-col items-center p-2 rounded transition-colors text-xs font-pixel ${
            pathname === "/hot-posts"
              ? "bg-red-600 text-white"
              : "hover:bg-gray-700 text-red-400"
          }`}
          title="Hot Posts"
        >
          <Flame className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Hot</span>
        </Link>
      </div>
    </div>
  )
}

export default ScrollingSidebar
