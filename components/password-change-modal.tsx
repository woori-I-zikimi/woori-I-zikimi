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

        // Validate current password (simulate checking against DB)
        if (formData.currentPassword !== "password") {
            setErrors({ currentPassword: "현재 비밀번호가 올바르지 않습니다" });
            setIsLoading(false);
            return;
        }

        // Validate new passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirmPassword: "새 비밀번호가 일치하지 않습니다" });
            setIsLoading(false);
            return;
        }

        // Validate new password length
        if (formData.newPassword.length < 6) {
            setErrors({ newPassword: "비밀번호는 최소 6자 이상이어야 합니다" });
            setIsLoading(false);
            return;
        }

        // Simulate API call to update password
        await new Promise((resolve) => setTimeout(resolve, 1500));

        alert("비밀번호가 성공적으로 변경되었습니다!");
        setIsLoading(false);
        onClose();
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
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
