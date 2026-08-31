import "dotenv/config";

export const PORT = process.env.PORT || 4000;
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
export const QDRANT_URL = process.env.QDRANT_URL;
export const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const VOICE_SIDECAR_URL =
  process.env.VOICE_SIDECAR_URL;
