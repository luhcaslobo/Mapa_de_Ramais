import { useEffect, useState } from 'react';

export default function useCoords(pdfUrl) {
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    if (!pdfUrl) return;
    (async () => {
      const blob = await fetch(pdfUrl).then(r => r.blob());
      const fd   = new FormData();
      fd.append('pdf', new File([blob], 'tmp.pdf', { type: 'application/pdf' }));

      const raw = await fetch('/coords', { method: 'POST', body: fd })
                 .then(r => r.json());

      const clean = raw
        
        .map(c => ({ ...c, texto: c.texto.replace(/^0([1-9])$/, '$1') }));

      setBoxes(clean);
    })();
  }, [pdfUrl]);

  return boxes;
}
