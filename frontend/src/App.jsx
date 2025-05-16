"use client"

// src/App.jsx
import { useState, useEffect } from "react"
import { PDFS } from "./constants"
import useSubscribers from "./hooks/useSubscribers"
import useCoords from "./hooks/useCoords"
import useRamais from "./hooks/useRamais"
import useMonitoramento from "./hooks/useMonitoramento"
import useMobile from "./hooks/useMobile"

import SelectPdf from "./components/SelectPdf"
import SearchRamal from "./components/SearchRamal"
import PdfViewer from "./components/PdfViewer"
import MonitoramentoTable from "./components/MonitoramentoTable"

import * as pdfjs from "pdfjs-dist"
import { GlobalWorkerOptions } from "pdfjs-dist"
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { Menu, X } from "lucide-react"

GlobalWorkerOptions.workerSrc = workerSrc

export default function App() {
  const [selPdf, setSelPdf] = useState("")
  const [pages, setPages] = useState([])
  const [highlight, setHighlight] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [filterStatus, setFilterStatus] = useState("todos")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isMobile = useMobile()

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  const andar = PDFS.find((p) => p.url === selPdf)?.nome ?? ""

  const commentMap = useSubscribers(andar)
  const boxes = useCoords(selPdf)
  const ramais = useRamais()
  const mon = useMonitoramento()
  const inactive = new Set(mon.map((x) => x["dir nb"]))

  useEffect(() => {
    if (!selPdf) {
      setPages([])
      return
    }
    ;(async () => {
      const buf = await fetch(selPdf).then((r) => r.arrayBuffer())
      const pdf = await pdfjs.getDocument({ data: buf }).promise

      // Calculate viewport size based on current screen dimensions
      const vw = window.innerWidth * (isMobile ? 0.95 : 0.8)
      const vh = window.innerHeight * (isMobile ? 0.7 : 0.9)
      const QUALITY = 4

      const rendered = await Promise.all(
        [...Array(pdf.numPages).keys()].map(async (i) => {
          const pg = await pdf.getPage(i + 1)
          const base = pg.getViewport({ scale: 1 })
          const disp = Math.min(1, vw / base.width, vh / base.height)
          const view = pg.getViewport({ scale: disp * QUALITY })

          const canvas = Object.assign(document.createElement("canvas"), { width: view.width, height: view.height })
          await pg.render({ canvasContext: canvas.getContext("2d"), viewport: view }).promise

          return {
            src: canvas.toDataURL("image/png"),
            w: view.width / QUALITY,
            h: view.height / QUALITY,
            baseW: base.width,
            baseH: base.height,
            page: i + 1,
          }
        }),
      )
      setPages(rendered)
    })()
  }, [selPdf, isMobile])

  useEffect(() => setShowAll(false), [selPdf])

  // Close sidebar when a ramal is selected on mobile
  const handleRamalSelect = (data) => {
    const { andar, comment } = data
    const hit = PDFS.find((p) => p.nome === andar)
    if (hit) {
      setSelPdf(hit.url)
      setHighlight(comment)
      if (isMobile) {
        setSidebarOpen(false)
      }
    }
  }

  return (
    <main className="flex flex-col md:flex-row h-screen select-none relative">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-2 left-2 z-50 bg-blue-900 text-white p-2 rounded-full shadow-lg"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                   md:translate-x-0 transition-transform duration-300 ease-in-out
                   w-full md:w-1/4 lg:w-1/5 h-full p-2 border-r overflow-auto
                   fixed md:relative z-40 bg-white md:bg-transparent`}
      >
        <h1 className="text-white font-bold text-center uppercase text-sm rounded-t-lg bg-blue-900 border-gray-300 py-1">
          Mapa de ramais
        </h1>
        <div className="bg-blue-900 space-y-3 p-2 rounded-b-lg">
          <SelectPdf
            value={selPdf}
            onChange={(url) => {
              setSelPdf(url)
              setHighlight("")
            }}
          />
          <SearchRamal data={ramais} inactive={inactive} onSelect={handleRamalSelect} />
          {/* filtro de status */}
          <div className="flex justify-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-[80%] border px-2 py-1 rounded bg-white text-black"
            >
              <option value="todos">Ativos/Inativos</option>
              <option value="ativos">Apenas ativos</option>
              <option value="inativos">Apenas inativos</option>
            </select>
          </div>
          {pages.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="w-4/5 px-2 py-1 mb-3 bg-white text-black rounded border-black border hover:bg-gray-100"
              >
                {showAll ? "Ocultar pop-overs" : "Mostrar todos"}
              </button>
            </div>
          )}
        </div>
        <div className="mt-6">
          <MonitoramentoTable data={mon} ramais={ramais} onSelect={handleRamalSelect} />
        </div>
      </aside>

      {/* Main content */}
      <section
        className={`w-full md:w-3/4 lg:w-4/5 h-full overflow-auto p-2 md:p-4 bg-gray-50 ${sidebarOpen && isMobile ? "opacity-30" : "opacity-100"}`}
      >
        {pages.length > 0 ? (
          <PdfViewer
            pages={pages}
            boxes={boxes}
            commentMap={commentMap}
            highlight={highlight}
            showAll={showAll}
            inactive={inactive}
            filterStatus={filterStatus}
          />
        ) : (
          <div className="text-gray-600 text-center mt-12">Selecione um mapa para visualizar</div>
        )}
      </section>

      {/* Logo */}
      <img src="/VSlogo_small.png" alt="VS Logo" className="absolute bottom-4 right-4 w-8 md:w-12 h-auto opacity-100" />
    </main>
  )
}
