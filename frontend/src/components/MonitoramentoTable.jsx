import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
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
  const [historico, setHistorico] = useState([])
  const [showHistorico, setShowHistorico] = useState(false)
  const [selectedDn, setSelectedDn] = useState(null)
  const isMobile = useMobile()
  const [portalContainer, setPortalContainer] = useState(null)

  useEffect(() => {
    // Criar elemento para o portal
    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.left = '0'
    el.style.top = '0'
    el.style.width = '100%'
    el.style.height = '100%'
    el.style.pointerEvents = 'none' // Mantém none aqui
    el.style.zIndex = '1000'
    document.body.appendChild(el)
    setPortalContainer(el)

    return () => document.body.removeChild(el)
  }, [])

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

  // Adicionar event listener para a tecla Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowHistorico(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const fetchHistorico = async (dn) => {
    try {
      console.log("Buscando histórico para ramal:", dn)
      const res = await fetch(`/api/historico/${dn}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log("Dados recebidos:", data)
      
      if (!Array.isArray(data?.historico)) {
        throw new Error("Formato de dados inválido")
      }

      setHistorico(data.historico)
      setShowHistorico(true)
      setSelectedDn(dn)
    } catch (err) {
      console.error("Erro ao carregar histórico:", err)
      alert("Erro ao carregar histórico. Por favor, tente novamente.")
    }
  }

  const handleCloseHistorico = (e) => {
    if (e.target === e.currentTarget) {
      setShowHistorico(false)
    }
  }

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

      {showHistorico && portalContainer && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            zIndex: 1001,
            pointerEvents: 'auto' // Habilita interações aqui
          }}
          onClick={handleCloseHistorico}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div 
            className="bg-white p-4 rounded-lg w-96 max-w-[90%] relative z-[1002]" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Histórico do Ramal {selectedDn}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowHistorico(false)
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold px-2 py-1"
              >
                ×
              </button>
            </div>
            <div className="max-h-64 overflow-auto">
              {historico.map((data, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                  {formatHorario(data)}
                </div>
              ))}
              {historico.length === 0 && (
                <p className="text-gray-500">Nenhum registro encontrado</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowHistorico(false)
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        portalContainer
      )}

      {menu.visible && portalContainer && createPortal(
        <div
          className="fixed bg-white border shadow-lg p-2 rounded"
          style={{
            position: 'fixed',
            top: menu.y,
            left: menu.x,
            maxWidth: isMobile ? "80vw" : "auto",
            zIndex: 1001,
            pointerEvents: 'auto' // Habilita interações aqui
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
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenu((prev) => ({ ...prev, editing: true }))
                }}
                className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600"
              >
                Editar Anotação
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchHistorico(menu.dn)
                  setMenu((prev) => ({ ...prev, visible: false }))
                }}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Ver Histórico
              </button>
            </div>
          )}
        </div>,
        portalContainer
      )}
    </div>
  )
}
