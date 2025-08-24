import { sql } from "@vercel/postgres";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



// JWT 검증 함수
async function getUserIdFromJWT() {
  const cookie = (await cookies()).get("session");
  if (!cookie) return null;

  try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(cookie.value, secret);
      return payload.userId as string;
  } catch {
    return null;
  }
}


// -------------------------------
// function : 
// Description : 댓글 목록 가져오기 DB 연결 API
// parameter : postId
// -------------------------------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ success: false, message: "postId is required" }, { status: 400 });
  }

  const userId = await getUserIdFromJWT();

  const result = await sql`
  SELECT 
    c.id,
    c.authorid,
    c.postid,
    c.content,
    c.createdat,
    COUNT(cl.id)::int AS likes,                         -- 숫자 고정
    EXISTS (
      SELECT 1
      FROM commentlikes cl2
      WHERE cl2.commentid = c.id
        AND ${userId ?? null}::text IS NOT NULL         -- userId 없으면 곧장 false
        AND cl2.authorid = ${userId ?? null}::text      -- ← 타입 일치 (text = text)
    ) AS "likedByMe"
  FROM comments c
  LEFT JOIN commentlikes cl ON c.id = cl.commentid
  WHERE c.postid = ${postId}::uuid                      -- postid가 uuid면 유지, 아니면 ::uuid 제거
  GROUP BY c.id, c.authorid, c.postid, c.content, c.createdat
  ORDER BY c.createdat DESC;
`;



  return NextResponse.json({ success: true, comments: result.rows });
}


// -------------------------------
// function : 
// Description : 댓글 작성 DB 연결 API
// parameter : request
// -------------------------------
export async function POST(req: Request) {
    try {
    const { postId, content, authorId } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { success: false, message: "postId와 content는 필수입니다." },
        { status: 400 }
      );
    }

    const result =
      await sql `
        INSERT INTO comments (authorid, postid, content)
        VALUES (${authorId}, ${postId}, ${content})
        RETURNING id, authorid, postid, content, createdat;
      `;

    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      headers: {
        "Cache-Control": "no-store, no-cache"
      },
      comment: {
        id: row.id,
        authorId: row.authorid,
        postId: row.postid,
        content: row.content,
        createdAt: row.createdat,
        likes: 0,
        likedByMe: false,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "댓글 저장 실패" },
      { status: 500 }
    );
  }
}

