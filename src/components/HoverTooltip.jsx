import { useState, useEffect } from 'react'
import { loadDeityContent } from '../utils/deityLoader'
import './HoverTooltip.css'

export function HoverTooltip({ hoveredSection }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [deityData, setDeityData] = useState(null)

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (hoveredSection) {
      document.addEventListener('mousemove', updateMousePosition)
      
      // Load deity data for short description
      if (hoveredSection.docFile) {
        loadDeityContent(hoveredSection.docFile)
          .then(data => setDeityData(data))
          .catch(() => setDeityData(null))
      }
    } else {
      setDeityData(null)
    }

    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
    }
  }, [hoveredSection])

  if (!hoveredSection) return null

  return (
    <div
      className="hover-tooltip"
      style={{
        left: mousePosition.x + 15,
        top: mousePosition.y - 30,
      }}
    >
      <div className="tooltip-content">
        <div className="deity-name">
          {deityData?.name || hoveredSection.name}
          {deityData?.romanEquivalent && (
            <span className="roman-name"> ({deityData.romanEquivalent})</span>
          )}
        </div>
        <div className="deity-description">
          {deityData?.shortDescription || hoveredSection.description}
        </div>
      </div>
    </div>
  )
} 