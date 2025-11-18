import React, { useState, useEffect } from 'react';
import Canvas from './Canvas';

function DrawModal({ char, isOpen, onClose, onSave }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Reset status when modal opens with new character
    if (isOpen) {
      setStatus('');
    }
  }, [isOpen, char]);

  const handleSave = async (char, strokes) => {
    try {
      setStatus(`Saving ${char}...`);
      const res = await fetch('/api/save-char', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ char, strokes })
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response. Please refresh and try again.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }

      setStatus(`✅ ${char} saved! Loading next character...`);

      // Notify parent component with saved character
      // Parent will auto-advance to next character
      if (onSave) {
        await onSave(char);
      }

      // Modal stays open - parent will update char prop for next character
      // or close modal if all characters complete
    } catch (err) {
      setStatus('Error: ' + err.message);
      console.error('Save error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-xl font-semibold text-gray-900">
            Draw Character: <span className="text-primary-600 text-3xl ml-2">{char}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Draw your version of <strong>{char}</strong> in the box below. Use your mouse or touch to draw.
          </p>

          <Canvas
            char={char}
            onSave={handleSave}
            onNext={null}
          />

          {status && (
            <p className={`text-center mt-4 text-sm ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'} font-medium`}>
              {status}
            </p>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawModal;
