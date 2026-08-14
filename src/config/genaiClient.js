import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "./env.js";

export const genaiClient = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});
