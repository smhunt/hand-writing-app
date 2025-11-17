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
      <div className="page">
        <p>Please log in to draw your characters.</p>
      </div>
    );
  }

  return (
    <div className="page DrawPage">
      <h2>Draw Your Characters</h2>
      <p>Draw the character "<strong>{currentChar}</strong>" in the box below with your mouse or touch. When you are satisfied, click Save. Then proceed to the next character.</p>

      <Canvas char={currentChar} onSave={handleSave} onNext={nextChar} />

      {status && <p>{status}</p>}
    </div>
  );
}

export default DrawPage;
