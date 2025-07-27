// app/api/posts/[id]/route.ts

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const { id } = params;
  let userId: string | null = null;

  try {
    const cookieHeader = req.headers.get("cookie");
    const cookies = Object.fromEntries(
      cookieHeader?.split(";").map((c) => c.trim().split("=")) || []
    );
    const token = cookies["session"];

    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId as string;
    }

    const postResult = await sql`SELECT * FROM "Post" WHERE id = ${id} LIMIT 1;`;
    if (postResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    const post = postResult.rows[0];

    // 총 좋아요 개수 가져오기
    const countResult = await sql`
      SELECT COUNT(*) FROM "PostLike" WHERE "postId" = ${id};
    `;
    const likeCount = Number(countResult.rows[0].count);

    let likedByCurrentUser = false;
    if (userId) {
      const likeResult = await sql`
        SELECT 1 FROM "PostLike" WHERE "postId" = ${id} AND "userId" = ${userId} LIMIT 1;
      `;
      likedByCurrentUser = likedByCurrentUser = (likeResult.rowCount ?? 0) > 0;
    }

    return NextResponse.json(
      {
        success: true,
        post: {
          ...post,
          likedByCurrentUser,
          likeCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching post:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
