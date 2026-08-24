import multer from "multer";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");
    cb(isPdf ? null : new Error("Only PDF files are allowed"));
  },
});
