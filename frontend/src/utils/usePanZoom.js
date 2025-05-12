import { useState, useRef, useCallback } from 'react';
import { ZOOM_MIN, ZOOM_MAX } from '../constants';

export default function usePanZoom() {
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });

  /* wheel → zoom -------------------------------------------------------- */
  const onWheel = useCallback(e => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z * f).toFixed(2))));
  }, []);

  /* pan ----------------------------------------------------------------- */
  const dragging  = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const onMouseDown = e => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    e.preventDefault();
  };
  const onMouseMove = e => {
    if (!dragging.current) return;
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = () => (dragging.current = false);

  return { zoom, pan, onWheel, onMouseDown, onMouseMove, onMouseUp };
}
