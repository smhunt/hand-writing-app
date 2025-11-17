import React, { useState } from 'react';

function ComposePage({ user }) {
  const [text, setText] = useState('');
  const [paperSize, setPaperSize] = useState('Letter');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!text) {
      return;
    }

    setStatus('Generating PDF...');
    setPdfUrl(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, paperSize })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await res.blob();

      // Create a blob URL for the PDF and open it or set for download
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStatus('PDF generated.');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <p className="text-gray-600">Please log in to compose a note.</p>
        <a href="/login" className="btn btn-primary mt-4 inline-block">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="page-title">Compose a Handwritten Note</h2>

      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="label">Your Message</label>
            <textarea
              rows="8"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message here..."
              className="input resize-none font-mono"
            />
            <p className="text-sm text-gray-500 mt-1">
              {text.length} characters
            </p>
          </div>

          <div>
            <label className="label">Paper Size</label>
            <select
              value={paperSize}
              onChange={e => setPaperSize(e.target.value)}
              className="input"
            >
              <option value="Letter">Letter (8.5" × 11")</option>
              <option value="A4">A4 (210mm × 297mm)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            className="btn btn-primary w-full"
            disabled={!text}
          >
            ✨ Generate PDF
          </button>

          {status && (
            <p className={`text-sm text-center ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {status}
            </p>
          )}
        </div>
      </div>

      {pdfUrl && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Preview & Download</h3>
          <div className="bg-gray-100 rounded-lg p-4">
            <iframe
              title="PDF Preview"
              src={pdfUrl}
              className="w-full h-[600px] border-0 rounded"
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href={pdfUrl}
              download="handwritten_note.pdf"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              📥 Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComposePage;
