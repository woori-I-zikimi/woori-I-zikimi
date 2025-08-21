import { Plus, MessageCircle, Home, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

// 경로 정규화 진행
function normalizePath(p?: string) {
  if (!p) return "/";
  // 쿼리/해시 제거
  p = p.split("?")[0].split("#")[0];

  // locale prefix 제거 (en, ko 등 쓰는 경우)
  p = p.replace(/^\/(en|ko)(?=\/|$)/, "");

  // 뒤 슬래시 제거 (루트는 제외)
  return p !== "/" ? p.replace(/\/$/, "") : "/";
}

export function Header({ pathname }: { pathname: string }) {
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const current = normalizePath(pathname);
  const onMyPosts = current === "/my-posts" || current.startsWith("/my-posts/");
  const onMainPage = current === "/";
  const onNewPosts =
    current === "/new-post" || current.startsWith("/new-post/");
  const onLogin = current === "/login" || current.startsWith("/login/");

  // 홈/글쓰기/내 글/로그아웃
  const handleHomeClick = () => {
    router.push("/");
    router.refresh();
  };
  const handleNewPost = () => {
    router.push("/new-post");
  };
  const handleMyPost = () => {
    router.push("/my-posts");
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    router.push("/login");
    router.refresh();
  };
  return (
    <header
      className={clsx("text-white sticky top-0 z-50", {
        "bg-white": onMainPage,
        "bg-[#0074c9]": !onMainPage,
      })}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 좌측 홈 버튼 */}
          {!onLogin && (
            <Button
              variant="ghost"
              className={clsx(
                "text-[#005fa3] hover:text-blue-100 hover:bg-[#0074c9] hover: cursor-pointer",
                {
                  "text-[#005fa3] hover:text-blue-100 hover:bg-[#0074c9]":
                    onMainPage,
                  "text-white hover:text-[#0074c9] hover:bg-white": !onMainPage,
                }
              )}
              onClick={() => handleHomeClick()}
            >
              <Home className="w-4 h-4" />
            </Button>
          )}

          {/* 중앙 - 로고 */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#0074c9]" />
                </div>
                <h1
                  className={clsx("text-lg font-bold", {
                    "text-[#0074c9]": onMainPage,
                    "text-white": !onMainPage,
                  })}
                >
                  woori I zikimi
                </h1>
              </div>
            </div>
          </div>

          {/* 우측 - 작성 버튼 & 프로필 버튼 */}
          <div className="flex items-center gap-4">
            {!onNewPosts && !onLogin && (
              <Button
                className={clsx(
                  "bg-[#0074c9] text-white hover:bg-white hover:cursor-pointer",
                  {
                    "bg-[#0074c9] text-white hover:bg-[#005BA3]": onMainPage,
                    "bg-white text-[#0074c9] hover:bg-gray-50": !onMainPage,
                  }
                )}
                onClick={() => handleNewPost()}
              >
                <Plus
                  className={clsx("w-4 h-4 mr-2", {
                    "text-white": onMainPage,
                    "text-[#0074c9]": !onMainPage,
                  })}
                />
                Write
              </Button>
            )}

            {!onLogin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={clsx(
                      "w-8 h-8 rounded-full p-0  hover:cursor-pointer",
                      {
                        "text-[#0074c9] bg-white hover:text-white hover:bg-[#0074c9]":
                          onMainPage,
                        "text-white bg-[#0074c9] hover:text-[#0074c9] hover:bg-white":
                          !onMainPage,
                      }
                    )}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!onMyPosts && (
                    <DropdownMenuItem
                      className="hover:cursor-pointer"
                      onClick={() => handleMyPost()}
                    >
                      View My Posts
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className="hover:cursor-pointer"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 hover:cursor-pointer"
                    onClick={() => handleLogout()}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
