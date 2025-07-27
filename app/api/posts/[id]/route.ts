import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const result = await sql`SELECT * FROM "Post" WHERE id = ${id} LIMIT 1;`;

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching post:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}