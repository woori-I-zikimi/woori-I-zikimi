import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { randomUUID } from "crypto";

// 서버에서 해당 요청을 받아 처리하는 쪽
export async function POST(req: Request) {
  try {
    // 1. JWT에서 authorId 추출
    const token = (await cookies()).get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const authorId = String(payload.userId); // 명확하게 string으로 보장

    if (!authorId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 403 }
      );
    }

    // 2. 요청 본문 파싱
    const { title, content, category } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "title, content, and category are required" },
        { status: 400 }
      );
    }

    // 3. UUID 생성 (Post.id는 TEXT PRIMARY KEY)
    const id = randomUUID();

    console.log("title:", title);
    console.log("content:", content);
    console.log("category:", category);
    console.log("authorId:", authorId);

    // 4. INSERT 쿼리 실행
    const result = await sql`
      INSERT INTO "Post" (id, title, content, category, "authorId")
      VALUES (${id}, ${title}, ${content}, ${category}, ${authorId})
      RETURNING *;
    `;

    return NextResponse.json(
      { message: "Post created", post: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("DB 등록 실패:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
