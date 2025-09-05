"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send } from "lucide-react";
import p5 from "p5";

interface Comment {
    id: number;
    text: string;
    timestamp: Date;
    author: string;
}

interface Question {
    id: number;
    text: string;
    timestamp: Date;
    color: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    comments: Comment[];
}

const bubbleColors = [
    "#15803d",
    "#f59e0b",
    "#3b82f6",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
];

export default function QuestionBoard() {
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            text: "웹소켓에 대해 설명해주실 분 계신가요?\n\n웹소켓은 실시간 양방향 통신을 위한 프로토콜입니다!",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            color: bubbleColors[0],
            x: Math.random() * 800 + 100,
            y: Math.random() * 200 + 300,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.max(
                48,
                Math.min(
                    120,
                    (60 + "웹소켓에 대해 설명해주실 분 계신가요?".length * 3) *
                        0.64
                )
            ),
            mass: Math.max(
                1,
                "웹소켓에 대해 설명해주실 분 계신가요?".length * 0.1
            ),
            comments: [
                {
                    id: 1,
                    text: "웹소켓은 실시간 양방향 통신을 위한 프로토콜입니다!",
                    timestamp: new Date(Date.now() - 1000 * 60 * 20),
                    author: "개발자A",
                },
            ],
        },
        {
            id: 2,
            text: "React 18의 새로운 기능들이 궁금해요!\n\nReact 18에서 도입된 새로운 기능들은 다음과 같습니다...",
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            color: bubbleColors[1],
            x: Math.random() * 800 + 100,
            y: Math.random() * 200 + 300,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.max(
                48,
                Math.min(
                    120,
                    (60 + "React 18의 새로운 기능들이 궁금해요!".length * 3) *
                        0.64
                )
            ),
            mass: Math.max(
                1,
                "React 18의 새로운 기능들이 궁금해요!".length * 0.1
            ),
            comments: [],
        },
        {
            id: 3,
            text: "TypeScript 타입 가드 사용법?\n\n타입 가드는 TypeScript에서 유용한 기능입니다...",
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            color: bubbleColors[2],
            x: Math.random() * 800 + 100,
            y: Math.random() * 200 + 300,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.max(
                48,
                Math.min(
                    120,
                    (60 + "TypeScript 타입 가드 사용법?".length * 3) * 0.64
                )
            ),
            mass: Math.max(1, "TypeScript 타입 가드 사용법?".length * 0.1),
            comments: [],
        },
        {
            id: 4,
            text: "Next.js 13 App Router 어떻게 사용하나요?\n\nNext.js 13의 App Router는 다음과 같이 사용할 수 있습니다...",
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            color: bubbleColors[3],
            x: Math.random() * 800 + 100,
            y: Math.random() * 200 + 300,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.max(
                48,
                Math.min(
                    120,
                    (60 +
                        "Next.js 13 App Router 어떻게 사용하나요?".length * 3) *
                        0.64
                )
            ),
            mass: Math.max(
                1,
                "Next.js 13 App Router 어떻게 사용하나요?".length * 0.1
            ),
            comments: [],
        },
        {
            id: 5,
            text: "CSS Grid vs Flexbox 언제 뭘 써야 할까요?\n\nCSS Grid와 Flexbox는 각각 다른 상황에서 사용됩니다...",
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            color: bubbleColors[4],
            x: Math.random() * 800 + 100,
            y: Math.random() * 200 + 300,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.max(
                48,
                Math.min(
                    120,
                    (60 +
                        "CSS Grid vs Flexbox 언제 뭘 써야 할까요?".length * 3) *
                        0.64
                )
            ),
            mass: Math.max(
                1,
                "CSS Grid vs Flexbox 언제 뭘 써야 할까요?".length * 0.1
            ),
            comments: [],
        },
    ]);
    const [newQuestion, setNewQuestion] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
        null
    );
    const [newComment, setNewComment] = useState("");
    const [inputRows, setInputRows] = useState(1);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const p5InstanceRef = useRef<p5 | null>(null);

    const questionsRef = useRef<Question[]>(questions);
    const selectedQuestionRef = useRef<Question | null>(null);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    useEffect(() => {
        selectedQuestionRef.current = selectedQuestion;
    }, [selectedQuestion]);

    useEffect(() => {
        const textLength = newQuestion.length;
        const lineCount = newQuestion.split("\n").length;
        const estimatedLines = Math.max(lineCount, Math.ceil(textLength / 50));

        const newRows = Math.min(Math.max(1, estimatedLines), 4);
        setInputRows(newRows);

        // setInputScale(1) // Removed this line as it was causing an error
    }, [newQuestion]);

    useEffect(() => {
        const loadP5 = async () => {
            if (!canvasRef.current) {
                setTimeout(loadP5, 100);
                return;
            }

            const p5 = (await import("p5")).default;

            const sketch = (p: p5) => {
                const buoyancy = -0.05;
                const friction = 0.99;
                const bounce = 0.8;

                p.setup = () => {
                    if (canvasRef.current) {
                        const canvas = p.createCanvas(
                            p.windowWidth,
                            p.windowHeight - 200
                        );
                        canvas.parent(canvasRef.current);
                    }
                };

                p.draw = () => {
                    p.background(248, 250, 252);

                    const currentQuestions = questionsRef.current.map(
                        (question) => {
                            const newQuestion = { ...question };

                            const mouseDistance = Math.sqrt(
                                (p.mouseX - newQuestion.x) ** 2 +
                                    (p.mouseY - newQuestion.y) ** 2
                            );
                            const isHovered =
                                mouseDistance < newQuestion.radius;

                            newQuestion.vy += buoyancy / newQuestion.mass;

                            newQuestion.vx += (Math.random() - 0.5) * 0.02;
                            newQuestion.vy += (Math.random() - 0.5) * 0.02;

                            if (isHovered) {
                                newQuestion.vy -= 0.1;
                                newQuestion.vx += (Math.random() - 0.5) * 0.1;
                            }

                            newQuestion.x += newQuestion.vx;
                            newQuestion.y += newQuestion.vy;

                            newQuestion.vx *= friction;
                            newQuestion.vy *= friction;

                            if (newQuestion.y - newQuestion.radius < 0) {
                                newQuestion.y = newQuestion.radius;
                                newQuestion.vy *= -bounce;
                            }

                            if (
                                newQuestion.y + newQuestion.radius >
                                p.height - 100
                            ) {
                                newQuestion.y =
                                    p.height - 100 - newQuestion.radius;
                                newQuestion.vy *= -bounce;
                            }

                            if (newQuestion.x - newQuestion.radius < 0) {
                                newQuestion.x = newQuestion.radius;
                                newQuestion.vx *= -bounce;
                            }
                            if (newQuestion.x + newQuestion.radius > p.width) {
                                newQuestion.x = p.width - newQuestion.radius;
                                newQuestion.vx *= -bounce;
                            }

                            return newQuestion;
                        }
                    );

                    for (let i = 0; i < currentQuestions.length; i++) {
                        for (let j = i + 1; j < currentQuestions.length; j++) {
                            const q1 = currentQuestions[i];
                            const q2 = currentQuestions[j];

                            const dx = q2.x - q1.x;
                            const dy = q2.y - q1.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const minDistance = q1.radius + q2.radius;

                            if (distance < minDistance) {
                                const angle = Math.atan2(dy, dx);
                                const targetX =
                                    q1.x + Math.cos(angle) * minDistance;
                                const targetY =
                                    q1.y + Math.sin(angle) * minDistance;

                                const ax = (targetX - q2.x) * 0.05;
                                const ay = (targetY - q2.y) * 0.05;

                                q1.vx -= ax / q1.mass;
                                q1.vy -= ay / q1.mass;
                                q2.vx += ax / q2.mass;
                                q2.vy += ay / q2.mass;
                            }
                        }
                    }

                    questionsRef.current = currentQuestions;
                    setQuestions(currentQuestions);

                    currentQuestions.forEach((question) => {
                        const mouseDistance = Math.sqrt(
                            (p.mouseX - question.x) ** 2 +
                                (p.mouseY - question.y) ** 2
                        );
                        const isHovered = mouseDistance < question.radius;
                        const hoverScale = isHovered ? 1.05 : 1;

                        p.fill(0, 0, 0, 20);
                        p.noStroke();
                        p.ellipse(
                            question.x + 2,
                            question.y + 4,
                            question.radius * 2,
                            question.radius * 2.2
                        );

                        p.stroke(100, 100, 100, 120);
                        p.strokeWeight(1.5);
                        const stringWave = isHovered
                            ? Math.sin(Date.now() * 0.005 + question.id) * 8
                            : Math.sin(Date.now() * 0.001 + question.id) * 5;
                        // 삼각형 입구 끝부분에서 시작하여 아래로 끈 그리기
                        const stringStartY =
                            question.y + question.radius * 1.1 * hoverScale;
                        p.line(
                            question.x,
                            stringStartY,
                            question.x + stringWave,
                            stringStartY + 50
                        );

                        // const [r, g, b] = p.color(question.color).levels;
                        const col = p.color(question.color);
                        const r = p.red(col);
                        const g = p.green(col);
                        const b = p.blue(col);

                        p.fill(r, g, b, 200);
                        p.stroke(255, 255, 255, 100);
                        p.strokeWeight(2);
                        p.ellipse(
                            question.x,
                            question.y,
                            question.radius * 2 * hoverScale,
                            question.radius * 2.2 * hoverScale
                        );

                        p.fill(r * 0.8, g * 0.8, b * 0.8, 200);
                        p.noStroke();
                        p.triangle(
                            question.x - 4 * hoverScale,
                            question.y + question.radius * 0.9 * hoverScale,
                            question.x + 4 * hoverScale,
                            question.y + question.radius * 0.9 * hoverScale,
                            question.x,
                            question.y + question.radius * 1.1 * hoverScale
                        );

                        p.fill(255, 255, 255, 220);
                        p.textAlign(p.CENTER, p.CENTER);
                        p.textSize(14);
                        p.textStyle(p.BOLD);

                        const { title } = parseQuestionText(question.text);
                        const maxWidth = question.radius * 0.8;

                        let line1 = "";
                        let line2 = "";
                        let currentLine = 1;

                        for (let i = 0; i < title.length; i++) {
                            const char = title[i];
                            const testLine =
                                currentLine === 1 ? line1 + char : line2 + char;
                            const testWidth = p.textWidth(testLine);

                            if (testWidth > maxWidth) {
                                if (currentLine === 1) {
                                    currentLine = 2;
                                    line2 = char;
                                } else {
                                    line2 = testLine;
                                }
                            } else {
                                if (currentLine === 1) {
                                    line1 = testLine;
                                } else {
                                    line2 = testLine;
                                }
                            }
                        }

                        const lineHeight = 18;
                        if (line2.trim()) {
                            p.text(
                                line1.trim(),
                                question.x,
                                question.y - lineHeight / 2
                            );
                            p.text(
                                line2.trim(),
                                question.x,
                                question.y + lineHeight / 2
                            );
                        } else {
                            p.text(line1.trim(), question.x, question.y);
                        }
                    });
                };

                p.mousePressed = () => {
                    if (selectedQuestionRef.current) {
                        return false;
                    }

                    questionsRef.current.forEach((question) => {
                        const distance = Math.sqrt(
                            (p.mouseX - question.x) ** 2 +
                                (p.mouseY - question.y) ** 2
                        );
                        if (distance < question.radius) {
                            setSelectedQuestion(question);
                        }
                    });

                    return false;
                };

                p.windowResized = () => {
                    p.resizeCanvas(p.windowWidth, p.windowHeight - 200);
                };
            };

            if (p5InstanceRef.current) {
                p5InstanceRef.current.remove();
            }

            p5InstanceRef.current = new p5(sketch);
        };

        const timer = setTimeout(loadP5, 100);

        return () => {
            clearTimeout(timer);
            if (p5InstanceRef.current) {
                p5InstanceRef.current.remove();
            }
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestion.trim()) {
            const { title } = parseQuestionText(newQuestion.trim());
            const limitedTitle = title.length > 20 ? title.slice(0, 20) : title;
            const finalText = newQuestion
                .trim()
                .split("\n")
                .map((line, index) => (index === 0 ? limitedTitle : line))
                .join("\n");

            const radius = Math.max(
                48,
                Math.min(120, (60 + limitedTitle.length * 3) * 0.64)
            );

            const question: Question = {
                id: Date.now(),
                text: finalText,
                timestamp: new Date(),
                color: bubbleColors[
                    Math.floor(Math.random() * bubbleColors.length)
                ],
                x: Math.random() * (window.innerWidth - 200) + 100,
                y: window.innerHeight - 200,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 2,
                radius,
                mass: Math.max(1, limitedTitle.length * 0.1),
                comments: [],
            };
            setQuestions((prev) => [...prev, question]);
            setNewQuestion("");
            setInputRows(1);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && selectedQuestion) {
            const comment: Comment = {
                id: Date.now(),
                text: newComment.trim(),
                timestamp: new Date(),
                author: `익명${Math.floor(Math.random() * 1000)}`,
            };

            setQuestions((prev) =>
                prev.map((q) =>
                    q.id === selectedQuestion.id
                        ? { ...q, comments: [...q.comments, comment] }
                        : q
                )
            );

            setSelectedQuestion((prev) =>
                prev ? { ...prev, comments: [...prev.comments, comment] } : null
            );
            setNewComment("");
        }
    };

    const parseQuestionText = (text: string) => {
        const lines = text.split("\n");
        const title = lines[0] || "";
        const body = lines.slice(2).join("\n") || ""; // 세 번째 줄부터 본문
        return { title, body };
    };

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            <div
                ref={canvasRef}
                className="w-full"
                style={{
                    height: "calc(100vh - 200px)",
                    pointerEvents: selectedQuestion ? "none" : "auto",
                }}
            />

            <div className="fixed bottom-0 left-0 right-0 h-32 bg-slate-50 border-t border-gray-200 flex items-center justify-center px-4 z-50">
                <div className="w-full max-w-lg">
                    <textarea
                        ref={inputRef}
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("[v0] Textarea clicked");
                        }}
                        onFocus={() => {
                            console.log("[v0] Textarea focused");
                        }}
                        placeholder="질문을 입력하세요"
                        rows={inputRows}
                        autoFocus
                        className="w-full px-4 py-3 text-black placeholder:text-gray-500 bg-white border-2 border-gray-300 rounded-2xl shadow-lg resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-text"
                        style={{
                            minHeight: "48px",
                            maxHeight: "120px",
                            pointerEvents: "auto",
                            userSelect: "text",
                            cursor: "text",
                        }}
                        disabled={false}
                        readOnly={false}
                        tabIndex={0}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-6" style={{ zIndex: 9998 }}>
                <div className="text-primary font-bold text-lg">
                    woori | zikimi
                </div>
            </div>

            {selectedQuestion && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ease-out"
                    style={{ backgroundColor: selectedQuestion.color }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.target === e.currentTarget) {
                            setSelectedQuestion(null);
                        }
                    }}
                >
                    <div
                        className="bg-white/95 backdrop-blur-sm rounded-3xl w-full max-w-6xl h-[80vh] shadow-2xl flex overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="flex-1 p-8 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <div
                                        className="w-8 h-8 rounded-full mb-4"
                                        style={{
                                            backgroundColor:
                                                selectedQuestion.color,
                                        }}
                                    />
                                    <p className="text-sm text-gray-500 mb-2">
                                        {selectedQuestion.timestamp.toLocaleString(
                                            "ko-KR"
                                        )}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedQuestion(null);
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div
                                className="space-y-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {(() => {
                                    const { title, body } = parseQuestionText(
                                        selectedQuestion.text
                                    );
                                    return (
                                        <>
                                            <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                                                {title}
                                            </h2>

                                            {body && (
                                                <div
                                                    className="bg-gray-50 rounded-2xl p-6"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                        {body}
                                                    </p>
                                                </div>
                                            )}

                                            {!body && (
                                                <div
                                                    className="bg-gray-50 rounded-2xl p-6"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <p className="text-gray-600 leading-relaxed">
                                                        이 질문에 대한 답변을
                                                        기다리고 있어요!
                                                        오른쪽에서 댓글로
                                                        답변해주세요. 🎈
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div
                            className="w-96 border-l border-gray-200 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="p-6 border-b border-gray-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold text-gray-900">
                                    댓글 ({selectedQuestion.comments.length})
                                </h3>
                            </div>

                            <div
                                className="flex-1 overflow-y-auto p-6 space-y-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {selectedQuestion.comments.length === 0 ? (
                                    <p
                                        className="text-gray-500 text-center py-8"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        아직 댓글이 없어요.
                                        <br />첫 번째 댓글을 남겨보세요! 💬
                                    </p>
                                ) : (
                                    selectedQuestion.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="bg-gray-50 rounded-2xl p-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            selectedQuestion.color,
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {comment.author}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {comment.timestamp.toLocaleString(
                                                        "ko-KR"
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed">
                                                {comment.text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div
                                className="p-6 border-t border-gray-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form
                                    onSubmit={handleAddComment}
                                    className="space-y-3"
                                >
                                    <Input
                                        value={newComment}
                                        onChange={(e) =>
                                            setNewComment(e.target.value)
                                        }
                                        placeholder="댓글을 입력하세요..."
                                        className="w-full"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        style={{
                                            backgroundColor:
                                                selectedQuestion.color,
                                        }}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        댓글 달기
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
