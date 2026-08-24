import { answerQuestion, ingestPdf } from "../services/langchain.service.js";
import { uploadPdfTos3 } from "../services/s3.service.js";

export async function uploadPdfAndAnswerLangChain(req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded under field 'pdf'");
  }

  const question = req.body.question;
  if (!question) {
    return res.status(400).send("Missing question");
  }

  const uuid = crypto.randomUUID();
  const s3Key = `uploads/${uuid}-${req.file.originalname}`;
  await uploadPdfTos3(s3Key, req.file.buffer, req.file.mimetype);
  await ingestPdf(s3Key);
  const answer = await answerQuestion(question);
  res.send(answer);
}
