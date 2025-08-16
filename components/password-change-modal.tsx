"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PasswordChangeModal({
    isOpen,
    onClose,
}: PasswordChangeModalProps) {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // 클라이언트 측 기본 검증
        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirmPassword: "새 비밀번호가 일치하지 않습니다" });
            setIsLoading(false);
            return;
        }
        if (formData.newPassword.length < 6) {
            setErrors({ newPassword: "비밀번호는 최소 6자 이상이어야 합니다" });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/changePw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // same-origin이면 생략 가능
                cache: "no-store",
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // 성공 처리
                alert(data.message ?? "비밀번호가 성공적으로 변경되었습니다!");
                onClose();
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                // 상태코드에 따라 폼 에러 표시
                if (res.status === 401) {
                    setErrors({
                        currentPassword:
                            data.message ?? "현재 비밀번호가 올바르지 않습니다",
                    });
                } else if (res.status === 404) {
                    setErrors({ currentPassword: "유저를 찾을 수 없습니다." });
                } else if (res.status === 400) {
                    // 서버 측 검증 실패 메시지
                    const msg = data.message ?? "요청을 확인해주세요.";
                    // 어디에 띄울지 애매하면 newPassword 쪽으로
                    setErrors({ newPassword: msg });
                } else {
                    alert(
                        data.message ??
                            "변경에 실패했습니다. 잠시 후 다시 시도해주세요."
                    );
                }
            }
        } catch (err) {
            console.error(err);
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        비밀번호 변경
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">현재 비밀번호</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) =>
                                handleChange("currentPassword", e.target.value)
                            }
                            placeholder="현재 비밀번호를 입력하세요"
                            required
                        />
                        {errors.currentPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">새 비밀번호</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) =>
                                handleChange("newPassword", e.target.value)
                            }
                            placeholder="새 비밀번호를 입력하세요"
                            required
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.newPassword}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            새 비밀번호 확인
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                handleChange("confirmPassword", e.target.value)
                            }
                            placeholder="새 비밀번호를 다시 입력하세요"
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            className="flex-1 bg-[#1976D2] hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            취소
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default PasswordChangeModal;
