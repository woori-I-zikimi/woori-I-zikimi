"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import BlinkingCursor from "./BlinkingCursor";
import ProfileButton from "./ProfileButton";

export default function Header() {
  const pathname = usePathname();
  const hideHeader = ["/login", "/signup", "/forgot-password"].includes(pathname);

  if (hideHeader) return null;

  return (
    <header className="py-8 flex flex-col items-center">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <h1 className="text-4xl font-bold text-center font-pixel mb-2">woori -I- zikimi</h1>
      </Link>
      <p className="text-xl text-center font-mono flex items-center">
        <Link href="/category/free" className="hover:text-green-300 transition-colors">Free</Link>
        <span className="mx-2">•</span>
        <Link href="/category/interview" className="hover:text-green-300 transition-colors">Interview</Link>
        <span className="mx-2">•</span>
        <Link href="/category/project" className="hover:text-green-300 transition-colors">Project</Link>
        <span className="mx-2">•</span>
        <Link href="/category/class" className="hover:text-green-300 transition-colors">Class</Link>
        <BlinkingCursor />
      </p>
      <div className="mt-4">
        <ProfileButton />
      </div>
    </header>
  );
}
