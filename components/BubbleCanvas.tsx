// src/components/BubbleCanvas.tsx
"use client";

import { useEffect, useRef } from "react";
import type p5 from "p5";
import type { Question } from "./types";

/** 풍선 물리 상태 */
type Physics = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
};

interface BubbleCanvasProps {
    questions: Question[]; // Firestore 원본
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>; // (현재는 사용 X)
    selectedQuestion: Question | null;
    setSelectedQuestion: (q: Question | null) => void;
}

/* ------------------ 헬퍼: 초기 위치/속도 ------------------ */
function initialPosFromBottom(W: number, H: number) {
    const marginX = 64;
    const x = marginX + Math.random() * Math.max(1, W - marginX * 2);
    const yBase = H - 140;
    const y = yBase + (Math.random() * 40 - 20); // ±20px
    return { x, y };
}
function initialVelocityUp() {
    const vy = -1.1 - Math.random() * 0.6; // 위로(-)
    const vx = (Math.random() - 0.5) * 0.4; // 좌우
    return { vx, vy };
}

/* 그래페임(한글/이모지 안전) 래핑용 세그먼터 */
function makeSegmenter() {
    try {
        // @ts-ignore
        return new Intl.Segmenter("ko", { granularity: "grapheme" });
    } catch {
        return null;
    }
}

