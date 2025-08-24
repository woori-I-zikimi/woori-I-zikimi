import { sql } from "@vercel/postgres";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";




// -------------------------------
// function : getUserIdFromJWT()
// Description : JWT 검증 함수
// parameter : 
// -------------------------------
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

//   const result = await sql`
//   SELECT 
//     c.id,
//     c.authorid,
//     c.postid,
//     c.content,
//     c.createdat,
    
//     COUNT(cl.id)::int AS likes,                         -- 숫자 고정
//     EXISTS (
//       SELECT 1
//       FROM commentlikes cl2
//       WHERE cl2.commentid = c.id
//         AND ${userId ?? null}::text IS NOT NULL         -- userId 없으면 곧장 false
//         AND cl2.authorid = ${userId ?? null}::text      -- ← 타입 일치 (text = text)
//     ) AS "likedByMe"
//   FROM comments c
//   LEFT JOIN commentlikes cl ON c.id = cl.commentid
//   WHERE c.postid = ${postId}::uuid                      -- postid가 uuid면 유지, 아니면 ::uuid 제거
//   GROUP BY c.id, c.authorid, c.postid, c.content, c.createdat
//   ORDER BY c.createdat DESC;
// `;

  const result = await sql`
    SELECT
      c.id::text                        AS "id",
      c.authorid                        AS "authorId",
      c.postid::text                    AS "postId",
      c.content                         AS "content",
      c.createdat                       AS "createdat",
      COALESCE(l.likes, 0)::int         AS "likes",
      COALESCE(l.liked_by_me, FALSE)    AS "likedByMe",
      COALESCE(rep.replies, '[]'::json) AS "replies"
    FROM comments c

    LEFT JOIN (
      SELECT
        cl.commentid,
        COUNT(*)::int                                AS likes,
        COALESCE(BOOL_OR(cl.authorid = ${userId}::text), FALSE) AS liked_by_me
      FROM commentlikes cl
      GROUP BY cl.commentid
    ) l ON l.commentid = c.id

    LEFT JOIN (
      SELECT
        r.commentid,
        json_agg(
          json_build_object(
            'id',        r.id::text,
            'authorId',  r.authorid,
            'content',   r.content,
            'createdAt', r.createdat
          )
          ORDER BY r.createdat DESC
        ) AS replies
      FROM replies r
      GROUP BY r.commentid
    ) rep ON rep.commentid = c.id

    WHERE c.postid = ${postId}::uuid
  
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
    const { postId, content } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { success: false, message: "postId와 content는 필수입니다." },
        { status: 400 }
      );
    }

    const authorId = await getUserIdFromJWT();
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
        replies: [],
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


