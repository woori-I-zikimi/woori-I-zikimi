import { Home, MessageCircle, Plus, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
    <header className="bg-white text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 좌측 홈 버튼 */}
          <Button
            variant="ghost"
            className="text-[#005fa3] hover:text-blue-100 hover:bg-[#005fa3] hover: cursor-pointer"
            onClick={() => handleHomeClick()}
          >
            <Home className="w-4 h-4" />
          </Button>

          {/* 중앙 - 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#0074c9]" />
            </div>
            <h1 className="text-lg font-bold text-[#0074c9]">woori I zikimi</h1>
          </div>

          {/* 우측 - 작성 버튼 & 프로필 버튼 */}
          <div className="flex items-center gap-4">
            <Button
              className="bg-[#0074c9] text-white hover:bg-[#0074c9] hover: cursor-pointer"
              onClick={() => handleNewPost()}
            >
              <Plus className="w-4 h-4 mr-2 text-white" />
              Write
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0 text-white bg-[#005fa3] hover: cursor-pointer"
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleMyPost()}>
                  View My Posts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)}>
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => handleLogout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
