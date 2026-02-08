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
