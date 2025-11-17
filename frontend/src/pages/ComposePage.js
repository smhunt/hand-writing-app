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
      <div className="page">
        <p>Please log in to compose a note.</p>
      </div>
    );
  }

  return (
    <div className="page ComposePage">
      <h2>Compose a Handwritten Note</h2>

      <div>
        <textarea
          rows="5"
          cols="60"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your message here..."
        />
      </div>

      <div>
        <label>Paper Size: </label>
        <select value={paperSize} onChange={e => setPaperSize(e.target.value)}>
          <option value="Letter">Letter (8.5x11)</option>
          <option value="A4">A4 (210x297mm)</option>
        </select>
      </div>

      <button onClick={handleGenerate}>Generate PDF</button>

      {status && <p>{status}</p>}

      {pdfUrl && (
        <div className="preview">
          <iframe title="PDF Preview" src={pdfUrl} width="600" height="800"></iframe>
          <p><a href={pdfUrl} download="handwritten_note.pdf">Download PDF</a></p>
        </div>
      )}
    </div>
  );
}

export default ComposePage;
