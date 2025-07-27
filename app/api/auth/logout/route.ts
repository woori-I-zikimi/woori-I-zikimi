// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "로그아웃 성공",
    });

    // session 쿠키 삭제 (과거로 만료일 설정)
    response.cookies.set("session", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
    });

    return response;
}
