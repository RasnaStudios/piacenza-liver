import { useEffect, useRef, useState } from 'react'
import { liverGods } from '../scene/LiverData'
import { isMobile } from 'react-device-detect'
import { PanelHeader } from './deity/PanelHeader'
import { DeityCard } from './deity/DeityCard'
import { GroupSection } from './deity/GroupSection'
import { 
  getPanelStyles, 
  CSS_ANIMATIONS,
  getContentStyles,
  getDeitiesSectionStyles
} from './deity/styles'

interface DeityPanelProps {
  selectedInscription: any
  onClose: () => void
  onInscriptionClick?: (inscriptionId: number) => void
}

export function DeityPanel({ selectedInscription, onClose, onInscriptionClick }: DeityPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Reset states when panel opens with new inscription
  useEffect(() => {
    setIsDragging(false)
    setIsClosing(false)
    setDragStartY(0)
    if (panelRef.current) {
      panelRef.current.style.transition = 'none'
      panelRef.current.style.transform = 'translateY(0)'
    }
  }, [selectedInscription?.id])

  const closePanel = () => {
    setIsClosing(true)
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.3s ease-out'
      panelRef.current.style.transform = 'translateY(100%)'
    }
    setTimeout(() => {
      // Reset all states when closing
      setIsDragging(false)
      setIsClosing(false)
      setDragStartY(0)
      if (panelRef.current) {
        panelRef.current.style.transition = 'none'
        panelRef.current.style.transform = 'translateY(0)'
      }
      onClose()
    }, 300)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isClosing) return
    const contentElement = e.target as HTMLElement
    const scrollableContent = contentElement.closest('.panel-content')
    
    // Only allow panel drag if we're at the top of scrollable content
    if (scrollableContent && scrollableContent.scrollTop > 0) {
      return // Let normal scrolling happen
    }
    
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging || isClosing) return
    
    const currentY = e.touches[0].clientY
    const deltaY = Math.max(0, currentY - dragStartY)
    
    // Only drag panel if moving downward
    if (deltaY > 0 && panelRef.current) {
      e.preventDefault() // Prevent scrolling while dragging panel
      panelRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging || isClosing) return
    setIsDragging(false)
    
    const currentY = e.changedTouches[0].clientY
    const deltaY = currentY - dragStartY
    
    if (deltaY > 100) {
      // Close panel with slide animation
      closePanel()
    } else {
      // Snap back to top
      if (panelRef.current) {
        panelRef.current.style.transition = 'transform 0.2s ease-out'
        panelRef.current.style.transform = 'translateY(0px)'
        setTimeout(() => {
          if (panelRef.current) {
            panelRef.current.style.transition = 'none'
          }
        }, 200)
      }
    }
  }
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = CSS_ANIMATIONS
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!selectedInscription) {
    return null
  }

  const gods = selectedInscription.gods.map((godId: string) => (liverGods as any)[godId]).filter(Boolean)
  const deityNames = gods.map((g: any) => g.name).join(' + ')
  const panelStyles = getPanelStyles()
  const currentPanelStyles = isMobile ? panelStyles.mobile : panelStyles.desktop

  const getTextClass = (type: string) => {
    if (!isMobile) return ''
    switch (type) {
      case 'title': return 'mobile-title'
      case 'subtitle': return 'mobile-subtitle'
      case 'section-title': return 'mobile-section-title'
      case 'subsection-title': return 'mobile-subsection-title'
      case 'body': return 'mobile-body-text'
      case 'label': return 'mobile-label-text'
      case 'etruscan': return 'mobile-etruscan-text'
      default: return 'mobile-body-text'
    }
  }

  return (
    <div 
      ref={panelRef}
      style={currentPanelStyles} 
      className={`deity-panel-scrollbar ${isMobile ? 'deity-panel-mobile' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <PanelHeader
        selectedInscription={selectedInscription}
        deityNames={deityNames}
        onClose={closePanel}
        getTextClass={getTextClass}
      />
      
      <div style={getContentStyles()} className="panel-content">
        <div style={{
          marginBottom: 24
        }}>
          <div style={{
            marginBottom: 12
          }}>
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
                onInscriptionClick={onInscriptionClick}
                selectedInscriptionId={selectedInscription.id}
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
  )
}
 