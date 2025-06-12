import { useEffect, useState } from 'react'
import { Box, Text, Anchor } from '@mantine/core'

export function Legend() {
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
    switch (platform) {
      case 'mac':
        return 'Mouse: rotate • ⌘ + mouse: pan • scroll: zoom'
      case 'windows':
        return 'Mouse: rotate • Alt + mouse: pan • scroll: zoom'
      case 'linux':
        return 'Mouse: rotate • Alt + mouse: pan • scroll: zoom'
      default:
        return 'Mouse: rotate • Alt + mouse: pan • scroll: zoom'
    }
  }

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        color: 'rgba(196, 168, 118, 0.6)',
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        lineHeight: 1.4,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 100,
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(139, 101, 65, 0.2)',
      }}
    >
      <Box style={{ marginBottom: '10px' }}>
        <Text 
          style={{
            marginBottom: '4px',
            fontWeight: 500,
            color: 'rgba(196, 168, 118, 0.8)',
          }}
        >
          <Anchor 
            href="https://github.com/andraghetti" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              pointerEvents: 'auto',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)'
              e.currentTarget.style.textShadow = '0 0 8px rgba(212, 175, 55, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Lorenzo Andraghetti
          </Anchor>
        </Text>
        <Text 
          style={{
            marginBottom: '4px',
            color: 'rgba(196, 168, 118, 0.7)',
          }}
        >
          <Anchor 
            href="https://github.com/rasnastudios" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              pointerEvents: 'auto',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)'
              e.currentTarget.style.textShadow = '0 0 8px rgba(212, 175, 55, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Rasna Studios © 2025
          </Anchor>
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '1px solid rgba(139, 101, 65, 0.2)',
            color: 'rgba(196, 168, 118, 0.6)',
          }}
        >
          <Anchor 
            href="https://github.com/rasnastudios/piacenza-liver" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              pointerEvents: 'auto',
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              opacity: 0.8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)'
              e.currentTarget.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8'
              e.currentTarget.style.color = 'inherit'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            Contribute
            <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </Anchor>
        </Box>
      </Box>
      <Text
        style={{
          color: 'rgba(196, 168, 118, 0.5)',
          fontSize: '11px',
          fontStyle: 'italic',
          marginTop: '8px',
          borderTop: '1px solid rgba(139, 101, 65, 0.2)',
          paddingTop: '8px',
        }}
      >
        {getControlsText()}
      </Text>
    </Box>
  )
} 