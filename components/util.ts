export const parseQuestionText = (text: string) => {
  const lines = text.split("\n");
  const title = lines[0] || "";
  const body = lines.slice(2).join("\n") || "";
  return { title, body };
};
