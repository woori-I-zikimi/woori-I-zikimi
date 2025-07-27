// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("session")?.value;
    const { pathname } = req.nextUrl;

    const isPublic = pathname.startsWith("/login");

    // 로그인이 되어있지 않으면 login 페이지로 이동
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 로그인이 되어있다면 login 페이지로 이동 불가능
    if (token && isPublic) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|static|favicon.ico|.*\\..*).*)"],
};
