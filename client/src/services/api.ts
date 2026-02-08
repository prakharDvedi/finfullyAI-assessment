const API_URL = "http://localhost:5000/api";

export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Upload failed");
  }

  return response.json();
};

export const fetchUploadedFiles = async () => {
  const response = await fetch(`${API_URL}/files`);
  if (!response.ok) throw new Error("Failed to fetch files");
  return response.json();
};
