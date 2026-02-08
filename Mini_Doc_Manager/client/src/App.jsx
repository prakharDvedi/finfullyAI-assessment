import { useState } from "react";
import "./App.css";
import UploadedItems from "./UploadedItems";
import FileUpload from "./FileUpload";

function App() {
  const [refresh, setRefresh] = useState(0);
  // this is a callback function that will be called when the upload is successful
  // it will increment the refresh by 1
  // triggers useEffect and re renders
  const handleUploadSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <>
      <div className="header">
        <h2>Mini Document Manager</h2>
      </div>
      <FileUpload onUploadSuccess={handleUploadSuccess} />

      <UploadedItems refresh={refresh} />
    </>
  );
}

export default App;
