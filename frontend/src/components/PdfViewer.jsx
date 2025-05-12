/* src/components/PdfViewer.jsx */ 

import { useState } from 'react';
import usePanZoom from '../utils/usePanZoom';
import PdfPage from './PdfPage';

export default function PdfViewer({
  pages,
  boxes,
  commentMap,
  highlight,
  showAll,
  inactive,
  filterStatus,
}) {
  const [hovered, setHovered] = useState(null);

  const FIXOS = [
    'Baia norte',
    'Baia sul',
    'Torre verde',
    'Torre laranja',
  ];
  const faltantes = FIXOS.filter(
    loc => (commentMap[loc]?.length ?? 0) > 0
      && !boxes.some(b => b.texto === loc),
  );

  const { zoom, pan, onWheel, onMouseDown, onMouseMove, onMouseUp } =
    usePanZoom();

  if (!pages.length) return null;

  return (
    <div className="relative w-full">
      {pages.map(p => (
        <PdfPage
          key={p.page}
          page={p}
          boxes={boxes}
          pan={pan}
          zoom={zoom}
          showAll={showAll}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          hovered={hovered}
          setHovered={setHovered}
          commentMap={commentMap}
          highlight={highlight}
          inactive={inactive}
          filterStatus={filterStatus}
          
        />
      ))}

      {/* Torre verde – top center */}
      {faltantes.includes('Torre verde') && (
        <table
          className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm bg-white rounded-t-2xl overflow-hidden "
        >
          <thead className="bg-gray-100 ">
            <tr>
              <th
                colSpan={commentMap['Torre verde'].length}
                className="p-2 text-center bg-blue-900 text-amber-50 border-1 border-black"
              >
                Torre verde
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {commentMap['Torre verde'].map(ramal => (
                <td key={ramal} className="p-2 text-center border-1 border-black ">
                  {ramal}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      {/* Torre laranja – bottom center */}
      {faltantes.includes('Torre laranja') && (
        <table
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm border bg-white rounded-t-2xl overflow-hidden"
        >
          <thead className="bg-gray-100">
            <tr>
              <th
                colSpan={commentMap['Torre laranja'].length}
                className="p-2 text-center bg-blue-900 text-amber-50 border-1 border-black"
              >
                Torre laranja
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {commentMap['Torre laranja'].map(ramal => (
                <td key={ramal} className="p-2 text-center border-2 border-black">
                  {ramal}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      {/* Baia norte – center left */}
      {faltantes.includes('Baia norte') && (
        <table
          className="absolute top-1/2 left-0 transform -translate-y-1/2 text-sm bg-white rounded-t-2xl overflow-hidden"
        >
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-center bg-blue-900 text-amber-50 border-1 border-black">Baia norte</th>
            </tr>
          </thead>
          <tbody>
            {commentMap['Baia norte'].map(r => (
              <tr key={r}>
                <td className="p-2 text-center border-1 border-black">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Baia sul – center right */}
      {faltantes.includes('Baia sul') && (
        <table
          className="absolute top-1/2 right-0 transform -translate-y-1/2 text-sm border bg-white rounded-t-2xl overflow-hidden"
        >
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-center bg-blue-900 text-amber-50 border-1 border-black">Baia sul</th>
            </tr>
          </thead>
          <tbody>
            {commentMap['Baia sul'].map(r => (
              <tr key={r}>
                <td className="p-2 text-center border-2 border-black">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
