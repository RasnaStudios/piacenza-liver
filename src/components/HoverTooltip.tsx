import { useState, useEffect } from 'react'
import { Box, Text } from '@mantine/core'
import { liverGods, liverGroups } from '../data/liverData'

interface HoverTooltipProps {
  hoveredSection: any;
}

export function HoverTooltip({ hoveredSection }: HoverTooltipProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.innerWidth <= 768
      setIsMobile(isMobileDevice)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (hoveredSection && !isMobile) {
      document.addEventListener('mousemove', updateMousePosition)
    }

    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
    }
  }, [hoveredSection, isMobile])

  // Hide tooltip on mobile devices
  if (!hoveredSection || isMobile) return null

  // Get the gods for this inscription
  const gods = hoveredSection.gods?.map((godId: string) => (liverGods as any)[godId]).filter(Boolean) || []
  const group = (liverGroups as any)[hoveredSection.groupId]
  
  // Create display names
  const deityNames = gods.map((god: any) => god.name).join(' + ')
  const romanEquivalents = gods.map((god: any) => god.romanEquivalent).filter(Boolean)

  return (
    <Box
      style={{
        position: 'fixed',
        left: mousePosition.x + 15,
        top: mousePosition.y - 30,
        background: 'rgba(42, 33, 17, 0.95)',
        color: '#f4e4a6',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #8b6541',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '14px',
        pointerEvents: 'none',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        maxWidth: '250px',
        opacity: 0,
        transform: 'translateY(10px)',
        animation: 'tooltipFadeIn 0.2s ease-out forwards',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#d4af37',
            letterSpacing: '0.5px',
          }}
        >
          {deityNames || `Section ${hoveredSection.id}`}
          {romanEquivalents.length > 0 && (
            <Text
              component="span"
              style={{
                fontWeight: 'normal',
                color: '#b8860b',
                fontSize: '12px',
                marginLeft: '4px',
              }}
            >
              ({romanEquivalents.join(', ')})
            </Text>
          )}
        </Text>
        <Text
          style={{
            fontFamily: 'Noto Sans Old Italic, Aegean, serif',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ffd700',
            direction: 'rtl',
            unicodeBidi: 'embed',
            letterSpacing: '1px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            padding: '2px 0',
          }}
        >
          {hoveredSection.etruscanText}
        </Text>
        <Text
          style={{
            fontSize: '12px',
            opacity: 0.9,
            lineHeight: 1.3,
            color: '#c9a876',
          }}
        >
          {group?.name} • {hoveredSection.divinationMeaning}
        </Text>
      </Box>
    </Box>
  )
} 