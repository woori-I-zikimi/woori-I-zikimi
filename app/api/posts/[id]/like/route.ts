import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { randomUUID } from "crypto"; // UUID 생성용 import

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const postId = Number(context.params.id);

  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 현재 좋아요 여부 확인
    const check = await sql`
      SELECT * FROM "PostLike"
      WHERE "postId" = ${postId} AND "userId" = ${userId};
    `;

    let liked = false;

    if (check.rows.length > 0) {
      // 이미 좋아요 → 제거
      await sql`
        DELETE FROM "PostLike"
        WHERE "postId" = ${postId} AND "userId" = ${userId};
      `;
    } else {
      // 좋아요 추가 ( id 직접 생성)
      await sql`
        INSERT INTO "PostLike" ("id", "postId", "userId")
        VALUES (${randomUUID()}, ${postId}, ${userId});
      `;
      liked = true;
    }

    // 총 좋아요 수 다시 계산
    const countResult = await sql`
      SELECT COUNT(*) FROM "PostLike"
      WHERE "postId" = ${postId};
    `;
    const count = Number(countResult.rows[0].count);

    return NextResponse.json({ liked, count });
  } catch (err: any) {
    console.error("좋아요 토글 에러:", err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
