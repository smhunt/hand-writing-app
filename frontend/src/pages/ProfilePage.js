import React, { useEffect, useState } from 'react';

function ProfilePage({ user }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [availableChars, setAvailableChars] = useState([]);
  const [fontInfo, setFontInfo] = useState(null);
  const [fontStatus, setFontStatus] = useState(null);
  const [generatingFont, setGeneratingFont] = useState(false);

  useEffect(() => {
    // Fetch profile info (which chars are available)
    async function fetchProfile() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAvailableChars(data.letters || []);
      }
    }

    // Fetch font info if exists
    async function fetchFontInfo() {
      const res = await fetch('/api/font/info', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFontInfo(data);
      } else {
        setFontInfo(null);
      }
    }

    if (user) {
      fetchProfile();
      fetchFontInfo();
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

  const handleGenerateFont = async (regenerate = false) => {
    try {
      setGeneratingFont(true);
      setFontStatus('Generating font...');

      const res = await fetch('/api/font/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Font generation failed');
      }

      setFontInfo(data);
      setFontStatus(`Font generated successfully! ${data.characterCount} characters included.`);
    } catch (err) {
      setFontStatus('Error: ' + err.message);
    } finally {
      setGeneratingFont(false);
    }
  };

  const downloadFont = (format) => {
    if (!user) return;
    window.open(`/api/font/download/${user.id}/${format}`, '_blank');
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

      {availableChars.length > 0 && (
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Your Font</h3>
              <p className="text-gray-600 mb-4">
                Create an installable font from your handwriting that you can use on your computer or website!
              </p>

              {!fontInfo ? (
                <div>
                  <button
                    onClick={() => handleGenerateFont(false)}
                    disabled={generatingFont}
                    className="btn btn-primary"
                  >
                    {generatingFont ? '⏳ Generating...' : '✨ Generate Font'}
                  </button>
                  {fontStatus && (
                    <p className={`mt-3 text-sm ${fontStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                      {fontStatus}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Font Ready!</h4>
                    <p className="text-sm text-green-700">
                      Font Family: <span className="font-mono font-semibold">{fontInfo.familyName}</span>
                    </p>
                    <p className="text-sm text-green-700">
                      {fontInfo.characterCount} characters included
                    </p>
                    {fontInfo.skippedCharacters && fontInfo.skippedCharacters.length > 0 && (
                      <p className="text-xs text-green-600 mt-2">
                        ⚠️ {fontInfo.skippedCharacters.length} image-based characters skipped: {fontInfo.skippedCharacters.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => downloadFont('ttf')}
                      className="btn btn-primary"
                    >
                      💾 Download TTF (Desktop)
                    </button>
                    <button
                      onClick={() => downloadFont('woff2')}
                      className="btn btn-secondary"
                    >
                      🌐 Download WOFF2 (Web)
                    </button>
                    <button
                      onClick={() => handleGenerateFont(true)}
                      disabled={generatingFont}
                      className="btn btn-outline"
                    >
                      {generatingFont ? '⏳ Regenerating...' : '🔄 Regenerate'}
                    </button>
                  </div>

                  {fontStatus && (
                    <p className={`text-sm ${fontStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                      {fontStatus}
                    </p>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How to Install</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p><strong>Desktop (Windows/Mac/Linux):</strong></p>
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Download the TTF file</li>
                        <li>Double-click the file to open it</li>
                        <li>Click "Install" button</li>
                        <li>Use it in Word, Photoshop, or any application!</li>
                      </ol>
                      <p className="mt-3"><strong>Web Usage:</strong></p>
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Download the WOFF2 file</li>
                        <li>Upload to your website server</li>
                        <li>Add @font-face CSS rule</li>
                        <li>Apply the font to your text elements</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
