const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("only text or pdf"));
  },
});

app.post("/api/upload", (req, res) => {
  upload.array("files", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log(req.files);
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "no files uploaded" });
      }
      res.json({ message: "success", files: req.files });
    } catch (error) {
      console.error("upload err", error);
      res.status(500).json({ error: "internal err" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
