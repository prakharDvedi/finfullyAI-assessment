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

export const fetchUploadedFiles = async (page, limit, search, sort, order) => {
  const query = new URLSearchParams({
    page,
    limit,
    search: search || "",
    sort: "date",
    order: order || "desc",
  }).toString();

  const response = await fetch(`${API_URL}/files?${query}`);
  if (!response.ok) throw new Error("Failed to fetch files");
  return response.json();
};
