"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // 코드 테마 선택
import DOMPurify from "dompurify";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [detectedLang, setDetectedLang] = useState(language ?? "plaintext"); // 자동 감지 언어
  const [highlightedCode, setHighlightedCode] = useState(""); // highlight.js로 하이라이트된 HTML 문자열

  useEffect(() => {
    const result = language
      ? hljs.highlight(code, { language, ignoreIllegals: true })
      : hljs.highlightAuto(code); // highlightAuto: 문자열 code의 내용을 보고 언어 추측

    const sanitized = DOMPurify.sanitize(result.value); // XSS 방지
    setHighlightedCode(sanitized);
    setDetectedLang(result.language ?? "plaintext"); // 감지된 언어를 detectedLang에 저장
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-600">
        <span className="font-mono text-sm text-green-400">{detectedLang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded font-mono text-xs bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* 코드 블럭 */}
      <pre className="p-4 overflow-x-auto">
        <code
          className="hljs font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock;
