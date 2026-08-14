import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

export function chunkText(text) {
  return text.split("\n\n").filter((chunk) => chunk.trim() !== "");
}
