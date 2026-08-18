import { Router } from "express";
import { upload } from "../config/multer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadPdfAndAnswerLangChain } from "../controllers/langchain.controller.js";

const router = Router();
router.post(
  "/lc/upload",
  upload.single("pdf"),
  asyncHandler(uploadPdfAndAnswerLangChain),
);

export default router;
