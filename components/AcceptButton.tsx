"use client";

import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toggleAccept } from "@/lib/accpetComment";

type Props = {
    questionId: string;
    commentId: string;
    accepted: boolean;
};

export default function AcceptButton({
    questionId,
    commentId,
    accepted,
}: Props) {
    const [loading, setLoading] = useState(false);

    const onClick = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await toggleAccept(questionId, commentId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                accepted
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-600 text-emerald-700"
            }`}
            title={accepted ? "채택 해제" : "이 댓글 채택"}
            aria-pressed={accepted}
        >
            <CheckCircle className="w-4 h-4" />
            <span>{accepted ? "채택됨" : "채택"}</span>
        </button>
    );
}
