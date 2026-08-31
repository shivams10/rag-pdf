import { Router } from "express";
import { uploadAudio } from "../config/multer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transcribeAudioFile } from "../controllers/stt.controller.js";

const router = Router();
router.post("/stt", uploadAudio.single("audio"), asyncHandler(transcribeAudioFile));

export default router;
