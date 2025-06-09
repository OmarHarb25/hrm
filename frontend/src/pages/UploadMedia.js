import React, { useState } from 'react';
import axios from 'axios';

function UploadMedia() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:8000/upload/", formData);
    setUrl("http://localhost:8000" + res.data.url);
  };

  return (
    <div className="page">
      <h2>Upload Media File</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {url && <p>Uploaded File URL: <a href={url}>{url}</a></p>}
    </div>
  );
}

export default UploadMedia;
