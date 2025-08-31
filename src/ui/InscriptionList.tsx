import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { isMobile } from 'react-device-detect'
import { liverInscriptions, liverGroups, liverGods } from '../scene/LiverData'

interface InscriptionListProps {
  onInscriptionSelect: (inscription: any) => void
  selectedInscription: any
  isLoading: boolean
  hasInteracted: boolean
}

export function InscriptionList({ 
  onInscriptionSelect, 
  selectedInscription, 
  isLoading, 
  hasInteracted 
}: InscriptionListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const inscriptionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const isPortrait = useMediaQuery('(orientation: portrait)')
  
  const getGroupColor = (groupId: string) => {
    return liverGroups[groupId as keyof typeof liverGroups]?.color || '#888'
  }

  const getGodNames = (gods: string[]) => {
    return gods.map(godId => liverGods[godId as keyof typeof liverGods]?.name || godId).join(' & ')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show on desktop landscape - hide completely in portrait
      const shouldShow = hasInteracted && !isLoading && !isPortrait && !isMobile
      setIsVisible(shouldShow)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [hasInteracted, isLoading, isMobile, isPortrait])

  // Auto-scroll to selected inscription
  useEffect(() => {
    if (selectedInscription && inscriptionRefs.current[selectedInscription.id]) {
      const element = inscriptionRefs.current[selectedInscription.id]
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }, [selectedInscription])

  // Hide in portrait mode completely
  const shouldHide = isLoading || !hasInteracted || !isVisible || isPortrait
  
  if (shouldHide) {
    return null
  }

  const renderInscription = (inscription: any) => {
    const isHovered = hoveredId === inscription.id
    const isSelected = selectedInscription?.id === inscription.id
    
    return (
      <div
        key={inscription.id}
        ref={(el: HTMLDivElement | null) => { inscriptionRefs.current[inscription.id] = el }}
        style={{
          padding: '6px 8px',
          marginBottom: 2,
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          background: isSelected 
            ? `${getGroupColor(inscription.groupId)}30`
            : isHovered 
              ? 'rgba(196, 168, 118, 0.12)'
              : 'transparent',
          display: 'flex',
          alignItems: 'center',
          minHeight: 32,
        }}
        onMouseEnter={() => setHoveredId(inscription.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onInscriptionSelect(inscription)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: getGroupColor(inscription.groupId),
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            marginRight: 8,
            flexShrink: 0,
          }}
        >
          {inscription.id}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              color: 'rgba(196, 168, 118, 0.9)',
              fontWeight: 400,
              lineHeight: 1.3,
              fontFamily: 'Georgia, serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '14px',
            }}
          >
            {getGodNames(inscription.gods)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        bottom: 20,
        left: isVisible ? 0 : -300,
        width: 200,
        height: 'calc(100vh - 40px)',
        maxHeight: 'calc(100vh - 40px)',
        background: '#0a0806',
        border: '1px solid rgba(139, 101, 65, 0.2)',
        borderRadius: '0 12px 12px 0',
        zIndex: 50,
        fontFamily: 'Georgia, serif',
        transition: 'left 0.3s ease-out',
        padding: 8,
      }}
    >
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(196, 168, 118, 0.4) rgba(0, 0, 0, 0.2)',
        }}
        className="custom-scrollbar"
      >
        <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(196, 168, 118, 0.4);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(196, 168, 118, 0.6);
            }
          `}
        </style>
        {liverInscriptions.map(renderInscription)}
      </div>
    </div>
  )
}
