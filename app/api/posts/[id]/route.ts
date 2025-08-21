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
export async function GET(
    req: NextRequest,
    // [MOD] params가 Promise인 시그니처로 지정
    context: { params: Promise<{ id: string }> }
) {
    try {
        // [MOD] params를 await 해서 id 추출
        const { id } = await context.params;

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const { rows } = await sql`
      WITH pl AS (
        SELECT postid, COUNT(*)::int AS likecount
        FROM public.postlikes
        GROUP BY postid
      ),
      cm AS (
        SELECT postid, COUNT(*)::int AS commentcount
        FROM public.comments
        GROUP BY postid
      ),
      me AS (
        SELECT postid
        FROM public.postlikes
        WHERE userid = ${userId}           -- TEXT 비교 (캐스팅 금지)
      )
      SELECT
        p.id,
        p.authorid,
        p.title,
        p.content,
        p.code,
        p.category,
        p.isanswered,
        p.createdat,
        p.updatedat,
        COALESCE(pl.likecount, 0)    AS likecount,
        COALESCE(cm.commentcount, 0) AS commentcount,
        (me.postid IS NOT NULL)      AS likedbyme,
        (p.authorid = ${userId})     AS ismine
      FROM public.post p
      LEFT JOIN pl ON pl.postid = p.id
      LEFT JOIN cm ON cm.postid = p.id
      LEFT JOIN me ON me.postid = p.id
      WHERE p.id = ${id}::uuid       -- [MOD] await 한 id 사용
      LIMIT 1
    `;

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "게시글을 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const r = rows[0];

        return NextResponse.json({
            success: true,
            post: {
                id: r.id,
                authorId: r.authorid,
                title: r.title ?? "(제목 없음)",
                content: r.content ?? "",
                code: r.code ?? "",
                category: r.category ?? "기타",
                isAnswered: !!r.isanswered,
                createdAt: r.createdat.toISOString(),
                updatedAt: r.updatedat.toISOString(),
                likeCount: Number(r.likecount) || 0,
                commentCount: Number(r.commentcount) || 0,
            },
            flags: {
                isMine: !!r.ismine,
                likedByMe: !!r.likedbyme,
            },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: "SERVER_ERROR" },
            { status: 500 }
        );
    }
}

/**
 *
 * @param req
 * @param param1
 * @returns
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "로그인 필요" },
            { status: 401 }
        );
    }

    try {
        // 본인 글만 삭제 가능
        const { rowCount } = await sql`
      DELETE FROM public.post
      WHERE id = ${params.id}::uuid
        AND authorid = ${userId};
    `;

        if (rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "삭제할 수 없거나 권한이 없습니다.",
                },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: "SERVER_ERROR" },
            { status: 500 }
        );
    }
}
