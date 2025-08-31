import { Drawer } from '@mantine/core'
import { useState, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { liverGods, liverInscriptions } from '../scene/LiverData'
import { GroupSection } from './deity/GroupSection'
import { DeityCard } from './deity/DeityCard'
import { PanelHeader } from './deity/PanelHeader'
import { 
  getPanelStyles, 
  getContentStyles,
  getDeitiesSectionStyles
} from './deity/styles'

interface DeityPanelProps {
  selectedInscription: any
  onClose: () => void
  onInscriptionSelect?: (inscription: any) => void
}

export function DeityPanel({ selectedInscription, onClose, onInscriptionSelect }: DeityPanelProps) {
  const isPortrait = window.matchMedia('(orientation: portrait)').matches
  const [panelHeight, setPanelHeight] = useState(33) // Start at 33vh
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef(0)
  const prevInscriptionId = useRef<number | null>(null)
  
  // Reset to lower third when new inscription is selected
  if (selectedInscription && selectedInscription.id !== prevInscriptionId.current) {
    setPanelHeight(33)
    prevInscriptionId.current = selectedInscription.id
  }
  
  if (!selectedInscription) return null

  // Fix gods data structure - use selectedInscription.gods like original
  const gods = selectedInscription.gods?.map((godId: string) => (liverGods as any)[godId]).filter(Boolean) || []
  const deityNames = gods.map((g: any) => g.name).join(' + ')

  const getTextClass = (type: string) => {
    if (!isMobile) return ''
    switch (type) {
      case 'title': return 'mobile-title'
      case 'subtitle': return 'mobile-subtitle'
      case 'section-title': return 'mobile-section-title'
      case 'subsection-title': return 'mobile-section-title'
      case 'body': return 'mobile-body-text'
      case 'label': return 'mobile-label-text'
      default: return ''
    }
  }
  
  const panelStyles = getPanelStyles()
  const contentStyles = getContentStyles()

  const handleDragStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    dragStartY.current = e.touches[0].clientY
    e.stopPropagation()
  }

  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - dragStartY.current
    setDragOffset(deltaY)
    e.stopPropagation()
  }

  const handleDragEnd = (e: React.TouchEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    
    // Calculate actual panel position relative to viewport bottom
    const viewportHeight = window.innerHeight
    const currentPanelHeight = (panelHeight / 100) * viewportHeight
    const panelBottomPosition = dragOffset // How far panel moved from bottom
    
    // Only close if dragged down more than the current panel height
    if (panelBottomPosition > currentPanelHeight) {
      onClose()
    } else {
      // Save the new position based on drag direction
      if (dragOffset < 0) {
        // Dragged up - expand panel
        const dragUpDistance = Math.abs(dragOffset)
        const heightIncrease = (dragUpDistance / viewportHeight) * 100 // Convert to vh
        setPanelHeight(Math.min(90, Math.max(33, panelHeight + heightIncrease)))
      } else if (dragOffset > 0) {
        // Dragged down - contract panel
        const dragDownDistance = dragOffset
        const heightDecrease = (dragDownDistance / viewportHeight) * 100 // Convert to vh
        setPanelHeight(Math.min(90, Math.max(33, panelHeight - heightDecrease)))
      }
    }
    
    setDragOffset(0)
    e.stopPropagation()
  }


  const getCurrentHeight = () => {
    if (isDragging) {
      const viewportHeight = window.innerHeight
      if (dragOffset > 0) {
        // When dragging down, show live height decrease
        const dragDownDistance = dragOffset
        const heightDecrease = (dragDownDistance / viewportHeight) * 100
        return Math.min(90, Math.max(33, panelHeight - heightDecrease))
      } else if (dragOffset < 0) {
        // When dragging up, show live height increase
        const dragUpDistance = Math.abs(dragOffset)
        const heightIncrease = (dragUpDistance / viewportHeight) * 100
        return Math.min(90, Math.max(33, panelHeight + heightIncrease))
      }
    }
    return panelHeight
  }

  // Mobile portrait: custom bottom sheet
  if (isMobile && isPortrait) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${getCurrentHeight()}vh`,
          backgroundColor: '#0a0806',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          transform: 'none',
          opacity: 1,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        }}
      >
        {/* Drag handle */}
        <div 
          className="drag-handle"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 0 4px 0',
            cursor: 'grab',
          }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'rgba(196, 168, 118, 0.7)',
            borderRadius: '2px',
          }} />
        </div>
        
        <div style={{
          flex: 1,
          color: '#f4e6d3',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <PanelHeader 
            selectedInscription={selectedInscription}
            deityNames={deityNames}
            onClose={onClose}
            getTextClass={getTextClass}
          />
        <div 
          className="deity-panel-scrollbar"
          style={{
            flex: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            padding: '16px 24px',
            color: '#f4e6d3',
            WebkitOverflowScrolling: 'touch',
            minHeight: 0,
            touchAction: 'pan-y',
          }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <h5 style={{
                fontSize: isMobile ? '1.1em' : '1.0em',
                fontWeight: 600,
                color: 'rgba(139, 101, 65, 0.9)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }} className={getTextClass('label')}>Involved deities</h5>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {gods.map((god: any) => (
                <DeityCard
                  key={god.id}
                  god={god}
                  getTextClass={getTextClass}
                  selectedInscriptionId={selectedInscription.id}
                  onInscriptionClick={(inscriptionId) => {
                    const inscription = liverInscriptions.find((ins: any) => ins.id === inscriptionId)
                    if (inscription && onInscriptionSelect) {
                      // First: Lower the panel to 33vh
                      setPanelHeight(33)
                      // Then: Trigger camera animation and new inscription selection
                      setTimeout(() => {
                        onInscriptionSelect(inscription)
                      }, 300) // Wait for panel lowering animation
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <GroupSection 
            selectedInscription={selectedInscription}
            getTextClass={getTextClass}
          />
        </div>
        </div>
      </div>
    )
  }

  // Desktop/landscape: right side panel
  return (
    <Drawer
      opened={!!selectedInscription}
      onClose={onClose}
      position="right"
      size="45vw"
      withOverlay={false}
      withCloseButton={false}
      styles={{
        drawer: {
          ...panelStyles.desktop,
          maxWidth: '45vw',
        },
        body: {
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0806',
        },
      }}
      transitionProps={{
        transition: 'slide-left',
        duration: 400,
      }}
    >
      <PanelHeader 
        selectedInscription={selectedInscription}
        deityNames={deityNames}
        onClose={onClose}
        getTextClass={getTextClass}
      />
      <div 
        className="deity-panel-scrollbar"
        style={{
          ...contentStyles,
          overflowY: 'scroll',
          overflowX: 'hidden',
          minHeight: 0,
        }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 12 }}>
            <h5 style={{
              fontSize: isMobile ? '1.1em' : '1.0em',
              fontWeight: 600,
              color: 'rgba(139, 101, 65, 0.9)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }} className={getTextClass('label')}>Involved deities</h5>
          </div>
          
          <div style={getDeitiesSectionStyles()}>
            {gods.map((god: any) => (
              <DeityCard
                key={god.id}
                god={god}
                getTextClass={getTextClass}
                selectedInscriptionId={selectedInscription.id}
                onInscriptionClick={(inscriptionId) => {
                  const inscription = liverInscriptions.find((ins: any) => ins.id === inscriptionId)
                  if (inscription && onInscriptionSelect) {
                    onInscriptionSelect(inscription)
                  }
                }}
              />
            ))}
          </div>
        </div>

        <GroupSection 
          selectedInscription={selectedInscription}
          getTextClass={getTextClass}
        />
      </div>
    </Drawer>
  )
}