export default function BubbleCanvas({
    questions,
    setQuestions, // eslint-disable-line @typescript-eslint/no-unused-vars
    selectedQuestion,
    setSelectedQuestion,
}: BubbleCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const p5Ref = useRef<p5 | null>(null);

    // 최신 props 접근용 ref (리렌더 없이 루프에서 읽기)
    const questionsRef = useRef<Question[]>(questions);
    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    // 선택된 질문의 "id"만 보관 → string | null 이라 never 이슈 제거
    const selectedIdRef = useRef<string | null>(null);
    useEffect(() => {
        selectedIdRef.current = selectedQuestion?.id ?? null;
    }, [selectedQuestion]);

    // 모든 풍선의 물리 상태를 보존하는 맵 (id -> Physics)
    const physicsMapRef = useRef<Map<string, Physics>>(new Map());

    // 화면 크기 캐시
    const WHRef = useRef({ W: 0, H: 0 });

    useEffect(() => {
        const FONT_FAMILY =
            '"Pretendard","Noto Sans KR",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","맑은 고딕",system-ui,sans-serif';

        const clamp = (v: number, min: number, max: number) =>
            Math.max(min, Math.min(max, v));

        const getTitleFromQuestion = (q: any) => {
            // title/content 우선, 없으면 text 첫 블록
            const raw = String(q?.title ?? q?.text ?? "");
            const lines = raw.replace(/\r\n?/g, "\n").split("\n");
            const emptyIdx = lines.findIndex((l) => l.trim() === "");
            if (emptyIdx === -1) return (lines[0] || "").trim();
            return lines.slice(0, emptyIdx).join("\n").trim();
        };

        const segmenter = makeSegmenter();
        const splitGraphemes = (text: string): string[] => {
            if (segmenter) {
                // @ts-ignore
                return Array.from(segmenter.segment(text)).map(
                    (s) => s.segment
                );
            }
            return Array.from(text);
        };

        const wrapByWidth = (
            p: p5,
            text: string,
            maxTextWidth: number,
            fontSize: number
        ) => {
            p.textSize(fontSize);
            p.textFont(FONT_FAMILY);
            const hardLines = text.replace(/\r\n?/g, "\n").split("\n");
            const lines: string[] = [];
            for (const rawLine of hardLines) {
                const segs = splitGraphemes(rawLine);
                let cur = "";
                for (const g of segs) {
                    const next = cur + g;
                    const w = p.textWidth(next);
                    if (w <= maxTextWidth || cur.length === 0) cur = next;
                    else {
                        lines.push(cur);
                        cur = g;
                    }
                }
                if (cur.trim().length) lines.push(cur);
            }
            return lines;
        };

        function clampLinesWithEllipsis(
            p: p5,
            lines: string[],
            maxLines: number,
            maxWidth: number
        ) {
            if (lines.length <= maxLines) return lines;
            const kept = lines.slice(0, maxLines);
            let last = kept[maxLines - 1];
            while (p.textWidth(last + "…") > maxWidth && last.length > 0) {
                last = last.slice(0, -1);
            }
            kept[maxLines - 1] = last + "…";
            return kept;
        }

        const makeSketch = (p: p5) => {
            // 물리 상수
            const buoyancy = -0.14; // 음수 = 위로 뜸
            const friction = 0.994; // 공기 저항
            const bounce = 0.3; // 벽 충돌 반발력
            const collisionDamping = 0.97; // 풍선끼리 충돌 시 감쇠

            const ASPECT_X = 1.0;
            const ASPECT_Y = 1.12;

            // 캔버스 준비
            const attach = () => {
                if (!containerRef.current) return;
                const W = containerRef.current.clientWidth;
                const H = containerRef.current.clientHeight;
                WHRef.current = { W, H };
                p.createCanvas(W, H).parent(containerRef.current);
                if (typeof window !== "undefined") {
                    p.pixelDensity(window.devicePixelRatio || 1);
                }
                p.textFont(FONT_FAMILY);
            };

            const pointInEllipse = (
                px: number,
                py: number,
                cx: number,
                cy: number,
                rx: number,
                ry: number
            ) => {
                const nx = (px - cx) / rx;
                const ny = (py - cy) / ry;
                return nx * nx + ny * ny <= 1;
            };

            // 풍선 그리기 + 텍스트 레이아웃 (반지름을 콘텐츠에 맞춰 보간)
            const drawBalloon = (
                q: Question,
                ph: Physics,
                isModalOpen: boolean
            ) => {
                const titleFull = getTitleFromQuestion(q);
                const fontSize = 16;
                p.textFont(FONT_FAMILY);
                p.textSize(fontSize);
                const maxTextWidth = 180;
                const wrapped = wrapByWidth(
                    p,
                    titleFull,
                    maxTextWidth,
                    fontSize
                );
                const lines = clampLinesWithEllipsis(
                    p,
                    wrapped,
                    3,
                    maxTextWidth
                );

                const ascent = p.textAscent();
                const descent = p.textDescent();
                const lineH = Math.ceil((ascent + descent) * 1.08);
                const textW = Math.max(
                    1,
                    ...lines.map((l) => Math.ceil(p.textWidth(l)))
                );
                const textH = lines.length * lineH + Math.ceil(descent * 0.5);

                const padding = 16;
                const diameter = Math.max(textW, textH) + padding * 2;
                const targetR = Math.max(64, Math.min(160, diameter / 2));
                ph.radius = ph.radius
                    ? p.lerp(ph.radius, targetR, 0.25)
                    : targetR;

                const rxBase = ph.radius * ASPECT_X;
                const ryBase = ph.radius * ASPECT_Y;

                const isHovered =
                    !isModalOpen &&
                    pointInEllipse(
                        p.mouseX,
                        p.mouseY,
                        ph.x,
                        ph.y,
                        rxBase,
                        ryBase
                    );
                const hoverScale = isHovered ? 1.03 : 1.0;

                const rx = rxBase * hoverScale;
                const ry = ryBase * hoverScale;

                // 그림자
                p.noStroke();
                p.fill(0, 0, 0, 24);
                p.ellipse(ph.x, ph.y + ry * 0.12, rx * 2 * 0.88, ry * 2 * 0.42);

                // 외곽선
                p.noFill();
                p.stroke(230);
                p.strokeWeight(8);
                p.ellipse(ph.x, ph.y, rx * 2, ry * 2);

                // 본체
                const col = p.color(q.color);
                p.noStroke();
                p.fill(p.red(col), p.green(col), p.blue(col), 230);
                p.ellipse(ph.x, ph.y, rx * 2, ry * 2);

                // 안쪽 라인
                p.noFill();
                p.stroke(255, 255, 255, 140);
                p.strokeWeight(2);
                p.ellipse(ph.x, ph.y, rx * 2 - 4, ry * 2 - 4);

                // 꼬리
                const tailW = 12,
                    tailH = 10;
                const tailTopY = ph.y + ry - 2;
                const tailTipX = ph.x,
                    tailTipY = tailTopY + tailH;

                p.noStroke();
                p.fill(
                    p.red(col) * 0.9,
                    p.green(col) * 0.9,
                    p.blue(col) * 0.9,
                    230
                );
                p.triangle(
                    ph.x - tailW / 2,
                    tailTopY,
                    ph.x + tailW / 2,
                    tailTopY,
                    tailTipX,
                    tailTipY
                );

                // 줄
                p.stroke(140);
                p.strokeWeight(1.5);
                p.line(tailTipX, tailTipY, tailTipX, tailTipY + 56);

                // 텍스트
                p.noStroke();
                p.fill(255);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(fontSize);
                p.textLeading(lineH);
                const totalH = lines.length * lineH;
                let ty = ph.y - totalH / 2 + lineH / 2;
                for (const ln of lines) {
                    p.text(ln, ph.x, ty);
                    ty += lineH;
                }

                return isHovered;
            };

            p.setup = attach;

            p.windowResized = () => {
                if (!containerRef.current) return;
                const W = containerRef.current.clientWidth;
                const H = containerRef.current.clientHeight;
                WHRef.current = { W, H };
                p.resizeCanvas(W, H);
            };

            p.draw = () => {
                const { W, H } = WHRef.current;
                p.background(248, 250, 252);

                const isModalOpen = selectedIdRef.current !== null;

                // 🔁 물리 업데이트
                const list: Array<{ q: Question; ph: Physics }> = [];
                for (const q of questionsRef.current) {
                    const ph = physicsMapRef.current.get(q.id);
                    if (!ph) continue;
                    list.push({ q, ph });
                }

                // 1) 개별 업데이트
                for (const { ph } of list) {
                    ph.vy += -0.055 / ph.mass; // 부력(위로)
                    ph.vx += (Math.random() - 0.5) * 0.018;
                    ph.vy += (Math.random() - 0.5) * 0.018;

                    ph.x += ph.vx;
                    ph.y += ph.vy;

                    ph.vx *= 0.985;
                    ph.vy *= 0.985;

                    // 벽 충돌
                    if (ph.y - ph.radius < 0) {
                        ph.y = ph.radius;
                        ph.vy = -ph.vy * 0.72;
                        ph.vx *= 0.96;
                    }
                    if (ph.y + ph.radius > H) {
                        ph.y = H - ph.radius;
                        ph.vy = -ph.vy * 0.72;
                        ph.vx *= 0.96;
                    }
                    if (ph.x - ph.radius < 0) {
                        ph.x = ph.radius;
                        ph.vx = -ph.vx * 0.72;
                        ph.vy *= 0.96;
                    }
                    if (ph.x + ph.radius > W) {
                        ph.x = W - ph.radius;
                        ph.vx = -ph.vx * 0.72;
                        ph.vy *= 0.96;
                    }
                }

                // 2) 풍선 간 충돌
                for (let i = 0; i < list.length; i++) {
                    for (let j = i + 1; j < list.length; j++) {
                        const a = list[i].ph;
                        const b = list[j].ph;
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const dist = Math.hypot(dx, dy);
                        const minDist = (a.radius ?? 80) + (b.radius ?? 80);
                        if (dist < minDist && dist > 0.01) {
                            const angle = Math.atan2(dy, dx);
                            const tx = a.x + Math.cos(angle) * minDist;
                            const ty = a.y + Math.sin(angle) * minDist;
                            const sep = 0.04;
                            const ax = (tx - b.x) * sep;
                            const ay = (ty - b.y) * sep;

                            const damp = 0.96;
                            a.vx = (a.vx - ax / (a.mass ?? 1)) * damp;
                            a.vy = (a.vy - ay / (a.mass ?? 1)) * damp;
                            b.vx = (b.vx + ax / (b.mass ?? 1)) * damp;
                            b.vy = (b.vy + ay / (b.mass ?? 1)) * damp;
                        }
                    }
                }

                // 3) 그리기 & hover
                let anyHovered = false;
                for (const { q, ph } of list) {
                    const hovered = drawBalloon(q, ph, isModalOpen);
                    anyHovered = anyHovered || hovered;
                }

                // 커서
                if (isModalOpen) p.cursor(p.ARROW);
                else p.cursor(anyHovered ? "pointer" : p.ARROW);
            };

            // 클릭 → 최상단 버블 hit 테스트 → 선택/토글
            p.mousePressed = () => {
                // 모달이 열려 있으면 새 선택 막기 (선택 상태는 부모가 갖고 있음)
                if (selectedIdRef.current !== null) return;

                const list: Array<{ q: Question; ph: Physics }> = [];
                for (const q of questionsRef.current) {
                    const ph = physicsMapRef.current.get(q.id);
                    if (!ph) continue;
                    list.push({ q, ph });
                }

                for (let i = list.length - 1; i >= 0; i--) {
                    const { q, ph } = list[i];
                    const rx = ph.radius * 1.0;
                    const ry = ph.radius * 1.12;

                    const nx = (p.mouseX - ph.x) / rx;
                    const ny = (p.mouseY - ph.y) / ry;
                    const hit = nx * nx + ny * ny <= 1;
                    if (hit) {
                        // id만 비교 → string | null 비교라 never 절대 안 뜸
                        const isSame = selectedIdRef.current === q.id;
                        setSelectedQuestion(isSame ? null : q);
                        break;
                    }
                }
            };
        };

        // p5 인스턴스 1회 생성
        let cancelled = false;
        const init = async () => {
            if (p5Ref.current) {
                p5Ref.current.remove();
                p5Ref.current = null;
            }
            if (typeof window === "undefined") return;
            const mod = await import("p5");
            if (cancelled) return;
            const Ctor = mod.default as unknown as new (
                sketch: (p: p5) => void
            ) => p5;
            const instance = new Ctor(makeSketch as any);
            p5Ref.current = instance;
        };

        init();
        return () => {
            cancelled = true;
            if (p5Ref.current) {
                p5Ref.current.remove();
                p5Ref.current = null;
            }
        };
    }, []); // ← 루프는 한 번만 만든다

    /* ================== 질문 배열 동기화 (신규만 초기화) ================== */
    useEffect(() => {
        const map = physicsMapRef.current;
        const { W, H } = WHRef.current;

        // 신규 id에 대해서만 초기값 부여
        for (const q of questions) {
            if (!map.has(q.id)) {
                const { x, y } = initialPosFromBottom(W || 1200, H || 800);
                const { vx, vy } = initialVelocityUp();
                map.set(q.id, {
                    x,
                    y,
                    vx,
                    vy,
                    radius: (q as any).radius ?? 28,
                    mass: (q as any).mass ?? 1.2,
                });
            } else {
                // 기존 항목은 유지. 필요 시 radius 등만 동기화
                const ph = map.get(q.id)!;
                if ((q as any).radius && (q as any).radius !== ph.radius)
                    ph.radius = (q as any).radius;
                if ((q as any).mass && (q as any).mass !== ph.mass)
                    ph.mass = (q as any).mass;
            }
        }

        // 목록에서 빠진 id는 물리 맵에서도 제거
        const alive = new Set(questions.map((q) => q.id));
        for (const id of Array.from(map.keys())) {
            if (!alive.has(id)) map.delete(id);
        }
    }, [questions]);

    return (
        <div
            ref={containerRef}
            className="w-full"
            style={{
                height: "100vh",
                cursor: "default",
                // pointerEvents: selectedQuestion ? "none" : "auto",
            }}
        />
    );
}
