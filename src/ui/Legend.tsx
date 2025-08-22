import { useEffect, useState } from 'react'
import { 
  Text, 
  Box,
  Anchor
} from '@mantine/core'
import { isMobile } from 'react-device-detect'

interface LegendProps {
  hasInteracted?: boolean
}

export function Legend({ hasInteracted = false }: LegendProps) {
  const [platform, setPlatform] = useState('mac')


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

  const legendStyles = isMobile ? {
    // Mobile: full-width bottom panel
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100vw',
    color: 'rgba(196, 168, 118, 0.6)',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    lineHeight: 1.3,
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    zIndex: 100,
    padding: '14px 18px',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid rgba(139, 101, 65, 0.3)',
    opacity: hasInteracted ? 0 : 1,
    transition: 'opacity 0.8s ease-out',
  } : {
    // Desktop: corner panel
    position: 'fixed' as const,
    bottom: 20,
    left: 20,
    color: 'rgba(196, 168, 118, 0.6)',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    lineHeight: 1.4,
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    zIndex: 100,
    padding: '14px 18px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(139, 101, 65, 0.2)',
    opacity: hasInteracted ? 0 : 1,
    transition: 'opacity 0.8s ease-out',
  }

  const linkStyles = {
    pointerEvents: 'auto' as const,
    color: 'inherit',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  }

  const linkHoverStyles = {
    color: 'rgba(212, 175, 55, 0.9)',
    textShadow: '0 0 8px rgba(212, 175, 55, 0.3)',
  }

  const githubIconStyles = {
    width: '12px',
    height: '12px',
    fill: 'currentColor',
  }

  return (
    <Box style={legendStyles}>
      <Box style={{ marginBottom: '8px' }}>
        {/* Credits Section */}
        <Box style={{ marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <Text style={{ fontWeight: 500, color: 'rgba(196, 168, 118, 0.9)', fontSize: isMobile ? '14px' : '15px' }}>
            <Anchor 
              href="https://github.com/andraghetti" 
              target="_blank" 
              rel="noopener noreferrer"
              style={linkStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = linkHoverStyles.color
                e.currentTarget.style.textShadow = linkHoverStyles.textShadow
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'inherit'
                e.currentTarget.style.textShadow = 'none'
              }}
            >
              Lorenzo Andraghetti
            </Anchor>
            <Text component="span" style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(196, 168, 118, 0.6)', fontStyle: 'italic', marginLeft: '8px' }}>
              Website Programmer
            </Text>
          </Text>
          <Text style={{ fontWeight: 500, color: 'rgba(196, 168, 118, 0.9)', fontSize: isMobile ? '14px' : '15px' }}>
            Luca Tampieri
            <Text component="span" style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(196, 168, 118, 0.6)', fontStyle: 'italic', marginLeft: '8px' }}>
              3D Model Creation
            </Text>
          </Text>
        </Box>
        
        {/* Footer Section */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid rgba(139, 101, 65, 0.2)',
            color: 'rgba(196, 168, 118, 0.7)',
            fontSize: isMobile ? '12px' : '13px',
          }}
        >
          <Anchor 
            href="https://github.com/rasnastudios" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = linkHoverStyles.color
              e.currentTarget.style.textShadow = linkHoverStyles.textShadow
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Rasna Studios © 2025
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
              opacity: 0.8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.color = linkHoverStyles.color
              e.currentTarget.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8'
              e.currentTarget.style.color = 'inherit'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            Contribute
            <svg style={githubIconStyles} viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </Anchor>
        </Box>
      </Box>
      
      {/* Controls Section */}
      <Box
        style={{
          borderTop: '1px solid rgba(139, 101, 65, 0.2)',
          paddingTop: '8px',
        }}
      >
        {(isMobile ? getMobileControlsText() : getControlsText()).map((control, index) => (
          <Text
            key={index}
            style={{
              color: 'rgba(196, 168, 118, 0.7)',
              fontSize: isMobile ? '12px' : '13px',
              fontStyle: 'bold',
              display: 'block',
              marginBottom: index === (isMobile ? getMobileControlsText() : getControlsText()).length - 1 ? 0 : '2px',
            }}
          >
            {control}
          </Text>
        ))}
      </Box>
    </Box>
  )
} 