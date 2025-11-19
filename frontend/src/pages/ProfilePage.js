import React, { useEffect, useState } from 'react';
import DrawModal from '../components/DrawModal';

function ProfilePage({ user }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [availableChars, setAvailableChars] = useState([]);
  const [characterData, setCharacterData] = useState({});
  const [stats, setStats] = useState({ total: 0, vector: 0, image: 0 });
  const [fontInfo, setFontInfo] = useState(null);
  const [fontStatus, setFontStatus] = useState(null);
  const [generatingFont, setGeneratingFont] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);

  // Font library management state
  const [fonts, setFonts] = useState([]);
  const [currentFontId, setCurrentFontId] = useState('default');
  const [currentFontName, setCurrentFontName] = useState('My Handwriting');
  const [showNewFontDialog, setShowNewFontDialog] = useState(false);
  const [newFontName, setNewFontName] = useState('');
  const [renamingFontId, setRenamingFontId] = useState(null);
  const [renameFontName, setRenameFontName] = useState('');

  // Define all expected characters
  const allCharacters = {
    'Uppercase': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'Lowercase': 'abcdefghijklmnopqrstuvwxyz'.split(''),
    'Numbers': '0123456789'.split(''),
    'Symbols': '.,!?;:\'"()-'.split('')
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFontLibrary();
      fetchFontInfo();
    }
  }, [user]);

  // Fetch profile info (which chars are available)
  const fetchProfile = async () => {
    const res = await fetch('/api/profile', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setAvailableChars(data.letters || []);
      setCharacterData(data.characterData || {});
      setStats(data.stats || { total: 0, vector: 0, image: 0 });
      setCurrentFontId(data.currentFontId || 'default');
      setCurrentFontName(data.currentFontName || 'My Handwriting');
    }
  };

  // Fetch font library
  const fetchFontLibrary = async () => {
    const res = await fetch('/api/fonts', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setFonts(data.fonts || []);
      setCurrentFontId(data.currentFontId || 'default');
    }
  };

  // Fetch font info if exists
  const fetchFontInfo = async () => {
    const res = await fetch('/api/font/info', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setFontInfo(data);
    } else {
      setFontInfo(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/template', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'handwriting-template.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      alert(`Failed to download template: ${error.message}`);
    }
  };

  const openDrawModal = (char) => {
    setSelectedChar(char);
    setDrawModalOpen(true);
  };

  const closeDrawModal = () => {
    setDrawModalOpen(false);
    setSelectedChar(null);
  };

  const handleCharacterSaved = async (savedChar) => {
    // Refetch profile data to update stats
    const res = await fetch('/api/profile', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setAvailableChars(data.letters || []);
      setCharacterData(data.characterData || {});
      setStats(data.stats || { total: 0, vector: 0, image: 0 });

      // Find next incomplete character for auto-advance
      const allChars = Object.values(allCharacters).flat();
      const currentIndex = allChars.indexOf(savedChar);

      // Look for next incomplete character after current one
      const remaining = allChars.slice(currentIndex + 1).find(c => !data.letters.includes(c));

      if (remaining) {
        // Auto-advance to next incomplete character
        setSelectedChar(remaining);
      } else {
        // Look from the beginning
        const fromStart = allChars.find(c => !data.letters.includes(c));
        if (fromStart) {
          setSelectedChar(fromStart);
        } else {
          // All complete!
          setDrawModalOpen(false);
          alert('🎉 Congratulations! You\'ve completed all 73 characters!');
        }
      }
    }
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

  // Create a new font
  const handleCreateFont = async () => {
    if (!newFontName.trim()) {
      alert('Please enter a font name');
      return;
    }

    try {
      const res = await fetch('/api/fonts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFontName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create font');
      }

      setNewFontName('');
      setShowNewFontDialog(false);
      await fetchFontLibrary();
      alert(`Font "${data.font.name}" created successfully!`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Select/switch to a different font
  const handleSelectFont = async (fontId) => {
    try {
      const res = await fetch(`/api/fonts/${fontId}/select`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to select font');
      }

      await fetchProfile();
      await fetchFontLibrary();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Rename a font
  const handleRenameFont = async (fontId) => {
    if (!renameFontName.trim()) {
      alert('Please enter a new font name');
      return;
    }

    try {
      const res = await fetch(`/api/fonts/${fontId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameFontName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to rename font');
      }

      setRenamingFontId(null);
      setRenameFontName('');
      await fetchFontLibrary();
      await fetchProfile();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Delete a font
  const handleDeleteFont = async (fontId, fontName) => {
    if (fontId === 'default') {
      alert('Cannot delete the default font');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the font "${fontName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/fonts/${fontId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete font');
      }

      await fetchFontLibrary();
      await fetchProfile();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleGenerateFont = async (regenerate = false) => {
    try {
      setGeneratingFont(true);
      setFontStatus('Generating font...');

      // Generate the current font using the new endpoint
      const res = await fetch(`/api/fonts/${currentFontId}/generate`, {
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

  const downloadFont = async (format) => {
    if (!user) return;

    try {
      // Use the new font-specific download endpoint
      const response = await fetch(`/api/fonts/${currentFontId}/download/${format}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `handwriting.${format}`;
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create blob and download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Font download error:', error);
      alert(`Failed to download font: ${error.message}`);
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

  const totalPossible = Object.values(allCharacters).flat().length;
  const completionPercent = totalPossible > 0 ? Math.round((stats.total / totalPossible) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="page-title">Your Handwriting Profile</h2>

      {/* Font Library Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Font Library</h3>
          <button
            onClick={() => setShowNewFontDialog(!showNewFontDialog)}
            className="btn btn-primary text-sm"
          >
            ✨ New Font
          </button>
        </div>

        {/* New Font Dialog */}
        {showNewFontDialog && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-3">Create New Font</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFontName}
                onChange={(e) => setNewFontName(e.target.value)}
                placeholder="Font name (e.g., 'Cursive Style')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFont()}
              />
              <button onClick={handleCreateFont} className="btn btn-primary">
                Create
              </button>
              <button onClick={() => setShowNewFontDialog(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Font Display */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-300 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-primary-600">Current Font:</span>
            <span className="text-lg font-bold text-primary-900">{currentFontName}</span>
          </div>
          <p className="text-sm text-primary-700">
            {stats.total} characters drawn for this font
          </p>
        </div>

        {/* Font List */}
        <div className="space-y-2">
          {fonts.map((font) => (
            <div
              key={font.id}
              className={`
                border rounded-lg p-3 transition-all
                ${font.isCurrent
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {renamingFontId === font.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={renameFontName}
                        onChange={(e) => setRenameFontName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleRenameFont(font.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameFont(font.id)}
                        className="text-sm px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setRenamingFontId(null);
                          setRenameFontName('');
                        }}
                        className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${font.isCurrent ? 'text-primary-900' : 'text-gray-900'}`}>
                          {font.name}
                        </span>
                        {font.isCurrent && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {font.characterCount} characters • Created {new Date(font.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {renamingFontId !== font.id && (
                  <div className="flex gap-2">
                    {!font.isCurrent && (
                      <button
                        onClick={() => handleSelectFont(font.id)}
                        className="text-sm px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Use This
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRenamingFontId(font.id);
                        setRenameFontName(font.name);
                      }}
                      className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Rename
                    </button>
                    {font.id !== 'default' && (
                      <button
                        onClick={() => handleDeleteFont(font.id, font.name)}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          💡 Tip: Create multiple fonts for different styles (cursive, print, decorative, etc.)
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Training Progress</h3>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600 mt-1">Total Characters</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{stats.vector}</div>
            <div className="text-sm text-green-600 mt-1">Drawn (Vector)</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{stats.image}</div>
            <div className="text-sm text-purple-600 mt-1">Uploaded (Image)</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-700">{completionPercent}%</div>
            <div className="text-sm text-orange-600 mt-1">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{stats.total} / {totalPossible} characters</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Character Grid by Category */}
        {Object.entries(allCharacters).map(([category, chars]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
            <div className="grid grid-cols-10 sm:grid-cols-13 md:grid-cols-18 lg:grid-cols-26 gap-2">
              {chars.map(char => {
                const charInfo = characterData[char];
                const isComplete = charInfo && charInfo.hasData;
                const isVector = charInfo && charInfo.type === 'vector';
                const isImage = charInfo && charInfo.type === 'image';

                return (
                  <button
                    key={char}
                    onClick={() => openDrawModal(char)}
                    className={`
                      relative aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium
                      transition-all duration-200 hover:scale-110 cursor-pointer
                      ${isComplete
                        ? isVector
                          ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
                          : 'bg-purple-100 border-purple-400 text-purple-800 hover:bg-purple-200'
                        : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-gray-100 hover:border-primary-400'
                      }
                    `}
                    title={isComplete ? `${char} - ${isVector ? 'Drawn' : 'Uploaded'} - Click to redraw` : `${char} - Click to draw`}
                  >
                    {char}
                    {isComplete && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs">
                        {isVector ? '✏️' : '📷'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-400 flex items-center justify-center text-xs">A</div>
              <span>Drawn (vector, works in fonts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-100 border-2 border-purple-400 flex items-center justify-center text-xs">A</div>
              <span>Uploaded (image, skipped in fonts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-50 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-400">A</div>
              <span>Not completed</span>
            </div>
          </div>
        </div>
      </div>

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

      <DrawModal
        char={selectedChar}
        isOpen={drawModalOpen}
        onClose={closeDrawModal}
        onSave={handleCharacterSaved}
      />
    </div>
  );
}

export default ProfilePage;
