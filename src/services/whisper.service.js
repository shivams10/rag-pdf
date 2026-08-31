import { VOICE_SIDECAR_URL } from "../config/env.js";

export async function transcribeAudio(buffer, mimetype) {
  const formData = new FormData();
  formData.append("audio", new Blob([buffer], { type: mimetype }), "recording");

  const response = await fetch(`${VOICE_SIDECAR_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Voice sidecar /transcribe failed (${response.status}): ${message}`);
  }

  const { transcript } = await response.json();
  return transcript;
}
