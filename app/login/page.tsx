"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MessageCircle, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/Header";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // setIsLoading(true);
    // setError("");

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // if (formData.id !== "admin" || formData.password !== "password") {
    //   setError("아이디나 비밀번호가 잘못되었습니다");
    //   setIsLoading(false);
    //   return;
    // }

    // window.location.href = "/";
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate login process
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // 추가
      });

      const data = await res.json();

      // Simple validation for demo
      if (res.ok && data.success) {
        // Simulate successful login
        router.push("/"); // 메인 페이지로 이동
        router.refresh();
      } else {
        setError("Invalid ID or password. Try 'admin' / 'pixel123'");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header pathname={pathname} />

      {/* Login Form */}
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              로그인
            </CardTitle>
            <p className="text-gray-600 mt-2">woori I zikimi에 로그인하세요</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">아이디</Label>
                <Input
                  id="id"
                  name="id"
                  type="text"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="아이디를 입력하세요"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>

                <div className="relative">
                  {/* 비밀번호 입력 */}
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력하세요"
                    required
                    className="w-full pr-10" // 오른쪽 아이콘 자리 확보
                  />

                  {/* 보이기/숨기기 버튼 */}
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()} // 포커스 잃지 않게
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#005fa3] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#0074c9] hover:bg-[#005fa3]"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
