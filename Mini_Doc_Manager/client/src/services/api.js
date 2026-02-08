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
