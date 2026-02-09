# Mini Doc Manager Codebase

This document contains the source code for the Mini Doc Manager project.

## Client

### `client/src/App.jsx`

```jsx
import { useState } from "react";
import "./App.css";
import UploadedItems from "./UploadedItems";
import FileUpload from "./FileUpload";

function App() {
  const [refresh, setRefresh] = useState(0);
  // this is a callback function that will be called when the upload is successful
  // it will increment the refresh by 1
  // triggers useEffect and re renders
  const handleUploadSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <>
      <div className="header">
        <h2>Mini Document Manager</h2>
      </div>
      <FileUpload onUploadSuccess={handleUploadSuccess} />

      <UploadedItems refresh={refresh} />
    </>
  );
}

export default App;
```

### `client/src/FileUpload.jsx`

```jsx
import { useState } from "react";
import { uploadFiles } from "./services/api";

function FileUpload({ onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 3 states handled - file, their uploading state (laoading) and status)

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  //on updfate or upload appends the array

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("select files first");
      return;
    }

    //checks if files are selected

    try {
      setUploadStatus("");
      setIsUploading(true);

      // artificial delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = await uploadFiles(files);
      setUploadStatus(`Success: ${data.message}`);
      setFiles([]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(`Error: ${error.message || "Upload failed"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <input type="file" multiple onChange={handleFileChange} />
      <div className="file-info">
        {files.length > 0 && <p>{files.length} file(s) selected</p>}
      </div>
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload All"}
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}

export default FileUpload;
```

### `client/src/UploadedItems.jsx`

```jsx
import { useState, useEffect } from "react";
import { fetchUploadedFiles } from "./services/api";
import styles from "./UploadedItems.module.css";

// logic to paginate and sort and search on frontend
function UploadedItems({ refresh }) {
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const LIMIT = 5;

  const fetchFiles = (page, searchTerm, sort) => {
    setLoading(true);
    fetchUploadedFiles(page, LIMIT, searchTerm, sort)
      .then((data) => {
        setFiles(data.files);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles(currentPage, search, sortOrder);
  }, [currentPage, refresh, search, sortOrder]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={`card ${styles["uploaded-items-card"]}`}>
      <h2>Uploaded Files</h2>

      <div className={styles["controls-container"]}>
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={handleSearchChange}
          className={styles["search-input"]}
        />
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className={styles["sort-select"]}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : files.length > 0 ? (
        <>
          <table className={styles["files-table"]}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Date</th>
                <th className={styles["action-column"]}>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.name}
                    </a>
                  </td>
                  <td>{(file.size / 1024).toFixed(2)} KB</td>
                  <td>{new Date(file.date).toLocaleDateString()}</td>
                  <td className={styles["action-column"]}>
                    <a
                      href={file.downloadUrl}
                      className={styles["download-btn"]}
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles["pagination-container"]}>
            <button onClick={handlePrev} disabled={currentPage === 1}>
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
}

export default UploadedItems;
```

### `client/src/services/api.js`

```javascript
const API_URL = "http://localhost:5000/api";

// this is the service file to call oiur backend api, it will be used in our components to fetch and upload files

export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  // upload function sends a post request to backend in form format -- urlencoded -- converted to JSON object

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  // waits for async response, error handled

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "failure upload");
  }

  return response.json();
};

// fetches data from backedn, sorts, filter and paginartes the data based on query params, returns json response to frontend
export const fetchUploadedFiles = async (page, limit, search, sort, order) => {
  const query = new URLSearchParams({
    page,
    limit,
    search: search || "",
    sort: "date",
    order: order || "desc",
  }).toString();

  const response = await fetch(`${API_URL}/files?${query}`);
  if (!response.ok) throw new Error("failure fetching files");
  return response.json();
};
```

## Server

### `server/index.js`

```javascript
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
```

### `server/services/fileService.js`

```javascript
const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const listAllFiles = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) {
        return reject(err);
      }

      const fileObjects = files
        .map((file) => {
          const filePath = path.join(UPLOADS_DIR, file);
          try {
            const stats = fs.statSync(filePath);
            return {
              name: file,
              size: stats.size,
              date: stats.mtime,
              url: `http://localhost:5000/uploads/${file}`,
              downloadUrl: `http://localhost:5000/api/download/${file}`,
            };
          } catch (e) {
            console.error(`Error getting stats for file ${file}:`, e);
            return null;
          }
        })
        .filter(Boolean);

      resolve(fileObjects);
    });
  });
};

const getFileStream = (filename) => {
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }

  const stats = fs.statSync(filePath);
  const readStream = fs.createReadStream(filePath);

  return {
    stream: readStream,
    size: stats.size,
    filename: filename,
    path: filePath,
  };
};

module.exports = {
  listAllFiles,
  getFileStream,
  UPLOADS_DIR,
};
```

### `server/utils/search.js`

```javascript
const filterFiles = (files, search) => {
  if (!search) return files;
  return files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase()),
  );
};

module.exports = { filterFiles };
```

### `server/utils/sort.js`

```javascript
const sortFiles = (files, sort, order) => {
  return files.sort((a, b) => {
    if (sort === "date") {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return order === "asc" ? timeA - timeB : timeB - timeA;
    }
    return 0;
  });
};

module.exports = { sortFiles };
```

### `server/utils/pagination.js`

```javascript
const paginateFiles = (files, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    files: files.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  };
};

module.exports = { paginateFiles };
```

### `server/package.json`

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.6",
    "ejs": "^4.0.1",
    "express": "^5.2.1",
    "multer": "^2.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```
