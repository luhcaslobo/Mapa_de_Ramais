

/* src/components/PdfViewer.jsx */

import { useState } from "react"
import usePanZoom from "../utils/usePanZoom"
import PdfPage from "./PdfPage"
import useMobile from "../hooks/useMobile"

export default function PdfViewer({ pages, boxes, commentMap, highlight, showAll, inactive, filterStatus }) {
  const [hovered, setHovered] = useState(null)
  const isMobile = useMobile()

  const FIXOS = ["Baia norte", "Baia sul", "Torre verde", "Torre laranja"]
  const faltantes = FIXOS.filter((loc) => (commentMap[loc]?.length ?? 0) > 0 && !boxes.some((b) => b.texto === loc))

  const {
    zoom,
    pan,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isTouchDevice,
  } = usePanZoom()

  if (!pages.length) return null

  return (
    <div className="relative w-full">
      {pages.map((p) => (
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
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          isTouchDevice={isTouchDevice}
          hovered={hovered}
          setHovered={setHovered}
          commentMap={commentMap}
          highlight={highlight}
          inactive={inactive}
          filterStatus={filterStatus}
        />
      ))}

      {/* Torre verde – top center */}
      {faltantes.includes("Torre verde") && (
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-auto max-w-full ${isMobile ? "scale-75 origin-top" : ""}`}
        >
          <table className="text-xs md:text-sm bg-white rounded-t-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th
                  colSpan={commentMap["Torre verde"].length}
                  className="p-1 md:p-2 text-center bg-blue-900 text-amber-50 border-1 border-black"
                >
                  Torre verde
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {commentMap["Torre verde"].map((ramal) => (
                  <td key={ramal} className="p-1 md:p-2 text-center border-1 border-black">
                    {ramal}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Torre laranja – bottom center */}
      {faltantes.includes("Torre laranja") && (
        <div
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-auto max-w-full ${isMobile ? "scale-75 origin-bottom" : ""}`}
        >
          <table className="text-xs md:text-sm bg-white rounded-t-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th
                  colSpan={commentMap["Torre laranja"].length}
                  className="p-1 md:p-2 text-center bg-blue-900 text-amber-50 border-1 border-black"
                >
                  Torre laranja
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {commentMap["Torre laranja"].map((ramal) => (
                  <td key={ramal} className="p-1 md:p-2 text-center border-1 border-black">
                    {ramal}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Baia norte – center left */}
      {faltantes.includes("Baia norte") && (
        <div className={`absolute top-1/2 left-0 transform -translate-y-1/2 ${isMobile ? "scale-75 origin-left" : ""}`}>
          <table className="text-xs md:text-sm bg-white rounded-t-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-1 md:p-2 text-center bg-blue-900 text-amber-50 border-1 border-black">Baia norte</th>
              </tr>
            </thead>
            <tbody>
              {commentMap["Baia norte"].map((r) => (
                <tr key={r}>
                  <td className="p-1 md:p-2 text-center border-1 border-black">{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Baia sul – center right */}
      {faltantes.includes("Baia sul") && (
        <div
          className={`absolute top-1/2 right-0 transform -translate-y-1/2 ${isMobile ? "scale-75 origin-right" : ""}`}
        >
          <table className="text-xs md:text-sm bg-white rounded-t-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-1 md:p-2 text-center bg-blue-900 text-amber-50 border-1 border-black">Baia sul</th>
              </tr>
            </thead>
            <tbody>
              {commentMap["Baia sul"].map((r) => (
                <tr key={r}>
                  <td className="p-1 md:p-2 text-center border-1 border-black">{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile zoom controls */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-30">
          <button
            onClick={() => onWheel({ preventDefault: () => {}, deltaY: -1 })}
            className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => onWheel({ preventDefault: () => {}, deltaY: 1 })}
            className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      )}
    </div>
  )
}
