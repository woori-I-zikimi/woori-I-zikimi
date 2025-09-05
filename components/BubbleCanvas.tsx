"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";
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
  const selectedQuestionRef = useRef<Question | null>(null);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    selectedQuestionRef.current = selectedQuestion;
  }, [selectedQuestion]);

  useEffect(() => {
    const sketch = (p: p5) => {
      // p5 setup, draw, mousePressed, windowResized 정의
    };

    if (p5InstanceRef.current) p5InstanceRef.current.remove();
    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) p5InstanceRef.current.remove();
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="w-full"
      style={{
        height: "calc(100vh - 200px)",
        pointerEvents: selectedQuestion ? "none" : "auto",
      }}
    />
  );
}
