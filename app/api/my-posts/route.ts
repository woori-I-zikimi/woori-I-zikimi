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

/**
 * GET /api/posts/:id  (로그인 필수)
 * - 본문 + likeCount/commentCount 집계
 * - 현재 사용자 기준 likedByMe / isMine 계산
 * - 주의: authorid, postlikes.userid 모두 TEXT 타입이므로 캐스팅 금지
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const { rows } = await sql`
      SELECT
        p.id,
        p.title,
        p.content,
        p.category,
        p.createdat,
        COALESCE(pl.cnt, 0)::int AS likecount,
        COALESCE(cm.cnt, 0)::int AS commentcount
      FROM public.post p
      LEFT JOIN (
        SELECT postid, COUNT(*) AS cnt
        FROM public.postlikes
        GROUP BY postid
      ) pl ON pl.postid = p.id
      LEFT JOIN (
        SELECT postid, COUNT(*) AS cnt
        FROM public.comments
        GROUP BY postid
      ) cm ON cm.postid = p.id
      WHERE p.authorid = ${userId}
      ORDER BY p.createdat DESC;
    `;

        if (rows.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                posts: [],
            });
        }

        const posts = rows.map((r: any) => ({
            id: r.id,
            title: r.title ?? "(제목 없음)",
            content: r.content ?? "",
            category: r.category ?? "기타",
            createdAt:
                r.createdat instanceof Date
                    ? r.createdat.toISOString()
                    : new Date(r.createdat).toISOString(),
            likes: r.likecount || 0,
            comments: r.commentcount || 0,
        }));

        return NextResponse.json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: "SERVER_ERROR" },
            { status: 500 }
        );
    }
}
