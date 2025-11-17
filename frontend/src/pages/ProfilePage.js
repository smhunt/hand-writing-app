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
      <div className="card max-w-md mx-auto text-center">
        <p className="text-gray-600">Please log in to access your profile.</p>
        <a href="/login" className="btn btn-primary mt-4 inline-block">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="page-title">Your Handwriting Profile</h2>

      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xl font-bold">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Download Template</h3>
            <p className="text-gray-600 mb-4">Click the button below to download the handwriting template. Print it and fill it in with your handwriting.</p>
            <button onClick={downloadTemplate} className="btn btn-primary">
              📄 Download Template PDF
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xl font-bold">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Filled Template</h3>
            <p className="text-gray-600 mb-4">Once you've written on the template, scan or take a clear photo of it, then upload the image here.</p>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                name="sheet"
                accept="image/png, image/jpeg, application/pdf"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <button type="submit" className="btn btn-primary">
                📤 Upload & Process
              </button>
            </form>
            {uploadStatus && (
              <p className={`mt-3 text-sm ${uploadStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {uploadStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {availableChars.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Captured Characters</h3>
          <p className="text-gray-600 mb-4">
            <span className="font-medium text-primary-600">{availableChars.length} characters</span> captured: {availableChars.join(', ')}
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
            {availableChars.map(ch => (
              <div key={ch} className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <img
                  src={`/uploads/${user.id}/${ch}.png`}
                  alt={ch}
                  onError={(e) => { e.target.style.display = 'none'; }}
                  className="w-12 h-12 object-contain border border-gray-200 rounded"
                />
                <span className="text-xs font-medium text-gray-700">{ch}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            💡 Tip: You can draw more characters or re-upload a new sheet to update your samples.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
