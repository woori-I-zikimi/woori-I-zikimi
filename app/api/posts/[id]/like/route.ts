import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UUID } from "crypto";

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

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: UUID }> }
) {
    try {

        // 유저 아이디 반환
        const userId = await getUserIdFromRequest(req);
            if (!userId) {
              return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
            }
        
        // 게시글 아이디 반환
        const { id } = await params;
        const postId = id;
            if (!postId) {
                return NextResponse.json({ success: false, message: "해당 게시글을 찾을 수 없습니다."}, { status: 400 });
            }

        // 좋아요 삽입
        const insertRes = await sql`
            INSERT INTO postlikes (postid, userid)
            VALUES (${postId}::uuid, ${userId})
            ON CONFLICT (postid, userid) DO NOTHING;
        `;

        // 삽입된 행이 없으면 이미 좋아요를 누른 상태로 설정
        const alreadyLiked = insertRes.rowCount === 0;

        // 최신 좋아요 합계 반환
        const countRes = await sql`
            SELECT COUNT(*)::int AS likecount
            FROM postlikes
            WHERE postid = ${postId}::uuid;
        `;

        const likeCount = countRes.rows[0]?.likecount ?? 0;

        // 최종 응답
        return NextResponse.json(
            {
                success: true,
                likeCount,
                alreadyLiked,
            },
            { status: alreadyLiked ? 200 : 201}
        );
    } catch (e) {
        console.error("좋아요 에러 발생: " + e);
        return NextResponse.json(
            { success: false, message: "Server Error"},
            { status: 500}
        );
    }
}
