import { useEffect, useState } from 'react'
import { 
  Text, 
  Box,
  Anchor
} from '@mantine/core'
import { isMobile } from 'react-device-detect'
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa'
import { SiArtstation } from 'react-icons/si'

interface LegendProps {
  hasInteracted: boolean
}

export function Legend({ hasInteracted }: LegendProps) {
  const [platform, setPlatform] = useState('mac')
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // Mobile drag state
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Auto-open on first load if user hasn't interacted yet
  useEffect(() => {
    setIsOpen(!hasInteracted)
  }, [hasInteracted])


  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) {
      setPlatform('mac')
    } else if (userAgent.includes('win')) {
      setPlatform('windows')
    } else {
      setPlatform('linux')
    }
  }, [])

  const getControlsText = () => {
    const modifier = platform === 'mac' ? '⌘' : 'Alt'
    const shift = '⇧'
    return [
      'Mouse: rotate',
      `${modifier} + mouse: pan`,
      'Scroll: zoom',
      'Double-click: reset view',
      `${shift} + drag: move model`
    ]
  }
  
  const getMobileControlsText = () => {
    return [
      'Touch: rotate',
      'Pinch: zoom', 
      'Double-tap: reset view'
    ]
  }

  const containerStyles = {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    pointerEvents: 'auto' as const,
  }

  const thumbnailStyles = {
    position: 'absolute' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(139, 101, 65, 0.4)',
    borderBottom: 'none',
    borderRadius: '8px 8px 0 0',
    padding: '8px 14px 6px 14px',
    color: 'rgba(196, 168, 118, 0.9)',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.3px',
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
    userSelect: 'none' as const,
    textAlign: 'center' as const,
    minWidth: '200px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
  }

  const legendStyles = isMobile ? {
    // Mobile: full-width bottom panel
    position: 'absolute' as const,
    bottom: isOpen ? 0 : -300,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90vw',
    maxWidth: '460px',
    zIndex: 1,
    color: 'rgba(196, 168, 118, 0.6)',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    lineHeight: 1.3,
    pointerEvents: 'auto' as const,
    userSelect: 'none' as const,
    padding: '14px 18px',
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(139, 101, 65, 0.4)',
    borderRadius: '8px 8px 0 0',
    transition: isDragging ? 'none' : 'bottom 0.3s ease-out, transform 0.2s ease-out, opacity 0.2s ease-out',
    transformOrigin: 'bottom center',
    overflow: 'visible' as const,
  } : {
    // Desktop: bottom center panel
    position: 'absolute' as const,
    bottom: (isOpen || isHovered) ? 0 : -300,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '440px',
    zIndex: 1,
    color: 'rgba(196, 168, 118, 0.6)',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    lineHeight: 1.4,
    pointerEvents: 'auto' as const,
    userSelect: 'none' as const,
    padding: '14px 18px',
    background: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '8px 8px 0 0',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(139, 101, 65, 0.4)',
    transition: 'bottom 0.3s ease-out',
    overflow: 'visible' as const,
  }

  const linkStyles = {
    pointerEvents: 'auto' as const,
    color: 'inherit',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  }


  const githubIconStyles = {
    width: '12px',
    height: '12px',
    fill: 'currentColor',
  }

  return (
    <Box 
      style={containerStyles}
      onDoubleClick={() => setIsOpen((v) => !v)}
    >
      {/* Thumbnail Tab (panel slides over this) */}
      <Box 
        style={thumbnailStyles}
        onClick={() => setIsOpen((v) => !v)}
        onTouchStart={() => setIsOpen((v) => !v)}
        onMouseEnter={(e) => {
          setIsHovered(true)
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)'
          e.currentTarget.style.color = 'rgba(212, 175, 55, 0.95)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)'
          e.currentTarget.style.borderColor = 'rgba(139, 101, 65, 0.4)'
          e.currentTarget.style.color = 'rgba(196, 168, 118, 0.9)'
        }}
      >
        Credits and Controls
      </Box>

      <Box 
        style={{
          ...legendStyles,
          // Apply drag transform only on mobile when dragging
          transform: isMobile
            ? `translate(-50%, ${isOpen ? dragY : 0}px)`
            : 'translateX(-50%)',
          opacity: isMobile && isOpen ? Math.max(0.6, 1 - dragY / 600) : undefined,
        }}
        onMouseLeave={() => { if (!isOpen) setIsHovered(false) }}
        onTouchStart={(e) => {
          if (!isMobile) return
          setIsDragging(true)
          setTouchStartY(e.touches[0].clientY)
          setDragY(0)
        }}
        onTouchMove={(e) => {
          if (!isMobile || !isDragging || touchStartY === null) return
          const currentY = e.touches[0].clientY
          const dy = Math.max(0, currentY - touchStartY)
          setDragY(dy)
        }}
        onTouchEnd={() => {
          if (!isMobile) return
          const threshold = 120
          if (dragY > threshold) {
            setIsOpen(false)
            setIsHovered(false)
          }
          setIsDragging(false)
          setTouchStartY(null)
          setDragY(0)
        }}
      >
      {isMobile && (
        <Box style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 36,
          height: 4,
          borderRadius: 2,
          background: 'rgba(196, 168, 118, 0.35)'
        }} />
      )}
      <Box style={{ 
        display: isMobile ? 'flex' : 'grid',
        gridTemplateColumns: isMobile ? undefined : '1fr 1px minmax(160px, max-content)',
        alignItems: 'flex-start',
        gap: isMobile ? '12px' : '20px',
        flexDirection: isMobile ? 'column' as const : undefined,
      }}>
        {/* Left side: Names */}
        <Box style={{ flex: 1 }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Text component="div" style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>Lorenzo Andraghetti</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Anchor 
                  href="https://linkedin.com/in/andraghetti" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0077b5', fontSize: '14px', textDecoration: 'none' }}
                >
                  <FaLinkedin />
                </Anchor>
                <Anchor 
                href="https://github.com/andraghetti" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#333', fontSize: '14px', textDecoration: 'none' }}
                >
                  <FaGithub />
                </Anchor>
              </div>
              <Text component="span" style={{ 
                color: 'rgba(196, 168, 118, 0.7)', 
                fontSize: isMobile ? '11px' : '12px',
                fontStyle: 'italic'
              }}>
                Developer
              </Text>
            </Text>
            
            <Text component="div" style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>Luca Tampieri</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Anchor 
                  href="https://linkedin.com/in/luca-tampieri" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0077b5', fontSize: '14px', textDecoration: 'none' }}
                >
                  <FaLinkedin />
                </Anchor>
                <Anchor 
                  href="https://www.artstation.com/lukedt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#13aff0', fontSize: '14px', textDecoration: 'none' }}
                >
                  <SiArtstation />
                </Anchor>
                <Anchor 
                  href="https://www.instagram.com/heythereluke/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#e4405f', fontSize: '14px', textDecoration: 'none' }}
                >
                  <FaInstagram />
                </Anchor>
              </div>
              <Text component="span" style={{ 
                color: 'rgba(196, 168, 118, 0.7)', 
                fontSize: isMobile ? '11px' : '12px',
                fontStyle: 'italic'
              }}>
                3D Artist
              </Text>
            </Text>
          </Box>
          
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid rgba(139, 101, 65, 0.3)'
          }}>
            <Anchor 
              href="https://github.com/rasnastudios" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                ...linkStyles,
                color: 'rgba(196, 168, 118, 0.8)',
                fontSize: isMobile ? '11px' : '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(196, 168, 118, 0.8)'
              }}
            >
              Rasna Studios
            </Anchor>
            
            <Anchor 
              href="https://github.com/rasnastudios/piacenza-liver" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                ...linkStyles,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'rgba(196, 168, 118, 0.8)',
                fontSize: isMobile ? '11px' : '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(196, 168, 118, 0.8)'
              }}
            >
              Contribute
              <svg style={githubIconStyles} viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </Anchor>
          </Box>
        </Box>
        
        {/* Vertical separator (desktop only) */}
        {!isMobile && (
          <Box style={{ 
            width: '1px',
            height: '50px',
            backgroundColor: 'rgba(139, 101, 65, 0.4)',
            alignSelf: 'center'
          }} />
        )}

        {/* Right side: Controls */}
        <Box style={{ flexShrink: 0, minWidth: '160px', width: 'max-content' }}>
          <Text style={{
            color: 'rgba(212, 175, 55, 0.9)',
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: 600,
            marginBottom: '4px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px'
          }}>
            Controls
          </Text>
          
          {(isMobile ? getMobileControlsText() : getControlsText()).map((control, index) => (
            <Text
              key={index}
              style={{
                color: 'rgba(196, 168, 118, 0.8)',
                fontSize: isMobile ? '11px' : '12px',
                display: 'block',
                marginBottom: index === (isMobile ? getMobileControlsText() : getControlsText()).length - 1 ? 0 : '1px',
                lineHeight: 1.3,
              }}
            >
              {control}
            </Text>
          ))}
        </Box>
      </Box>
      </Box>
    </Box>
  )
} 