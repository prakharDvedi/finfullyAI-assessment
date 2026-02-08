import { useState, useEffect } from "react";
import { fetchUploadedFiles } from "./services/api.ts";
import styles from "./UploadedItems.module.css";

interface UploadedFile {
  name: string;
  url: string;
}

function UploadedItems({ refreshToken }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = () => {
    setLoading(true);
    fetchUploadedFiles()
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshToken]);

  return (
    <div className={`card ${styles["uploaded-items-card"]}`}>
      <h2>Uploaded Files</h2>

      {loading ? (
        <div className="loader"></div>
      ) : files.length > 0 ? (
        <table className={styles["files-table"]}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td>{file.name}</td>
                <td className={styles["action-column"]}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles["view-btn"]}
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
}

export default UploadedItems;
