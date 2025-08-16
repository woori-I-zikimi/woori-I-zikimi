import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
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
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ success: false, message: "postId is required" }, { status: 400 });
  }

  const result = await sql`SELECT * FROM "Comment" WHERE "postId" = ${postId} ORDER BY "createdAt" DESC;`;
  return NextResponse.json({ success: true, comments: result.rows });
}


// 댓글 추가
export async function POST(req: Request) {
    console.log('comment_route.ts진입');
    
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

  const commentId = randomUUID(); // UUID 생성

  await sql`
    INSERT INTO "Comment" ("id", "content", "authorId", "postId")
    VALUES (${commentId}, ${content}, ${userId}, ${postId});
  `;

  return NextResponse.json({ success: true, message: "Comment added" }, { status: 201 });
}

