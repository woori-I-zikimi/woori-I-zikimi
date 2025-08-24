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
// Description : 대댓글 작성 DB 연결 API
// parameter : request
// -------------------------------
export async function POST(req: Request) {
    console.log("대댓 INSERT API 호출");
    try {
        
    const { commentId, content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { success: false, message: "content는 필수입니다." },
        { status: 400 }
      );
    }

    const authorId = await getUserIdFromJWT();
    const result =
      await sql `
        INSERT INTO replies (commentid, authorid, content)
        VALUES (${commentId}, ${authorId}, ${content})
        RETURNING id, authorId, commentid, content, createdat;
      `;

    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      headers: {
        "Cache-Control": "no-store, no-cache"
      },
      reply: {
        id: row.id,
        authorId: row.authorid,
        commentId: row.commentid,
        content: row.content,
        createdAt: row.createdat,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "대댓글 저장 실패" },
      { status: 500 }
    );
  }
}


