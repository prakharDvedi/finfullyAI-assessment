const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); //parse the Urlencoded form data to json
app.use("/uploads", express.static("uploads")); // use static files from uploads folder

// importing fileservices
const {
  listAllFiles,
  getFileStream,
  UPLOADS_DIR,
} = require("./services/fileService");

// creater local diskstroiage using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // creates directory
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR);
    }
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // unique filename
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

// file limit, size limit , type filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    // Only allow PDF and TXT files
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

// POST endpoint 
app.post("/api/upload", (req, res) => {
  upload.array("files", 10)(req, res, (err) => {
    

    try {
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "no files uploaded" });
      }
      // success response with file details
      res.json({ message: "success", files: req.files });
    } catch (error) {
      console.error("upload err", error);
      res.status(500).json({ error: "internal err" });
    }
  });
});

// import utility functions for operations
const { filterFiles } = require("./utils/search");
const { sortFiles } = require("./utils/sort");
const { paginateFiles } = require("./utils/pagination");

// GET endpoint for downloading a file
app.get("/api/download/:filename", (req, res) => {
  try {
    // retrieve file stream
    const { stream, size, filename } = getFileStream(req.params.filename);

    // set response headers 
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", size);

    // Stream file to client
    stream.pipe(res);

    // Handle stream errors
    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end();
    });
  } catch (error) {
    console.error("Download error:", error.message);
    // Return 404 if file not found, otherwise 500
    if (error.message === "File not found") {
      res.status(404).send({ message: "File not found" });
    } else {
      res.status(500).send({ message: "Could not download the file" });
    }
  }
});

// GET endpoint for listing files with search, sort, and pagination
app.get("/api/files", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";
  const sort = req.query.sort || "";
  const order = req.query.order || "asc";

  try {
    // fetching all files
    const files = await listAllFiles();

    // apply search filter
    let filteredFiles = filterFiles(files, search);
    
    // apply sorting
    sortFiles(filteredFiles, sort, order);

    // apply pagination
    const { files: paginatedFiles } = paginateFiles(filteredFiles, page, limit);

    // return response 
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

// Start server and listen on specified port
app.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
