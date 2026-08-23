import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3Client.js";
import { S3_BUCKET_NAME } from "../config/env.js";

export async function uploadPdfTos3(key, buffer, contentType) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function getPdfBufferFromS3(key) {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }),
  );
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
