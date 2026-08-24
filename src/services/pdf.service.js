import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromPdf(buffer) {
  const pdfData = await pdfParse(buffer);
  return pdfData.text;
}

export function chunkText(text) {
  return text.split("\n\n").filter((chunk) => chunk.trim() !== "");
}
