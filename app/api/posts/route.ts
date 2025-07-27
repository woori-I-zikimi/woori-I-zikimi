// app/api/posts/route.ts
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  try {
    let result;

    if (category) {
      result = await sql`
        SELECT 
          p.*, 
          COUNT(pl."postId")::int AS "likeCount"
        FROM "Post" p
        LEFT JOIN "PostLike" pl ON p.id = pl."postId"
        WHERE LOWER(p."category") = ${category.toLowerCase()}
        GROUP BY p.id
        ORDER BY p."createdAt" DESC;
      `;
    } else {
      result = await sql`
        SELECT 
          p.*, 
          COUNT(pl."postId")::int AS "likeCount"
        FROM "Post" p
        LEFT JOIN "PostLike" pl ON p.id = pl."postId"
        GROUP BY p.id
        ORDER BY p."createdAt" DESC;
      `;
    }

    return NextResponse.json(
      {
        success: true,
        posts: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}
