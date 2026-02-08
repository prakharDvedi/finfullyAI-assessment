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
