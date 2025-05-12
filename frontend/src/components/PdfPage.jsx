import { useState, useRef, useEffect } from 'react';
import { OFFSET } from '../constants';

const EXPAND = 5;

function toCanvas(b, p) {
  const pctX = (b.x0 / p.baseW) * 100;
  const pctY = (b.y0 / p.baseH) * 100;
  const pctW = ((b.x1 - b.x0) / p.baseW) * 100;
  const pctH = ((b.y1 - b.y0) / p.baseH) * 100;
  return {
    left:   `calc(${pctX}% + ${OFFSET.x - EXPAND}px)`,
    top:    `calc(${pctY}% + ${OFFSET.y - EXPAND}px)`,
    width:  `calc(${pctW}% + ${EXPAND * 2}px)`,
    height: `calc(${pctH}% + ${EXPAND * 2}px)`,
  };
}

export default function PdfPage({
  page, boxes, pan, zoom,
  onWheel, onMouseDown, onMouseMove, onMouseUp,
  showAll, hovered, setHovered,
  commentMap, highlight, inactive, filterStatus
}) {
  const [topIdx, setTopIdx] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex items-center justify-center overflow-hidden border border-black overscroll-contain bg-gray-200"
      style={{ width: '100%', maxHeight: '95vh' }}
    >
      <div
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        role="presentation"
        className="relative border border-gray-300 rounded shadow cursor-grab"
        style={{
          width: page.w,
          height: page.h,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <img src={page.src} alt="" className="pointer-events-none w-full h-full" />

        {boxes.filter(b => (b.page || 1) === page.page).map((b, idx) => {
          const style = { ...toCanvas(b, page), position: 'absolute', cursor: 'pointer', boxSizing: 'border-box', zIndex: highlight === b.texto ? 10 : (topIdx === idx ? 5 : 1) };
          const lista = commentMap[b.texto] || [];
          const listaFiltered = lista.filter(ramal =>
            filterStatus === 'todos' ||
            (filterStatus === 'ativos' && !inactive.has(ramal)) ||
            (filterStatus === 'inativos' && inactive.has(ramal))
          );

          const show =
            listaFiltered.length > 0 &&
            ( showAll || highlight === b.texto ||
              (hovered && hovered.page === page.page && hovered.left === style.left && hovered.top === style.top)
            );

          return (
            <span
              key={idx}
              onMouseEnter={() => { if (showAll) setTopIdx(idx); else setHovered({ ...style, lista: listaFiltered, page: page.page }); }}
              onMouseLeave={() => { if (!showAll) setHovered(null); }}
              style={style}
            >
              {show && (
                <div
                  className="absolute left-[10px] -top-[25px] rounded border bg-white px-2 py-1 text-xs shadow z-50"
                  style={{ pointerEvents: 'auto' }}
                >
                  {listaFiltered.map(ramal => (
                    <div key={ramal} className="flex items-center gap-1">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: inactive.has(ramal) ? '#dc2626' : '#16a34a' }}
                      />
                      {ramal}
                    </div>
                  ))}
                </div>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}