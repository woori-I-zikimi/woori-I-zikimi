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
                SELECT * FROM "Post" 
                WHERE LOWER("category") = ${category.toLowerCase()} 
                ORDER BY "createdAt" DESC;
            `;
        } else {
            result = await sql`
            SELECT * FROM "Post"
            ORDER BY "createdAt" DESC;`;
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