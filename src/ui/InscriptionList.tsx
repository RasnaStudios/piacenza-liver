import { useState, useEffect, useRef } from 'react'
import { Box, Text } from '@mantine/core'
import { isMobile } from 'react-device-detect'
import { liverInscriptions, liverGroups, liverGods } from '../scene/LiverData'

interface InscriptionListProps {
  onInscriptionSelect: (inscription: any) => void
  selectedInscription: any
  isLoading: boolean
  hasInteracted: boolean
}

export function InscriptionList({ onInscriptionSelect, selectedInscription, isLoading, hasInteracted }: InscriptionListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inscriptionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const getGroupColor = (groupId: string) => {
    return liverGroups[groupId as keyof typeof liverGroups]?.color || '#888'
  }

  const getGodNames = (gods: string[]) => {
    return gods.map(godId => liverGods[godId as keyof typeof liverGods]?.name || godId).join(' & ')
  }

  // Always use single column
  const totalWidth = '200px'
  
  // Always allow scrolling for full height
  
  const listStyles = (isMobile || isLoading || !hasInteracted) ? {
    display: 'none' // Hide on mobile, during loading, and before interaction
  } : {
    position: 'fixed' as const,
    top: 20,
    bottom: 20,
    left: isVisible ? 0 : -300,
    width: totalWidth,
    height: 'calc(100vh - 40px)',
    maxHeight: 'calc(100vh - 40px)',
    background: '#0a0806',
    backgroundImage: 'none',
    border: '1px solid rgba(139, 101, 65, 0.2)',
    borderRadius: '0 12px 12px 0',
    padding: '8px',
    zIndex: 50,
    fontFamily: 'Georgia, serif',
    transition: 'left 0.3s ease-out',
  }


  const itemStyles = (inscription: any, isHovered: boolean, isSelected: boolean) => ({
    padding: '6px 8px',
    marginBottom: '2px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: isSelected 
      ? `${getGroupColor(inscription.groupId)}30`
      : isHovered 
        ? 'rgba(196, 168, 118, 0.12)'
        : 'transparent',
    display: 'flex',
    alignItems: 'center',
    minHeight: '32px',
  })

  const numberStyles = (inscription: any) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: getGroupColor(inscription.groupId),
    color: 'white',
    fontSize: '11px',
    fontWeight: 600,
    marginRight: '8px',
    flexShrink: 0,
  })

  const godNameStyles = {
    color: 'rgba(196, 168, 118, 0.9)',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.3,
    fontFamily: 'Georgia, serif',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  // Handle visibility animation - show immediately when interacted
  useEffect(() => {
    if (!isMobile && !isLoading && hasInteracted) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isMobile, isLoading, hasInteracted])

  // Auto-scroll to selected inscription
  useEffect(() => {
    if (selectedInscription && scrollContainerRef.current && inscriptionRefs.current[selectedInscription.id]) {
      const selectedElement = inscriptionRefs.current[selectedInscription.id]
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }, [selectedInscription])

  if (isMobile || isLoading || !hasInteracted) {
    return null
  }

  const renderInscription = (inscription: any) => {
    const isHovered = hoveredId === inscription.id
    const isSelected = selectedInscription?.id === inscription.id
    
    return (
      <Box
        key={inscription.id}
        ref={(el) => { inscriptionRefs.current[inscription.id] = el }}
        style={itemStyles(inscription, isHovered, isSelected)}
        onMouseEnter={() => setHoveredId(inscription.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onInscriptionSelect(inscription)}
      >
        <Box style={numberStyles(inscription)}>
          {inscription.id}
        </Box>
        <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Text style={{
            ...godNameStyles
          }}>
            {getGodNames(inscription.gods)}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box style={listStyles}>
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
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(196, 168, 118, 0.4) rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
      <Box 
        ref={scrollContainerRef}
        className="custom-scrollbar"
        style={{ 
          height: '100%',
          overflowY: 'scroll',
          scrollbarWidth: 'thin',
        }}
      >
        {liverInscriptions.map(renderInscription)}
      </Box>
    </Box>
  )
}
