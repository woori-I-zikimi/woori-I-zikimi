"use client";

import { useEffect, useRef } from "react";
import type p5 from "p5";
import { Question } from "./types";

interface BubbleCanvasProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  selectedQuestion: Question | null;
  setSelectedQuestion: (q: Question | null) => void;
}

export default function BubbleCanvas({
  questions,
  setQuestions,
  selectedQuestion,
  setSelectedQuestion,
}: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const questionsRef = useRef<Question[]>(questions);
  const selectedQuestionRef = useRef<Question | null>(selectedQuestion);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    selectedQuestionRef.current = selectedQuestion;
  }, [selectedQuestion]);

  useEffect(() => {
    const FONT_FAMILY =
      '"Pretendard","Noto Sans KR",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","맑은 고딕",system-ui,sans-serif';

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const getTitleFromQuestion = (q: any) => {
      const raw = String(q?.text ?? q?.title ?? "");
      const lines = raw.replace(/\r\n?/g, "\n").split("\n");
      const emptyIdx = lines.findIndex((l) => l.trim() === "");
      if (emptyIdx === -1) return (lines[0] || "").trim();
      return lines.slice(0, emptyIdx).join("\n").trim();
    };

    const makeSegmenter = () => {
      try {
        // @ts-ignore
        return new Intl.Segmenter("ko", { granularity: "grapheme" });
      } catch {
        return null;
      }
    };
    const segmenter = makeSegmenter();

    const splitGraphemes = (text: string): string[] => {
      if (segmenter) {
        // @ts-ignore
        return Array.from(segmenter.segment(text)).map((s) => s.segment);
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
      let W = 0,
        H = 0;

      // 물리 상수
      const buoyancy = -0.055; // 음수 = 위로 뜸
      const friction = 0.985; // 공기 저항
      const bounce = 0.72; // 벽 충돌 반발력
      const collisionDamping = 0.96; // 풍선끼리 충돌 시 감쇠

      const ASPECT_X = 1.0;
      const ASPECT_Y = 1.12;

      const attach = () => {
        if (!canvasRef.current) return;
        W = canvasRef.current.clientWidth;
        H = canvasRef.current.clientHeight;
        p.createCanvas(W, H).parent(canvasRef.current);
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

      const drawBalloon = (
        q: Question,
        cx: number,
        cy: number,
        isModalOpen: boolean
      ) => {
        const titleFull = getTitleFromQuestion(q);
        const fontSize = 16;
        p.textFont(FONT_FAMILY);
        p.textSize(fontSize);
        const maxTextWidth = 180;
        const wrapped = wrapByWidth(p, titleFull, maxTextWidth, fontSize);
        const lines = clampLinesWithEllipsis(p, wrapped, 3, maxTextWidth);

        const ascent = p.textAscent();
        const descent = p.textDescent();
        const lineH = Math.ceil((ascent + descent) * 1.08);
        const textW = Math.max(1, ...lines.map((l) => Math.ceil(p.textWidth(l))));
        const textH = lines.length * lineH + Math.ceil(descent * 0.5);

        const padding = 16;
        const diameter = Math.max(textW, textH) + padding * 2;
        const targetR = clamp(diameter / 2, 64, 160);
        const nextR = (q as any).radius
          ? p.lerp((q as any).radius, targetR, 0.25)
          : targetR;
        (q as any).radius = nextR;

        const rxBase = nextR * ASPECT_X;
        const ryBase = nextR * ASPECT_Y;

        const isHovered =
          !isModalOpen &&
          pointInEllipse(p.mouseX, p.mouseY, cx, cy, rxBase, ryBase);
        const hoverScale = isHovered ? 1.03 : 1.0;

        const rx = rxBase * hoverScale;
        const ry = ryBase * hoverScale;

        p.noStroke();
        p.fill(0, 0, 0, 24);
        p.ellipse(cx, cy + ry * 0.12, rx * 2 * 0.88, ry * 2 * 0.42);

        p.noFill();
        p.stroke(230);
        p.strokeWeight(8);
        p.ellipse(cx, cy, rx * 2, ry * 2);

        const col = p.color(q.color);
        p.noStroke();
        p.fill(p.red(col), p.green(col), p.blue(col), 230);
        p.ellipse(cx, cy, rx * 2, ry * 2);

        p.noFill();
        p.stroke(255, 255, 255, 140);
        p.strokeWeight(2);
        p.ellipse(cx, cy, rx * 2 - 4, ry * 2 - 4);

        const tailW = 12,
          tailH = 10;
        const tailTopY = cy + ry - 2;
        const tailTipX = cx,
          tailTipY = tailTopY + tailH;

        p.noStroke();
        p.fill(
          p.red(col) * 0.9,
          p.green(col) * 0.9,
          p.blue(col) * 0.9,
          230
        );
        p.triangle(
          cx - tailW / 2,
          tailTopY,
          cx + tailW / 2,
          tailTopY,
          tailTipX,
          tailTipY
        );

        p.stroke(140);
        p.strokeWeight(1.5);
        p.line(tailTipX, tailTipY, tailTipX, tailTipY + 56);

        p.noStroke();
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(fontSize);
        p.textLeading(lineH);
        const totalH = lines.length * lineH;
        let ty = cy - totalH / 2 + lineH / 2;
        for (const ln of lines) {
          p.text(ln, cx, ty);
          ty += lineH;
        }

        return isHovered;
      };

      p.setup = attach;

      p.windowResized = () => {
        if (!canvasRef.current) return;
        W = canvasRef.current.clientWidth;
        H = canvasRef.current.clientHeight;
        p.resizeCanvas(W, H);
      };

      p.draw = () => {
        p.background(248, 250, 252);

        const isModalOpen = !!selectedQuestionRef.current;

        const curr = (questionsRef.current ?? []).map((q) => {
          const nq: any = { ...q };
          nq.mass ??= 1.0;
          nq.vx ??= 0;
          nq.vy ??= 0;
          nq.radius ??= 80;

          nq.vy += buoyancy / nq.mass;
          nq.vx += (Math.random() - 0.5) * 0.018;
          nq.vy += (Math.random() - 0.5) * 0.018;

          nq.x += nq.vx;
          nq.y += nq.vy;

          nq.vx *= friction;
          nq.vy *= friction;

          if (nq.y - nq.radius < 0) {
            nq.y = nq.radius;
            nq.vy = -nq.vy * bounce;
            nq.vx *= 0.96;
          }
          if (nq.y + nq.radius > H) {   // 🔧 바닥 충돌 기준 수정
            nq.y = H - nq.radius;
            nq.vy = -nq.vy * bounce;
            nq.vx *= 0.96;
          }
          if (nq.x - nq.radius < 0) {
            nq.x = nq.radius;
            nq.vx = -nq.vx * bounce;
            nq.vy *= 0.96;
          }
          if (nq.x + nq.radius > W) {
            nq.x = W - nq.radius;
            nq.vx = -nq.vx * bounce;
            nq.vy *= 0.96;
          }

          return nq as Question;
        });

        for (let i = 0; i < curr.length; i++) {
          for (let j = i + 1; j < curr.length; j++) {
            const q1: any = curr[i];
            const q2: any = curr[j];
            const dx = q2.x - q1.x;
            const dy = q2.y - q1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = (q1.radius ?? 80) + (q2.radius ?? 80);
            if (dist < minDist && dist > 0.01) {
              const angle = Math.atan2(dy, dx);
              const tx = q1.x + Math.cos(angle) * minDist;
              const ty = q1.y + Math.sin(angle) * minDist;
              const sep = 0.04;
              const ax = (tx - q2.x) * sep;
              const ay = (ty - q2.y) * sep;

              q1.vx = (q1.vx - ax / (q1.mass ?? 1)) * collisionDamping;
              q1.vy = (q1.vy - ay / (q1.mass ?? 1)) * collisionDamping;
              q2.vx = (q2.vx + ax / (q2.mass ?? 1)) * collisionDamping;
              q2.vy = (q2.vy + ay / (q2.mass ?? 1)) * collisionDamping;
            }
          }
        }

        questionsRef.current = curr;
        setQuestions(curr);

        let anyHovered = false;
        curr.forEach((q, idx) => {
          const cx = (q as any).x ?? ((idx % 4) + 1) * (W / 5);
          const cy = (q as any).y ?? (Math.floor(idx / 4) + 1) * (H / 4) + 80;
          const hovered = drawBalloon(q, cx, cy, isModalOpen);
          anyHovered = anyHovered || hovered;
        });

        if (isModalOpen) p.cursor(p.ARROW);
        else p.cursor(anyHovered ? "pointer" : p.ARROW);
      };

      p.mousePressed = () => {
        if (selectedQuestionRef.current) return;

        const list = questionsRef.current ?? [];
        let clicked: Question | null = null;

        for (let i = list.length - 1; i >= 0; i--) {
          const q: any = list[i];
          const baseR = q.radius ?? 80;
          const rx = baseR * 1.0;
          const ry = baseR * 1.12;
          const x = (q as any).x ?? ((i % 4) + 1) * (W / 5);
          const y =
            (q as any).y ?? (Math.floor(i / 4) + 1) * (H / 4) + 80;

          const nx = (p.mouseX - x) / rx;
          const ny = (p.mouseY - y) / ry;
          const hit = nx * nx + ny * ny <= 1;
          if (hit) {
            clicked = q;
            break;
          }
        }

        if (clicked) {
          setSelectedQuestion(
            selectedQuestionRef.current &&
              (selectedQuestionRef.current as any).id ===
                (clicked as any).id
              ? null
              : clicked
          );
        }
      };
    };

    let cancelled = false;
    const init = async () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      if (typeof window === "undefined") return;
      const mod = await import("p5");
      if (cancelled) return;
      const P5Ctor =
        (mod.default as unknown as new (sketch: (p: p5) => void) => p5);
      const instance = new P5Ctor(makeSketch as any);
      p5InstanceRef.current = instance;
    };

    init();
    return () => {
      cancelled = true;
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [setQuestions, setSelectedQuestion]);

  return (
    <div
      ref={canvasRef}
      className="w-full"
      style={{
        height: "100vh", // 🔧 전체 높이로 변경
        pointerEvents: selectedQuestion ? "none" : "auto",
        cursor: "default",
      }}
    />
  );
}
