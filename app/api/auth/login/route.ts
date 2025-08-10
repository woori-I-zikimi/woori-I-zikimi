// app/api/auth/login/route.ts

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { SignJWT } from "jose"; // JWT 생성을 위해 import
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();

    const result = await sql`SELECT * FROM "User" WHERE id = ${id};`;
    const user = result.rows[0];

    // console.log("입력한 패스워드:", password);
    // console.log("DB에서 불러온 해시:", user.password);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, message: "아이디 또는 비밀번호가 틀렸습니다." },
        { status: 401 }
      );
    }

    // 1. JWT 생성
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
    }) // 토큰에 담을 정보
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h") // 토큰 만료 시간
      .sign(secret);

    // 2. 쿠키에 토큰 저장
    const response = NextResponse.json({
      success: true,
      message: "로그인 성공",
    });

    // 생성된 응답에 쿠키를 설정
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1시간 (초 단위)
      path: "/",
    });

    // 최종적으로 쿠키가 포함된 응답을 반환
    return response;
  } catch (err) {
    console.error(err); // 에러 로깅
    return NextResponse.json(
      { success: false, message: "서버 에러" },
      { status: 500 }
    );
  }
}
