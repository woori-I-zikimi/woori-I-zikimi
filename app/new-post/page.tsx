"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Home, User, Plus, Code, Eye, Edit, MessageCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const categories = [
    {
      value: "frontend",
      label: "프론트엔드",
      color: "bg-blue-100 text-blue-800",
    },
    { value: "backend", label: "백엔드", color: "bg-green-100 text-green-800" },
    {
      value: "mobile",
      label: "모바일",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "devops",
      label: "DevOps",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "database",
      label: "데이터베이스",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "algorithm",
      label: "알고리즘",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "career", label: "커리어", color: "bg-gray-100 text-gray-800" },
  ];

  // 홈 핸들
  const handleHomeClick = () => {
    router.push("/");
    router.refresh();
  };

  // 로그아웃 핸들
  const handleLogout = async () => {
    // console.log("로그아웃 클릭됨");
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    router.push("/login");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate post creation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    alert("게시글이 성공적으로 작성되었습니다!");
    setIsLoading(false);

    // Reset form
    setFormData({ title: "", content: "", category: "" });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const insertCodeBlock = () => {
    const codeTemplate =
      '\n```javascript\n// 여기에 코드를 입력하세요\nconsole.log("Hello World!");\n```\n';
    setFormData((prev) => ({
      ...prev,
      content: prev.content + codeTemplate,
    }));
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$2</code></pre>'
      )
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>'
      )
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  };

  const selectedCategory = categories.find(
    (cat) => cat.value === formData.category
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0074c9] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Home Button (icon only) */}
            <Button
              variant="ghost"
              className="text-white hover:text-blue-100 hover:bg-[#005fa3]"
              onClick={() => handleHomeClick()}
            >
              <Home className="w-4 h-4" />
            </Button>

            {/* Center - Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#0074c9]" />
              </div>
              <h1 className="text-lg font-bold text-white">woori I zikimi</h1>
            </div>

            {/* Right - Write Button & Profile */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 rounded-full p-0 text-white hover:text-blue-100 hover:bg-[#005fa3]"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>View My Posts</DropdownMenuItem>
                  <DropdownMenuItem>Change Password</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => handleLogout()}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              새 질문 작성
            </CardTitle>
            <p className="text-gray-600">개발 관련 질문을 작성해보세요</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  제목
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="질문 제목을 입력하세요"
                  required
                  className="text-base"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-base font-medium">카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={category.color}>
                            {category.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <div className="mt-2">
                    <Badge className={selectedCategory.color}>
                      {selectedCategory.label}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">내용</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertCodeBlock}
                    >
                      <Code className="w-4 h-4 mr-1" />
                      코드 블록
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreview(!isPreview)}
                    >
                      {isPreview ? (
                        <Edit className="w-4 h-4 mr-1" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      {isPreview ? "편집" : "미리보기"}
                    </Button>
                  </div>
                </div>

                {isPreview ? (
                  <div
                    className="min-h-[300px] p-4 border rounded-lg bg-white prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(formData.content),
                    }}
                  />
                ) : (
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="질문 내용을 마크다운으로 작성하세요...

예시:
**굵은 글씨**
*기울임 글씨*
`인라인 코드`

```javascript
// 코드 블록
console.log('Hello World!');
```"
                    required
                    className="min-h-[300px] text-base font-mono"
                  />
                )}

                <p className="text-sm text-gray-500">
                  마크다운 문법을 지원합니다. **굵게**, *기울임*, `코드`, 코드
                  블록 등을 사용할 수 있습니다.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-[#1976D2] hover:bg-[#005fa3] px-8"
                  disabled={isLoading}
                >
                  {isLoading ? "작성 중..." : "질문 작성"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
