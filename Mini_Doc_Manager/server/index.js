const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

const {
  listAllFiles,
  getFileStream,
  UPLOADS_DIR,
} = require("./services/fileService");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR);
    }
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

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

const { filterFiles } = require("./utils/search");
const { sortFiles } = require("./utils/sort");
const { paginateFiles } = require("./utils/pagination");

app.get("/api/download/:filename", (req, res) => {
  try {
    const { stream, size, filename } = getFileStream(req.params.filename);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", size);

    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end();
    });
  } catch (error) {
    console.error("Download error:", error.message);
    if (error.message === "File not found") {
      res.status(404).send({ message: "File not found" });
    } else {
      res.status(500).send({ message: "Could not download the file" });
    }
  }
});

app.get("/api/files", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";
  const sort = req.query.sort || "";
  const order = req.query.order || "asc";

  try {
    const files = await listAllFiles();

    let filteredFiles = filterFiles(files, search);
    sortFiles(filteredFiles, sort, order);

    const { files: paginatedFiles } = paginateFiles(filteredFiles, page, limit);

    res.json({
      files: paginatedFiles,
      currentPage: page,
      totalPages: Math.ceil(filteredFiles.length / limit),
      totalFiles: filteredFiles.length,
    });
  } catch (err) {
    console.error("scanning error", err);
    res.status(500).send({
      message: "scanning error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
