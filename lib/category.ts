import { z } from "zod";

// 카테고리 목록
export const CATEGORIES = ["자유", "프로젝트", "취업", "수업", "기타"] as const;

// 카테고리 타입: "자유" | "프로젝트" | "취업" | "수업" | "기타"
export type Category = (typeof CATEGORIES)[number];

// 값이 카테고리인지 검사하는 타입 가드
export const isValidCategory = (v: unknown): v is Category =>
  typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);

// Zod 스키마 (기본값은 "기타")
export const CategorySchema = z.enum(CATEGORIES).default("기타");
