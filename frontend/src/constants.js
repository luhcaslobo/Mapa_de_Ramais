export const QUALITY   = 4;           // oversampling
export const OFFSET    = { x: 0, y: 0 };
export const ZOOM_MIN  = 0.8;
export const ZOOM_MAX  = 3;

/* PDFs disponíveis */
export const PDFS = Object.entries(
  import.meta.glob('/src/assets/andares/*.pdf', {
    eager:  true,
    import: 'default',
    query:  '?url',
  }),
).map(([p, u]) => ({
  nome: p.split('/').pop().replace(/\.pdf$/i, ''),
  url:  u,
}));
