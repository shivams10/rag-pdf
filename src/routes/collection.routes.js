import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCollection } from "../controllers/collection.controller.js";

const router = Router();

router.post("/collection", asyncHandler(createCollection));

export default router;
