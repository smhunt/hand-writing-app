import React, { useEffect, useState } from 'react';

function ProfilePage({ user }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [availableChars, setAvailableChars] = useState([]);

  useEffect(() => {
    // Fetch profile info (which chars are available)
    async function fetchProfile() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAvailableChars(data.letters || []);
      }
    }

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const downloadTemplate = () => {
    // Simply navigate to the template download endpoint
    window.open('/api/template', '_blank');
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const fileInput = event.target.elements.sheet;
    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append('sheet', fileInput.files[0]);

    try {
      setUploadStatus('Uploading...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus('Upload successful! Processed characters: ' + data.chars.join(', '));
      setAvailableChars(data.chars);
    } catch (err) {
      setUploadStatus('Error: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <p>Please log in to access your profile.</p>
      </div>
    );
  }

  return (
    <div className="page ProfilePage">
      <h2>Your Handwriting Profile</h2>

      <section>
        <h3>1. Download Template</h3>
        <p>Click the button below to download the handwriting template. Print it and fill it in with your handwriting.</p>
        <button onClick={downloadTemplate}>Download Template PDF</button>
      </section>

      <section>
        <h3>2. Upload Filled Template</h3>
        <p>Once you've written on the template, scan or take a clear photo of it, then upload the image here.</p>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            name="sheet"
            accept="image/png, image/jpeg, application/pdf"
            required
          />
          <button type="submit">Upload & Process</button>
        </form>
        {uploadStatus && <p>{uploadStatus}</p>}
      </section>

      {availableChars.length > 0 && (
        <section>
          <h3>Your Captured Characters</h3>
          <p>Characters captured so far: {availableChars.join(', ')}</p>
          <div className="char-gallery">
            {availableChars.map(ch => (
              <div key={ch} className="char-thumb">
                <img
                  src={`/uploads/${user.id}/${ch}.png`}
                  alt={ch}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span>{ch}</span>
              </div>
            ))}
          </div>
          <p>You can draw more characters or re-upload a new sheet to update your samples.</p>
        </section>
      )}
    </div>
  );
}

export default ProfilePage;
