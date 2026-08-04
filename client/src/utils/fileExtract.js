import * as pdfjsLib from 'pdfjs-dist';

// Point pdf.js at its worker via CDN, matched to the installed version.
// This avoids bundler-specific worker-path issues across Vite versions.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const ACCEPTED_FILE_TYPES = '.csv,.txt,.pdf,image/*,.png,.jpg,.jpeg,.webp';

/**
 * Extracts plain text from a File object, auto-detecting the format:
 * - .csv / .txt          -> read as raw text
 * - .pdf                 -> extract embedded text via pdf.js
 * - images (png/jpg/etc) -> OCR via tesseract.js
 *
 * Returns { text, kind } where kind is 'csv' | 'pdf' | 'image' | 'text'.
 */
export async function extractTextFromFile(file, { onProgress } = {}) {
  const name = (file.name || '').toLowerCase();
  const type = file.type || '';

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    onProgress?.('Reading PDF…');
    const text = await extractPdfText(file, onProgress);
    return { text, kind: 'pdf' };
  }

  if (type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/.test(name)) {
    onProgress?.('Running OCR on image…');
    const text = await extractImageText(file, onProgress);
    return { text, kind: 'image' };
  }

  // CSV / TXT / anything else text-ish
  onProgress?.('Reading file…');
  const text = await file.text();
  return { text, kind: name.endsWith('.csv') ? 'csv' : 'text' };
}

async function extractPdfText(file, onProgress) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Reading PDF page ${i}/${pdf.numPages}…`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => ('str' in it ? it.str : ''));
    pages.push(strings.join(' '));
  }
  return pages.join('\n').trim();
}

async function extractImageText(file, onProgress) {
  const Tesseract = await import('tesseract.js');
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status && typeof m.progress === 'number') {
        onProgress?.(`${m.status} (${Math.round(m.progress * 100)}%)`);
      }
    },
  });
  return (data?.text || '').trim();
}

/**
 * Fetches a demo file shipped in /public/demo and turns it into a File
 * object so it can go through the exact same extraction pipeline as a
 * user upload — this keeps the demo path and the real path identical.
 */
export async function fetchDemoFile(path, name, mimeType) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load demo file: ${path}`);
  const blob = await res.blob();
  return new File([blob], name, { type: mimeType || blob.type });
}
