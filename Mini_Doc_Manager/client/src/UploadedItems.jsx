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
