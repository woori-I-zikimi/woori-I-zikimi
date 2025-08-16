import { z } from "zod";

export const CATEGORIES = ["자유", "프로젝트", "취업", "수업", "기타"] as const;
export type Category = (typeof CATEGORIES)[number];

export const isValidCategory = (v: unknown): v is Category =>
  typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);

export const CategorySchema = z.enum(CATEGORIES).default("기타");
