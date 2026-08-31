import { Router } from "express";
import collectionRoutes from "./collection.routes.js";
import uploadRoutes from "./upload.routes.js";
import langchainRoutes from "./langchain.routes.js";
import sttRoutes from "./stt.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("<h1>Hi Shivam here</h1>");
});

router.use(collectionRoutes);
router.use(uploadRoutes);
router.use(langchainRoutes);
router.use(sttRoutes);

export default router;
