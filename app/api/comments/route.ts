import { sql } from "@vercel/postgres";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



// JWT 검증 함수
// async function getUserIdFromJWT() {
//   const cookie = (await cookies()).get("session");
//   if (!cookie) return null;

//   try {
//       const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//       const { payload } = await jwtVerify(cookie.value, secret);
//       console.log(`인증됨${payload}`);
//       return payload.userId as string;
//   } catch {
//     console.log('인증되지 않음');
    
//     return null;
//   }
// }


// 댓글 목록 가져오기
export async function GET(req: Request) {
  console.log('comment_route.ts_댓글 조회 진입');
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ success: false, message: "postId is required" }, { status: 400 });
  }

  const result 
  // = await sql`SELECT * FROM "comments" WHERE "postId" = ${postId} ORDER BY "createdAt" DESC;`;
  = await sql`SELECT 
                c.id, c.authorId, c.postId, c.content, c.createdat, COUNT(cl.id) AS likes
              FROM comments c
              LEFT JOIN commentlikes cl ON c.id = cl.commentid
              WHERE c.id = ${postId}
              GROUP BY c.id, c.authorid, c.postid, c.content, c.createdat
              ORDER BY c.createdat DESC;`;

  return NextResponse.json({ success: true, comments: result.rows });
}


// 댓글 추가
export async function POST(req: Request) {
    console.log('comment_route.ts진입');
    try {
    const { postId, content, authorId } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { success: false, message: "postId와 content는 필수입니다." },
        { status: 400 }
      );
    }

    const result =
      await sql/* sql */`
        INSERT INTO comments (authorid, postid, content)
        VALUES (${authorId}, ${postId}, ${content})
        RETURNING id, authorid, postid, content, createdat;
      `;

    const row = result.rows[0];

    // 처음 생성된 댓글의 좋아요는 0으로 내려줍니다.
    return NextResponse.json({
      success: true,
      comment: {
        id: row.id,
        authorId: row.authorid,
        postId: row.postid,
        content: row.content,
        createdAt: row.createdat,
        likes: 0,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "댓글 저장 실패" },
      { status: 500 }
    );
  }
//   const userId = await getUserIdFromJWT();
    const userId = '050301';  // 로그인한 userId 값으로 교체
  if (!userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  
  const { content, postId } = await req.json();

  if (!content || !postId) {
    console.log(`content: ${content} postId: ${postId}`);
    
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
  }


  await sql`
    INSERT INTO "comments" ("content", "authorId", "postId")
    VALUES (${content}, ${userId}, ${postId});
  `;

  return NextResponse.json({ success: true, message: "Comment added" }, { status: 201 });
}

