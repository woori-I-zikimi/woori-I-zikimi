// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value; // ← cookie 이름 통일!
  const { pathname, search } = req.nextUrl;

  const isPublic = pathname.startsWith("/login");

  if (!token && !isPublic) {
    const url = new URL("/login", req.url);
    // 로그인 성공 후 돌아갈 목적지 보존
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  if (token && isPublic) {
    // 로그인 상태에서 /login 접근 시 홈으로
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // api, _next, 정적파일, 확장자 있는 파일 등 제외
  matcher: [
    "/((?!api|_next|static|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
