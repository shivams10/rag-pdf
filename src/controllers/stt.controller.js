import { transcribeAudio } from "../services/whisper.service.js";

export async function transcribeAudioFile(req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded under field 'audio'");
  }

  const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);
  res.json({ transcript });
}
