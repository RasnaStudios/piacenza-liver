import { useState, useEffect } from 'react'
import { liverGods, liverGroups } from '../data/liverData'
import './HoverTooltip.css'

export function HoverTooltip({ hoveredSection }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (hoveredSection) {
      document.addEventListener('mousemove', updateMousePosition)
    }

    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
    }
  }, [hoveredSection])

  if (!hoveredSection) return null

  // Get the gods for this inscription
  const gods = hoveredSection.gods?.map(godId => liverGods[godId]).filter(Boolean) || []
  const group = liverGroups[hoveredSection.groupId]
  
  // Create display names
  const deityNames = gods.map(god => god.name).join(' + ')
  const romanEquivalents = gods.map(god => god.romanEquivalent).filter(Boolean)

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
          {deityNames || `Section ${hoveredSection.id}`}
          {romanEquivalents.length > 0 && (
            <span className="roman-name"> ({romanEquivalents.join(', ')})</span>
          )}
        </div>
        <div className="etruscan-text">
          {hoveredSection.etruscanText}
        </div>
        <div className="deity-description">
          {group?.name} • {hoveredSection.divinationMeaning}
        </div>
      </div>
    </div>
  )
} 