import { extractTextFromPdf, chunkText } from "../services/pdf.service.js";
import { createEmbedding } from "../services/embedding.service.js";
import {
  upsertChunks,
  searchSimilarChunk,
} from "../services/qdrant.service.js";
import { generateAnswer } from "../services/rag.service.js";

export async function uploadPdfAndAnswer(req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded under field 'pdf'");
  }

  const question = req.body.question;
  if (!question) {
    return res.status(400).send("Missing 'question' field");
  }

  const text = await extractTextFromPdf(req.file.buffer);
  const chunks = chunkText(text);

  const chunkEmbeddings = [];
  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);
    chunkEmbeddings.push({ text: chunk, embedding });
  }

  await upsertChunks(chunkEmbeddings);

  const questionEmbedding = await createEmbedding(question);
  const bestChunk = await searchSimilarChunk(questionEmbedding);

  const answer = await generateAnswer(question, bestChunk);
  res.send(answer);
}

// This lines of code can be used if we dont have any  vector db
// let bestChunk = null;
// let bestScore = -Infinity;

// function cosineSimilarity(vecA, vecB) {
//   let dotProduct = 0;
//   for (let i = 0; i < vecA.length; i++) {
//     dotProduct += vecA[i] * vecB[i];
//   }
//   return dotProduct;
// }

// for (const item of chunkEmbedding) {
//   const score = cosineSimilarity(questionEmbedding, item.embedding);
//   if (score > bestScore) {
//     bestChunk = item.text;
//     bestScore = score;
//   }
// }
