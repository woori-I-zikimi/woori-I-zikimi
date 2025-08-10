import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const getUserIdFromToken = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("session")?.value;

  if (!token) throw new Error("No token found");

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.userId as string;
};

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    // 토큰에서 사용자 ID 추출
    const userId = await getUserIdFromToken();

    // DB에서 사용자 정보 가져오기
    const result = await sql`SELECT * FROM "User" WHERE id = ${userId};`;
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "유저를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("현재 비밀번호가 일치하지 않습니다.");

      return NextResponse.json(
        { message: "현재 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE "User" SET password = ${hashedNewPassword} WHERE id = ${userId};`;

    console.log("비밀번호가 성공적으로 변경되었습니다.");

    return NextResponse.json({
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (err) {
    console.error("Password update error:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
