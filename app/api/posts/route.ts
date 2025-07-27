// app/api/posts/route.ts
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // DB에서 posts 조회 (createdAt 기준 최신순)
        const result = await sql`SELECT * FROM "Post" ORDER BY "createdAt" DESC;`;

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