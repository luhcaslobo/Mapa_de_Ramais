// src/hooks/useCoords.js
import { useEffect, useState } from 'react';
import { PDFS } from '../constants';          // ← já contém { nome, url }

export default function useCoords(pdfUrl) {
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    if (!pdfUrl) { setBoxes([]); return; }

    // pelo url selecionado descobre o nome “andar-01”
    const nome = PDFS.find(p => p.url === pdfUrl)?.nome;
    if (!nome) { setBoxes([]); return; }

    const jsonUrl = `/coords/${nome}.json?ts=${Date.now()}`; // cache-buster opcional

    (async () => {
      try {
        const resp = await fetch(jsonUrl);
        if (!resp.ok) {
          console.error('GET', jsonUrl, resp.status);
          setBoxes([]);
          return;
        }
        const raw = await resp.json();

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
