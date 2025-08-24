    import { sql } from "@vercel/postgres";
    import { NextResponse, NextRequest } from "next/server";
    import { jwtVerify } from "jose";
    import { UUID } from "crypto";
    import { create } from "domain";

    /** 
     * JWT(session 쿠키)에서 userId 추출 
     * - 세션 쿠키 가져오기
     * - JWT_SECRET으로 검증
     * - payload 안의 userId 또는 sub 필드 리턴
     */
    async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get("session")?.value; // 쿠키에서 session 값 추출
    if (!token) return null; // 없으면 인증 실패

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        const { payload } = await jwtVerify(token, secret);
        const uid =
        (payload.userId as string) ??
        (payload.sub as string) ??
        null;
        return uid ?? null;
    } catch {
        return null;
    }
    }

    /**
     * POST /api/comments/[id]/like
     * - 좋아요 1회만 허용 (취소 불가)
     * - 이미 눌렀다면 상태/카운트만 반환하고 DB 변화 없음
     */
    export async function POST(
        req: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ) {
        try {
            // 유저 아이디 반환
            const userId = await getUserIdFromRequest(req);
                if (!userId) {
                return NextResponse.json(
                    { success: false, message: "로그인이 필요합니다." },
                    { status: 401 });
                }
            
            // 댓글 아이디 반환
            const { id } = await params;
            const commentId = id;
                if (!commentId) {
                    return NextResponse.json(
                        { success: false, message: "해당 댓글을 찾을 수 없습니다."},
                        { status: 400 });
                }

            // 좋아요 insert
            const insertRes = await sql`
                INSERT INTO commentlikes (commentid, authorid)
                VALUES (${commentId}::uuid, ${userId})
                ON CONFLICT (commentid, authorid) DO NOTHING;
            `;
            const created = (insertRes.rowCount ?? 0) > 0; // 삽입된 행이 있으면 true


            // 최신 좋아요 합계 반환
            const countRes = await sql`
                SELECT COUNT(*)::int AS likecount,
                COALESCE(BOOL_OR(authorid = ${userId}), false) AS "likedByMe"
                FROM commentlikes
                WHERE commentid = ${commentId}::uuid;
            `;

            const likeCount: number = countRes.rows[0]?.likecount ?? 0;
            const likedByMe: boolean = countRes.rows[0]?.likedByMe ?? false;

            // 최종 응답
            return NextResponse.json(
                {
                    success: true,
                    likeCount,
                    likedByMe,
                    created,
                },
                { status: created ? 201 : 200}
            );
        } catch (e) {
            console.error("좋아요 에러 발생: " + e);
            return NextResponse.json(
                { success: false, message: "Server Error"},
                { status: 500}
            );
        }
    }
