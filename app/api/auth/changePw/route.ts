// app/api/auth/changePw/route.ts
export const runtime = "nodejs"; // bcrypt 쓰면 nodejs로 강제

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; // 문제 있으면 bcryptjs로 교체 가능
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function getUserIdFromToken() {
    const token = (await cookies()).get("session")?.value;
    if (!token) throw new Error("No token");

    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) throw new Error("Missing JWT_SECRET");

    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(token, secret);
    return String(payload.userId);
}

export async function POST(req: Request) {
    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "잘못된 요청" },
                { status: 400 }
            );
        }

        // 새 비밀번호 최소 길이
        if (newPassword.length < 4) {
            return NextResponse.json(
                { message: "비밀번호는 최소 4자 이상이어야 합니다" },
                { status: 400 }
            );
        }

        const userId = await getUserIdFromToken();

        // id 타입 이슈 피하기 위해 ::text 비교 (필요 시)
        const result =
            await sql`SELECT * FROM "User" WHERE id::text = ${userId};`;
        const user = result.rows[0];
        if (!user) {
            return NextResponse.json(
                { message: "유저를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
            return NextResponse.json(
                { message: "현재 비밀번호가 일치하지 않습니다." },
                { status: 401 }
            );
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await sql`UPDATE "User" SET password = ${hashed} WHERE id = ${user.id};`;

        return NextResponse.json({
            message: "비밀번호가 성공적으로 변경되었습니다.",
        });
    } catch (err) {
        console.error("Password update error:", err);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
