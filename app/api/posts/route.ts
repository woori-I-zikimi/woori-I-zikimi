import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

/** JWT(session 쿠키)에서 userId(TEXT) 추출 */
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get("session")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        const { payload } = await jwtVerify(token, secret);
        const uid =
            (payload.userId as string) ?? (payload.sub as string) ?? null;
        return uid ?? null;
    } catch {
        return null;
    }
}

// 작성 API
export async function POST(req: NextRequest) {
    try {
        // 로그인 검증
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        // 바디 파싱/검증
        const body = await req.json();
        const {
            title,
            content,
            code,
            category,
            isAnswered = false, // 기본 false
        } = body ?? {};

        if (!title || !content || !category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "title, content, category는 필수입니다.",
                },
                { status: 400 }
            );
        }

        // 3) createdAt/updatedAt 같은 값으로 세팅
        const now = new Date().toISOString();

        // 4) INSERT (public.post + 소문자 컬럼명)
        const { rows } = await sql`
      INSERT INTO public.post
        (authorid, title, content, code, category, isanswered, createdat, updatedat)
      VALUES
        (${userId}, ${title}, ${content}, ${code}, ${category}, ${isAnswered}, ${now}, ${now})
      RETURNING
        id, authorid, title, content, code, category, isanswered, createdat, updatedat
    `;

        const r = rows[0];

        return NextResponse.json(
            {
                success: true,
                post: {
                    id: r.id,
                    authorId: r.authorid,
                    title: r.title ?? "(제목 없음)",
                    content: r.content ?? "",
                    code: r.code ?? "",
                    category: r.category ?? "기타",
                    isAnswered: !!r.isanswered,
                    createdAt: r.createdat?.toISOString?.() ?? r.createdat,
                    updatedAt: r.updatedat?.toISOString?.() ?? r.updatedat,
                },
            },
            { status: 201 }
        );
    } catch (err: any) {
        console.error("POST /api/posts error:", err);
        return NextResponse.json(
            { success: false, message: err?.message ?? "SERVER_ERROR" },
            { status: 500 }
        );
    }
}
