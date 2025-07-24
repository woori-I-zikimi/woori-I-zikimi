"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, User, Lock,  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PixelLogo from "../components/PixelLogo"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login process
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simple validation for demo
      if (formData.id === "admin" && formData.password === "pixel123") {
        // Simulate successful login
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userId", formData.id)
        window.location.href = "/"
      } else {
        setError("Invalid ID or password. Try 'admin' / 'pixel123'")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
      
        {/* Login Card */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <PixelLogo />
            <h1 className="text-2xl font-pixel mb-2">Player Login</h1>
            <p className="font-mono text-sm text-gray-400">Enter your credentials to continue</p>
          </div>

          {/* Error Message */}
          {error && <div className="mb-4 p-3 bg-red-900/50 rounded text-red-400 font-mono text-sm">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div>
              <label htmlFor="id" className="block text-sm font-pixel mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="Enter your user ID"
                  className="pl-10 font-mono bg-gray-700 border-gray-600 focus:border-green-400 focus:ring-green-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-pixel mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 font-mono bg-gray-700 border-gray-600 focus:border-green-400 focus:ring-green-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <span className="ml-2 text-sm font-mono">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-mono text-green-400 hover:text-green-300 underline">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.id || !formData.password}
              className="w-full font-pixel bg-green-600 hover:bg-green-500 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
}

export default LoginPage
