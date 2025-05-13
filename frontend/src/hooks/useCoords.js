// src/hooks/useCoords.js
import { useEffect, useState } from 'react';

export default function useCoords(pdfUrl) {
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    if (!pdfUrl) { setBoxes([]); return; }

    (async () => {
      try {
        /* baixa o PDF que já foi renderizado */
        const blob = await fetch(pdfUrl).then(r => {
          if (!r.ok) throw new Error(`GET ${pdfUrl} → ${r.status}`);
          return r.blob();
        });

        /* manda ao backend */
        const fd = new FormData();
        fd.append('pdf', new File([blob], 'tmp.pdf', { type: 'application/pdf' }));

        const resp = await fetch('/coords', { method: 'POST', body: fd });
        if (!resp.ok) {
          console.error('/coords', resp.status, await resp.text());
          setBoxes([]);
          return;
        }
        const raw = await resp.json();

        /* normaliza texto: “01”-“09” → “1”-“9” (mas NÃO descarta 1-9) */
        const clean = raw.map(c => ({
          ...c,
          texto: c.texto.replace(/^0([1-9])$/, '$1'),
        }));

        console.log('coords recebidos:', clean.length);
        setBoxes(clean);
      } catch (err) {
        console.error('useCoords erro:', err);
        setBoxes([]);
      }
    })();
  }, [pdfUrl]);

  return boxes;
}
