// AcceptButton.tsx
"use client";

import { CheckCircle } from "lucide-react";

interface Props {
  accepted: boolean;
  onClick: () => void;
}

export default function AcceptButton({ accepted, onClick }: Props) {
  return (
    <button
      onClick={onClick}
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
