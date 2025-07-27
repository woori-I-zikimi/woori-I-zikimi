"use client";

import { useState, useEffect, useRef } from "react";
import { User, Settings, FileText, LogOut } from "lucide-react";
import AccountSettingsModal from "./AccountSettingsModal";
import { useRouter } from "next/navigation";

const ProfileButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuClick = (action: string) => {
        console.log(`${action} clicked`);
        setIsOpen(false);

        if (action === "account-settings") {
            setShowAccountModal(true);
        } else if (action === "my-posts") {
            router.push("/my-posts");
        }
    };

    // logout handle 분리했습니다
    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        router.push("/login");
        router.refresh();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-gray-800 rounded pixelated-border hover:bg-gray-700 transition-colors"
            >
                <User className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg pixelated-border shadow-lg z-50">
                    <div className="py-2">
                        <button
                            onClick={() => handleMenuClick("account-settings")}
                            className="w-full px-4 py-2 text-left font-mono hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Account Settings
                        </button>
                        <button
                            onClick={() => handleMenuClick("my-posts")}
                            className="w-full px-4 py-2 text-left font-mono hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            My Posts
                        </button>
                        <button
                            onClick={() => handleLogout()}
                            className="w-full px-4 py-2 text-left font-mono hover:bg-gray-700 transition-colors flex items-center gap-2 text-red-400"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
            {showAccountModal && (
                <AccountSettingsModal
                    isOpen={showAccountModal}
                    onClose={() => setShowAccountModal(false)}
                />
            )}
        </div>
    );
};

export default ProfileButton;
