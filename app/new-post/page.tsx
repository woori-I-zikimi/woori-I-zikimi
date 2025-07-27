"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Code, Save, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatePost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "", // Changed from tags array to single category string
  });
  // const [title, setTitle] = useState("");
  // const [content, setContent] = useState("");
  // const [category, setCategory] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const predefinedCategories = ["자유", "면접", "프로젝트", "수업"];

  const handleSelectCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category: category, // Set single category
    }));
  };

  const handleRemoveCategory = () => {
    setFormData((prev) => ({
      ...prev,
      category: "", // Clear the selected category
    }));
  };

  // TODO: 임시저장 함수 향후에 구현 예정
  // const handleSaveDraft = () => {
  //   // Save as draft logic
  //   console.log("Saved as draft:", { title, content, category });
  //   alert("Draft saved!");
  // };

  // 클라이언트(브라우저)에서 서버로 데이터를 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("formData 전송 전:", formData);

    const response = await fetch("/api/post/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        category: formData.category,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/");
    } else {
      console.error("등록 실패:", data);
      alert(`등록 실패: ${data.error || "Unknown error"}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-pixel mb-2">Create New Post</h1>
      </div>

      {/* 질문 작성 프레임 */}
      <div className="bg-gray-800 rounded-lg pixelated-border p-6">
        <form className="space-y-6">
          {/* 제목 섹션 */}
          <div>
            <h3 className="font-pixel text-lg mb-3 text-green-400">
              Post Title
            </h3>
            <Input
              type="text"
              placeholder="질문 제목을 입력하세요..."
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="font-mono text-lg bg-gray-700 border-gray-600 focus:border-green-400"
              required
            />
          </div>

          {/* 카테고리 섹션 */}
          <div>
            <h3 className="font-pixel text-lg mb-3 text-green-400">Category</h3>

            {/* 카테고리 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {predefinedCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className={`px-3 py-1 rounded font-mono text-sm transition-colors ${
                      formData.category === category
                        ? "bg-green-600 text-black"
                        : "bg-gray-700 text-green-400 hover:bg-gray-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 카테고리 */}
            {formData.category && (
              <div>
                <p className="font-mono text-sm mb-2">Selected Category:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-600 text-black font-mono flex items-center gap-1">
                    {formData.category}
                    <button
                      type="button"
                      onClick={handleRemoveCategory}
                      className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* 내용 섹션 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-pixel text-lg text-green-400">
                Post Content
              </h3>
              <Button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="font-mono bg-gray-700 text-green-400 hover:bg-gray-600"
              >
                {isPreview ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isPreview ? "Edit" : "Preview"}
              </Button>
            </div>

            {isPreview ? (
              <div className="min-h-[200px] p-4 bg-gray-900 rounded border border-gray-600">
                <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
                  {formData.content || "Nothing to preview yet..."}
                </div>
              </div>
            ) : (
              <Textarea
                placeholder="질문 내용을 작성해주세요..."
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                className="min-h-[200px] font-mono text-lg bg-gray-700 border-gray-600 focus:border-green-400 resize-none"
                required
              />
            )}
          </div>

          {/* 코드 작성 토글 */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              className="font-pixel bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {showCodeEditor ? "Hide Code Editor" : "Add Code Block"}
            </Button>
          </div>

          {/* 코드 작성란 */}
          {showCodeEditor && (
            <div>
              <h3 className="font-pixel text-lg mb-3 text-blue-400">
                Code Block
              </h3>
              <Textarea
                placeholder="// Add your code here
function pixelatedWisdom() {
  return 'Hello, World!';
}"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                className="min-h-[150px] font-mono text-sm bg-gray-900 border-gray-600 focus:border-blue-400 resize-none"
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-600">
            {/* TODO: 임시저장 버튼 향후에 구현 */}
            {/* <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="font-pixel text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button> */}

            <Button
              type="button"
              onClick={() => router.push("/")}
              className="font-pixel bg-gray-600 text-white hover:bg-gray-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              type="submit"
              className="font-pixel bg-green-600 text-black hover:bg-green-500"
              disabled={!formData.title || !formData.content}
            >
              Publish Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
