import { answerQuestion, ingestPdf } from "../services/langchain.service.js";

export async function uploadPdfAndAnswerLangChain(req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded under field 'pdf'");
  }

  const question = req.body.question;
  if (!question) {
    return res.status(400).send("Missing question");
  }

  await ingestPdf(req.file.path);
  const answer = await answerQuestion(question);
  res.send(answer);
}
