import { genaiClient } from "../config/genaiClient.js";
import { GENERATION_MODEL } from "../constants/index.js";

export async function generateAnswer(question, context) {
  const response = await genaiClient.models.generateContent({
    model: GENERATION_MODEL,
    contents: `Answer the question using the context ${context} and question is ${question}`,
  });
  return response.text;
}
