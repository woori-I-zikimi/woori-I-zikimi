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
        <h1 className="text-4xl font-bold text-center font-pixel mb-2">Pixel Wisdom</h1>
      </Link>
      <p className="text-xl text-center font-mono flex items-center">
        <Link href="/category/tech" className="hover:text-green-300 transition-colors">Tech</Link>
        <span className="mx-2">•</span>
        <Link href="/category/art" className="hover:text-green-300 transition-colors">Art</Link>
        <span className="mx-2">•</span>
        <Link href="/category/finance" className="hover:text-green-300 transition-colors">Finance</Link>
        <BlinkingCursor />
      </p>
      <div className="mt-4">
        <ProfileButton />
      </div>
    </header>
  );
}
