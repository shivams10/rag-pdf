import { Router } from "express";
import { upload } from "../config/multer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadPdfAndAnswer } from "../controllers/upload.controller.js";

const router = Router();

router.post("/upload", upload.single("pdf"), asyncHandler(uploadPdfAndAnswer));

export default router;
