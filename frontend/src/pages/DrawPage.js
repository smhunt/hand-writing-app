import React, { useState } from 'react';
import Canvas from '../components/Canvas';

function DrawPage({ user }) {
  const [currentChar, setCurrentChar] = useState('A');
  const [status, setStatus] = useState('');

  const handleSave = async (char, strokes) => {
    try {
      setStatus(`Saving ${char}...`);
      const res = await fetch('/api/save-char', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ char, strokes })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }

      setStatus(`Character ${char} saved successfully!`);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const nextChar = () => {
    // Get next character (A-Z for now). You could extend to a-z etc.
    if (currentChar === 'Z') {
      setStatus("You've completed A-Z!");
    } else {
      const nextCode = currentChar.charCodeAt(0) + 1;
      setCurrentChar(String.fromCharCode(nextCode));
      setStatus('');
    }
  };

  if (!user) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <p className="text-gray-600">Please log in to draw your characters.</p>
        <a href="/login" className="btn btn-primary mt-4 inline-block">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="page-title">Draw Your Characters</h2>

      <div className="card">
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">Draw this character:</p>
          <div className="inline-block bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-lg">
            <span className="text-6xl font-bold text-primary-800">{currentChar}</span>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Use your mouse or touch to draw in the box below. When satisfied, click Save and move to the next character.
          </p>
        </div>

        <Canvas char={currentChar} onSave={handleSave} onNext={nextChar} />

        {status && (
          <p className={`text-center mt-4 ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'} font-medium`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default DrawPage;
