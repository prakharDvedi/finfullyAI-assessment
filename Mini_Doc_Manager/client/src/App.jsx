import { useState } from "react";
import "./App.css";
import UploadedItems from "./UploadedItems";
import FileUpload from "./FileUpload";

function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  // this is a callback function that will be called when the upload is successful
  // it will increment the refreshToken by 1
  // this will cause the UploadedItems component to re-render
  // and fetch the new files
  const handleUploadSuccess = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return (
    <>
      <div className="header">
        <h2>Mini Document Manager</h2>
      </div>
      <FileUpload onUploadSuccess={handleUploadSuccess} />

      <UploadedItems refreshToken={refreshToken} />
    </>
  );
}

export default App;
