"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ZOOM_MIN, ZOOM_MAX } from "../constants"

export default function usePanZoom() {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Check if touch is available
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  /* wheel → zoom -------------------------------------------------------- */
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const f = e.deltaY < 0 ? 1.1 : 0.9
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z * f).toFixed(2))))
  }, [])

  /* pan ----------------------------------------------------------------- */
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })

  const onMouseDown = (e) => {
    dragging.current = true
    dragStart.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX),
      y: e.clientY || (e.touches && e.touches[0].clientY),
      px: pan.x,
      py: pan.y,
    }
    e.preventDefault()
  }

  const onMouseMove = (e) => {
    if (!dragging.current) return
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    setPan({
      x: dragStart.current.px + (clientX - dragStart.current.x),
      y: dragStart.current.py + (clientY - dragStart.current.y),
    })
  }

  const onMouseUp = () => (dragging.current = false)

  // Touch events for pinch zoom
  const lastTouchDistance = useRef(null)

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Store the initial distance between two fingers for pinch-zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy)
    } else if (e.touches.length === 1) {
      // Single touch for panning
      onMouseDown(e)
    }
  }

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      // Calculate new distance for pinch-zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const newDistance = Math.sqrt(dx * dx + dy * dy)

      // Calculate zoom factor based on the change in distance
      const factor = newDistance / lastTouchDistance.current
      lastTouchDistance.current = newDistance

      // Apply zoom with constraints
      setZoom((z) => {
        const newZoom = z * factor
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +newZoom.toFixed(2)))
      })
    } else if (e.touches.length === 1) {
      // Single touch for panning
      onMouseMove(e)
    }
  }

  const onTouchEnd = () => {
    lastTouchDistance.current = null
    dragging.current = false
  }

  return {
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
  }
}
