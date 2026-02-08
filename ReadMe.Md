# Mini Document Manager

##  Architecture

### Backend (`server/`)

- **Nodejs and Express**
- **File Handling**: `multer` for multipart/form-data (uploads)
- **FileSystem**: uses `fs` module to store and retrieve files from a local `uploads/` directory
- **Utilities**:  modules for search, sort, and pagination logic

### Frontend (`client/`)

- **Framework**: React

---

## Backend Endpoints & Logic

### Upload Files

- **Endpoint**: `POST /api/upload`
- **Logic**:
  - Uses `multer` middleware to handle file uploads (multiple as well)
  - **Storage**: Saves files to `server/uploads/`
  - **Naming Convention**: Timestamp + Original Filename (eg, `1739000000000-documentpdf`) to prevent collisions
  - **Validation**:
    - **File Type**: Only allows `pdf` and `txt`
    - **Size Limit**: Maximum 5MB
  - **Response**: Returns success message and file metadata

### List Files

- **Endpoint**: `GET /api/files`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page(default: 5)
  - `search`: Search term for filtering by filename
  - `sort`: Field to sort by date
  - `order`: Sort order ("asc" or "desc")
- **Logic**:
  1  **Read**: Scans `uploads/` directory using `fsreaddir`
    **Stat**: Retrieves file stats (size, creation date) for each file
  3  **Filter**: Filters files based on the `search` query (case-insensitive)
  4  **Sort**: Sorts filtered list based on `sort` and `order` params
  5  **Paginate**: Slices  array based on `page` and `limit`
- **Response**:
  ```json
  {
    "files": [ ...fileObjects ],
    "currentPage": 1,
    "totalPages": 5,
    "totalFiles": 23
  }
  ```

### Download File

- **Endpoint**: `GET /api/download/:filename`
- **Logic**:
  - Validates file existence
  - Streams the file to the response using `fscreateReadStream`
  - Sets appropriate headersto trigger a file download in the browser

---

## Frontend Components & Flow

### Service Layer (`client/src/services/apijs`)

- Centralizes API calls
- `uploadFiles(files)`: Sends `FormData` to `/api/upload`
- `fetchUploadedFiles(page, limit, search, sort, order)`: Constructs query string and fetches file list

### FileUpload Component (`client/src/FileUpload.jsx`)

- **UI**: File input (multiple), styling for selected file count, "Upload All" button
- **Logic**:
  - Manages selected files in local state
  - Validates that files are selected before uploading
  - Simulates a 2-second delay for better UX (loading state)
  - Calls `onUploadSuccess` prop upon completion to trigger a refresh in the sibling component

### UploadedItems Component (`client/src/UploadedItems.jsx`)

- **UI**: Search bar, Sort dropdown, File Table (Name, Size, Date, Action), Pagination controls
- **Logic**:
  - Fetches data on mount and whenever dependencies change (`page`, `search`, `sort`, `refresh`)
  - **Search**: Real-time filtering updates the list and resets to page 1
  - **Sort**: Toggles between "Newest First" and "Oldest First"
  - **Pagination**: Next/Prev buttons to navigate pages
  - **Download**: Direct link to the backend download endpoint

### App Component (`client/src/App.jsx`)

- App home page
- Maintains a `refresh` state
- Passes `handleUploadSuccess` to `FileUpload` which increments `refresh`
- Passes `refresh` to `UploadedItems` to trigger re fetching of the file list after a new upload

---

## Directory Structure

```
Mini_Doc_Manager/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/     # (Implicit in source)
│   │   ├── services/       # API wrappers
│   │   ├── Appjsx         # Main Component
│   │   └── mainjsx        # Entry Point
│   └── packagejson
└── server/                 # Backend
    ├── services/           # Business logic (fileServicejs)
    ├── uploads/            # File storage (gitignored)
    ├── utils/              # Helpers (search, sort, pagination)
    ├── indexjs            # Entry point & Route definitions
    └── packagejson
```
