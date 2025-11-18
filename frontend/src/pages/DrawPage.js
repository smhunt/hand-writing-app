import React, { useState } from 'react';
import Canvas from '../components/Canvas';

function DrawPage({ user }) {
  const [currentChar, setCurrentChar] = useState(null);
  const [status, setStatus] = useState('');
  const [completedChars, setCompletedChars] = useState(new Set());

  // Available characters to draw
  const characterSets = {
    'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'a-z': 'abcdefghijklmnopqrstuvwxyz'.split(''),
    '0-9': '0123456789'.split(''),
    'Symbols': '.,!?;:\'"()-'.split('')
  };

  const allCharacters = Object.values(characterSets).flat();

  // Fetch profile to determine next character to draw
  React.useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const completed = new Set(data.letters || []);
        setCompletedChars(completed);

        // Find first incomplete character
        const nextIncomplete = allCharacters.find(char => !completed.has(char));
        setCurrentChar(nextIncomplete || 'A');
      } else {
        setCurrentChar('A');
      }
    }

    if (user) {
      fetchProfile();
    }
  }, [user]);

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

      // Mark as completed
      setCompletedChars(prev => new Set([...prev, char]));
      setStatus(`✅ Character ${char} saved successfully!`);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const nextChar = () => {
    // Find next incomplete character
    const currentIndex = allCharacters.indexOf(currentChar);
    const remaining = allCharacters.slice(currentIndex + 1).find(char => !completedChars.has(char));

    if (remaining) {
      setCurrentChar(remaining);
      setStatus('');
    } else {
      // Look from the beginning
      const fromStart = allCharacters.find(char => !completedChars.has(char));
      if (fromStart) {
        setCurrentChar(fromStart);
        setStatus('');
      } else {
        setStatus("🎉 You've completed all characters! Great job!");
      }
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

  if (!currentChar) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title mb-0">Draw Your Characters</h2>
        <a href="/profile" className="btn btn-secondary text-sm">
          📊 View Progress
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Draw characters here to create a custom font! Your drawings are saved as vectors and will work in the final font file.
          Check your progress tracker on the Profile page to see which characters you've completed.
        </p>
      </div>

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

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Or jump to a specific character:</h3>
        {Object.entries(characterSets).map(([setName, chars]) => (
          <div key={setName} className="mb-4 last:mb-0">
            <h4 className="text-sm font-medium text-gray-600 mb-2">{setName}</h4>
            <div className="flex flex-wrap gap-2">
              {chars.map(char => (
                <button
                  key={char}
                  onClick={() => {
                    setCurrentChar(char);
                    setStatus('');
                  }}
                  className={`
                    w-10 h-10 rounded-lg border-2 font-medium transition-all
                    ${currentChar === char
                      ? 'bg-primary-600 text-white border-primary-600 scale-110'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    }
                  `}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DrawPage;
