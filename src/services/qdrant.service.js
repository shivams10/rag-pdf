import { qdrantClient } from "../config/qdrantClient.js";
import { COLLECTION_NAME, EMBEDDING_VECTOR_SIZE } from "../constants/index.js";

export async function createPdfCollection() {
  return qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: {
      size: EMBEDDING_VECTOR_SIZE,
      distance: "Cosine",
    },
  });
}

export async function upsertChunks(chunkEmbeddings) {
  const points = chunkEmbeddings.map((item, index) => ({
    id: index + 1,
    vector: item.embedding,
    payload: {
      text: item.text,
    },
  }));

  return qdrantClient.upsert(COLLECTION_NAME, { points });
}

export async function searchSimilarChunk(vector) {
  const searchResult = await qdrantClient.query(COLLECTION_NAME, {
    query: vector,
    limit: 1,
    with_payload: true,
  });
  return searchResult.points[0]?.payload?.text;
}
