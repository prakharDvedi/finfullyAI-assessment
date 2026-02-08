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
│   │   ├── components/     
│   │   ├── services/       # API
│   │   ├── App.jsx         # Main Component
│   │   └── mainjsx        # Entry Point
│   └── packagejson
└── server/                 # Backend
    ├── services/           # business logic fileService.js
    ├── uploads/            # File storage 
    ├── utils/              # sort search filter
    ├── index.js            # Entry point & routing
    └── package.json
```



---

# DESIGN QUESTIONS

## 1. Multiple Uploads

**How does your system handle uploading multiple documents?**

* One request or many?
* Any limits or tradeoffs?

**ANS -**
using multer's multipart/formdata which accepts an array of files and in a single call it gets uploaded to the backend endpoint

limits would be that if a large file is uploaded it can increase time as it is done in a single request but for medium to small scale things like document uplaod or image upload it is fine

in future chunking of some sort can be implemented for bigger data types like mp3

---

## 2. Streaming

**Why is streaming important for upload/download?**
**What problems occur if the server loads the full file into memory?**

**ANS-**
the reason why streaming is importnat is becuase of the nature of how files are uplaaoded or rendered
normally it is done by creating and bringing a copy of it to the RAM . This cause a spike on the server load as it is now having 2 copies.
imagine a large data and double of it will slow down the system hence chunking and piping is done so that we can have it rendered slowly and partially while the user slowly interacts and waits for it

---

## 3. Moving to S3

**If files move to object storage (e.g., S3):**

* What changes in your backend?
* Would the backend still handle file bytes?

**ANS -**
if we move it to S3 some endpoints will change such as the fetching and downloading file paths
but also it can now only store metadata not the object itself unlike local storage
backend will now generate URLs and it will be uplaoded to the S3 bucket and then rendered and streamed from that URL link itself
so no raw file bytes but authenticated and protected metadata ---- this will help in scalability

---

## 4. Frontend UX

**If you had more time:**

* How would you add document preview?
* How would you show upload progress?

i can take a snapshot or some sort of thumbnail webp file image in order to do this.
for text we can just read and fetch it inline
for pdf or text im not exactly sure but we can use iframe of similar way. there are some libraries for it


for upload progress we can have Axios
and then show success or failure at end

---
