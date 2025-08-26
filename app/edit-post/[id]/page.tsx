"use client";

import type React from "react";
import router from "next/router";

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
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/Header";

export default function UpdatePostPage() {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
    });
    const [isPreview, setIsPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const categories = [
        {
            value: "자유",
            label: "자유",
            color: "bg-blue-100 text-blue-800",
        },
        {
            value: "면접",
            label: "면접",
            color: "bg-green-100 text-green-800",
        },
        {
            value: "프로젝트",
            label: "프로젝트",
            color: "bg-purple-100 text-purple-800",
        },
        {
            value: "수업",
            label: "수업",
            color: "bg-orange-100 text-orange-800",
        },
    ];

    // 홈 핸들
    const handleHomeClick = () => {
        router.push("/");
        router.refresh();
    };

    // 내 글 보기 핸들
    const handleMyPost = () => {
        router.push("/my-posts");
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

    // 질문 작성 API(POST)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 코드와 내용 분리
        const { codeBlocks, contentWithoutCode } = extractCodeBlocks(
            formData.content
        );

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                credentials: "include",
                body: JSON.stringify({
                    title: formData.title,
                    content: contentWithoutCode,
                    code: codeBlocks.join("\n\n"), // 여러 개면 합쳐서 전달
                    category: formData.category,
                    isAnswered: false, // 기본값
                }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                console.log(error);
                throw new Error(error || "작성 실패");
            }

            const { post } = await res.json();

            alert("게시글이 성공적으로 작성되었습니다!");

            // 이동
            if (post?.id != null) {
                router.push(`/post/${post.id}`);
                router.refresh(); // 최신화
            } else {
                // 혹시 id가 누락된 예외 케이스 대비
                alert("작성은 되었지만 ID를 받지 못했어요. 홈으로 이동합니다.");
                handleHomeClick();
            }

            setFormData({ title: "", content: "", category: "" });
        } catch (err: any) {
            alert(err?.message ?? "작성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const insertCodeBlock = () => {
        const codeTemplate =
            '\n```\n// 여기에 코드를 입력하세요\nconsole.log("Hello World!");\n```\n';
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

    // 코드 블록 추출 함수
    const extractCodeBlocks = (text: string) => {
        const codeBlocks: string[] = [];

        // 코드 블록을 찾아서 codeBlocks에 담고, 본문에서는 제거
        const contentWithoutCode = text.replace(
            /```(\w+)?\n([\s\S]*?)```/g,
            (_, __, code) => {
                codeBlocks.push(code.trim()); // 코드 부분만 저장
                return ""; // 본문에서는 제거
            }
        );

        return { codeBlocks, contentWithoutCode: contentWithoutCode.trim() };
    };

    const selectedCategory = categories.find(
        (cat) => cat.value === formData.category
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header pathname="/new-post" />

            {/* 질문 작성 부분 */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            새 질문 작성
                        </CardTitle>
                        <p className="text-gray-600">
                            개발 관련 질문을 작성해보세요
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 제목 입력 칸 */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="title"
                                    className="text-base font-medium"
                                >
                                    제목
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        handleChange("title", e.target.value)
                                    }
                                    placeholder="질문 제목을 입력하세요"
                                    required
                                    className="text-base"
                                />
                            </div>

                            {/* 카테고리 입력 칸 */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium">
                                    카테고리
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        handleChange("category", value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="카테고리를 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.value}
                                                value={category.value}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={
                                                            category.color
                                                        }
                                                    >
                                                        {category.label}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCategory && (
                                    <div className="mt-2">
                                        <Badge
                                            className={selectedCategory.color}
                                        >
                                            {selectedCategory.label}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* 내용 입력 칸 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">
                                        내용
                                    </Label>
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
                                            onClick={() =>
                                                setIsPreview(!isPreview)
                                            }
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
                                            __html: renderMarkdown(
                                                formData.content
                                            ),
                                        }}
                                    />
                                ) : (
                                    <Textarea
                                        value={formData.content}
                                        onChange={(e) =>
                                            handleChange(
                                                "content",
                                                e.target.value
                                            )
                                        }
                                        placeholder="질문 내용을 마크다운으로 작성하세요...

예시:
**굵은 글씨**
*기울임 글씨*
`인라인 코드`

```
// 코드 블록
console.log('Hello World!');
```"
                                        required
                                        className="min-h-[300px] text-base font-mono"
                                    />
                                )}

                                <p className="text-sm text-gray-500">
                                    마크다운 문법을 지원합니다. **굵게**,
                                    *기울임*, `코드`, 코드 블록 등을 사용할 수
                                    있습니다.
                                </p>
                            </div>

                            {/* 작성/취소 버튼 */}
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
