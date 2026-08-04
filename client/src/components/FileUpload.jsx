import { useRef, useState } from 'react';
import { extractTextFromFile, fetchDemoFile, ACCEPTED_FILE_TYPES } from '../utils/fileExtract.js';

/**
 * Props:
 * - onExtracted(text, meta)   called with extracted text once a file (or demo) is processed
 * - demos: [{ label, path, name, type, icon }]   optional list of demo files to try
 * - hint: string  short helper text under the dropzone
 */
export default function FileUpload({ onExtracted, demos = [], hint }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    setError('');
    setStatus('Preparing…');
    try {
      const { text, kind } = await extractTextFromFile(file, {
        onProgress: (s) => setStatus(s),
      });
      if (!text || !text.trim()) {
        throw new Error('No readable text was found in that file.');
      }
      onExtracted(text, { kind, fileName: file.name });
      setStatus(`Extracted from ${file.name} ✓`);
    } catch (e) {
      setError(e.message || 'Could not read that file.');
      setStatus('');
    } finally {
      setBusy(false);
    }
  }

  async function handleDemo(demo) {
    setBusy(true);
    setError('');
    setStatus(`Loading ${demo.label}…`);
    try {
      const file = await fetchDemoFile(demo.path, demo.name, demo.type);
      await handleFile(file);
    } catch (e) {
      setError(e.message || 'Could not load demo file.');
      setBusy(false);
      setStatus('');
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-4 text-center transition
          ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-brand-200 bg-white/60 hover:bg-brand-50'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <div className="text-sm font-semibold text-brand-700">
          📎 {busy ? 'Processing…' : 'Upload CSV, PDF, or Image'}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {hint || 'Drag & drop a file here, or click to browse'}
        </div>
      </div>

      {(status || error) && (
        <div className={`text-xs ${error ? 'text-rose-600' : 'text-brand-700'}`}>
          {error ? `⚠️ ${error}` : status}
        </div>
      )}

      {demos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {demos.map((d) => (
            <button
              key={d.label}
              type="button"
              disabled={busy}
              onClick={() => handleDemo(d)}
              className="text-xs text-brand-800 bg-brand-50 hover:bg-brand-100 ring-1 ring-brand-100 rounded-full px-3 py-1.5 transition disabled:opacity-50"
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
