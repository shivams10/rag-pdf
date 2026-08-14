import { genaiClient } from "../config/genaiClient.js";
import { EMBEDDING_MODEL } from "../constants/index.js";

export async function createEmbedding(text) {
  const response = await genaiClient.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
  });
  return response?.embeddings?.[0].values;
}
