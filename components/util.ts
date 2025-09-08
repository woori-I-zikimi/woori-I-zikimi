// util.ts
export const parseQuestionText = (text: string) => {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  // 제목 = 첫 줄
  const title = (lines[0] || "").trim();

  // 빈 줄 찾기 (본문 시작 기준)
  const emptyIdx = lines.findIndex((line, idx) => idx > 0 && line.trim() === "");

  let body = "";
  if (emptyIdx !== -1) {
    body = lines.slice(emptyIdx + 1).join("\n").trim();
  } else {
    // 빈 줄이 없으면 2번째 줄부터 본문 처리
    body = lines.slice(1).join("\n").trim();
  }

  return { title, body };
};
