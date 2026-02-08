import { useState } from "react";
import { uploadFiles } from "./services/api";

function FileUpload({ onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Please select files first");
      return;
    }

    try {
      setUploadStatus("");
      setIsUploading(true);

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
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
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
