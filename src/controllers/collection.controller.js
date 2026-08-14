import { createPdfCollection } from "../services/qdrant.service.js";

export async function createCollection(req, res) {
  await createPdfCollection();
  res.send("collection is created");
}
