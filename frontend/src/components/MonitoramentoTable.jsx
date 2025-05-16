

import { useState, useEffect } from "react"
import subscribers from "/src/assets/pabx/subscribers.json"
import useMobile from "../hooks/useMobile"

// formata horário para dd/mm/yy hh:mm
function formatHorario(timestamp) {
  const d = new Date(timestamp)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yy} ${hh}:${min}`
}

export default function MonitoramentoTable({ data, ramais, onSelect }) {
  const [annotations, setAnnotations] = useState({})
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, dn: null, editing: false })
  const [tempText, setTempText] = useState("")
  const isMobile = useMobile()

  useEffect(() => {
    fetch("/api/annotations")
      .then((res) => res.json())
      .then((json) => setAnnotations(json))
      .catch((err) => console.error("Erro ao carregar anotações", err))
  }, [])

  // Fecha o menu ao clicar em qualquer lugar fora
  useEffect(() => {
    function handleClickOutside() {
      if (menu.visible) {
        setMenu((prev) => ({ ...prev, visible: false, editing: false }))
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [menu.visible])

  if (!data?.length) return null

  const nomeByRamal = new Map(subscribers.map((s) => [String(s.Directory_Number), s.Annu_Name ?? ""]))
  const andarByRamal = new Map(subscribers.map((s) => [String(s.Directory_Number), s.Annu_First_Name ?? ""]))
  const portaByRamal = new Map(subscribers.map((s) => [String(s.Directory_Number), s.UTF8_Comment3 ?? ""]))

  const sorted = [...data].sort((a, b) => b["horário"].localeCompare(a["horário"]))

  const handleContextMenu = (e, dn) => {
    e.preventDefault()
    e.stopPropagation()
    setTempText(annotations[dn] || "")

    // Adjust position for mobile
    const x = isMobile ? Math.min(e.clientX, window.innerWidth - 200) : e.clientX
    const y = isMobile ? Math.min(e.clientY, window.innerHeight - 150) : e.clientY

    setMenu({ visible: true, x, y, dn, editing: false })
  }

  const handleSave = async () => {
    try {
      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directoryNumber: menu.dn, text: tempText }),
      })
      if (!res.ok) throw new Error("Resposta não OK")
      setAnnotations((prev) => ({ ...prev, [menu.dn]: tempText }))
      setMenu((prev) => ({ ...prev, visible: false, editing: false }))
    } catch (err) {
      console.error("Erro ao salvar anotação", err)
    }
  }

  const handleCancel = () => {
    setMenu((prev) => ({ ...prev, visible: false, editing: false }))
  }

  return (
    <div className="max-h-screen text-xs">
      <h1 className="text-white font-bold text-center uppercase text-sm mb-3 rounded-lg bg-blue-900 py-1">
        Registros de Ramais DOWN
      </h1>

      <div className={isMobile ? "grid grid-cols-1 gap-2" : "space-y-2"}>
        {sorted.map(({ "dir nb": dn, horário }) => {
          const ramalObj = ramais.find((r) => String(r.ramal) === String(dn))
          return (
            <div
              key={dn}
              className="p-2 border rounded shadow-sm cursor-pointer hover:bg-gray-300 whitespace-normal"
              title={annotations[dn] || "Sem anotações"}
              onClick={(e) => {
                e.stopPropagation()
                if (!ramalObj) return
                onSelect(ramalObj)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              onContextMenu={(e) => handleContextMenu(e, dn)}
              onTouchStart={
                isMobile
                  ? (e) => {
                      // Long press detection for mobile
                      const timer = setTimeout(() => {
                        handleContextMenu(e, dn)
                      }, 800)

                      const clearTimer = () => clearTimeout(timer)
                      e.target.addEventListener("touchend", clearTimer, { once: true })
                      e.target.addEventListener("touchmove", clearTimer, { once: true })
                    }
                  : undefined
              }
            >
              <div className="font-semibold">
                Ramal: {dn} - {nomeByRamal.get(String(dn)) || "—"}
              </div>
              <div>
                Andar: {andarByRamal.get(String(dn)) || "—"} - Porta: {portaByRamal.get(String(dn)) || "—"}
              </div>
              <div>Última vez online: {formatHorario(horário)}</div>
            </div>
          )
        })}
      </div>

      {menu.visible && (
        <div
          className="fixed bg-white border shadow p-2 z-50 rounded"
          style={{
            top: menu.y,
            left: menu.x,
            maxWidth: isMobile ? "80vw" : "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.editing ? (
            <>
              <textarea
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                className="border p-2 w-64 h-24 rounded"
                style={{ width: isMobile ? "100%" : "264px" }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancel()
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSave()
                  }}
                  className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-600"
                >
                  Salvar
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenu((prev) => ({ ...prev, editing: true }))
              }}
              className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600"
            >
              Editar Anotação
            </button>
          )}
        </div>
      )}
    </div>
  )
}
