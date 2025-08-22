import { useEffect, useState, useRef } from 'react'
import { liverGroups, liverGods } from '../scene/LiverData'
import { NumberBadge } from './NumberBadge'

interface DeityPanelProps {
  selectedInscription: any
  onClose: () => void
}

export function DeityPanel({ selectedInscription, onClose }: DeityPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

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
    // Inject CSS for animations and scrollbar
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

      @keyframes panelSlideIn {
        0% {
          opacity: 0;
          transform: translateX(100%) scale(0.95);
          filter: blur(5px);
        }
        50% {
          opacity: 0.8;
          transform: translateX(20%) scale(0.98);
          filter: blur(2px);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
          filter: blur(0);
        }
      }

      @media (max-width: 768px) {
        @keyframes panelSlideInMobile {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        @keyframes panelSlideIn {
          0% {
            opacity: 0;
            transform: translateY(100%) scale(0.95);
            filter: blur(5px);
          }
          50% {
            opacity: 0.8;
            transform: translateY(20%) scale(0.98);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      }

      .deity-panel-scrollbar::-webkit-scrollbar {
        width: 8px;
      }

      .deity-panel-scrollbar::-webkit-scrollbar-track {
        background: rgba(139, 101, 65, 0.1);
        border-radius: 4px;
      }

      .deity-panel-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.6) 0%, rgba(139, 101, 65, 0.6) 100%);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .deity-panel-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(139, 101, 65, 0.8) 100%);
      }

      @media (max-width: 768px) {
        .deity-panel-mobile {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          border-radius: 0 !important;
          z-index: 9999 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          animation: panelSlideInMobile 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        
        .deity-panel-mobile .panel-header {
          padding: 16px !important;
          border-radius: 0 !important;
        }
        
        .deity-panel-mobile .panel-content {
          padding: 16px !important;
          height: calc(100vh - 120px) !important;
          overflow-y: auto !important;
        }

        /* Mobile Font Overrides - Much Larger Fonts */
        .mobile-title {
          font-size: 6vw !important;
          line-height: 1.2 !important;
        }
        
        .mobile-subtitle {
          font-size: 4.5vw !important;
          line-height: 1.3 !important;
        }
        
        .mobile-section-title {
          font-size: 5vw !important;
          line-height: 1.3 !important;
        }
        
        .mobile-subsection-title {
          font-size: 4.5vw !important;
          line-height: 1.3 !important;
        }
        
        .mobile-body-text {
          font-size: 4vw !important;
          line-height: 1.5 !important;
        }
        
        .mobile-label-text {
          font-size: 3.5vw !important;
          line-height: 1.4 !important;
        }
        
        .mobile-etruscan-text {
          font-size: 4.5vw !important;
          line-height: 1.4 !important;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!selectedInscription) {
    return null
  }

  
  const group = (liverGroups as any)[selectedInscription.groupId]
  const gods = selectedInscription.gods.map((godId: string) => (liverGods as any)[godId]).filter(Boolean)


  const closeButtonStyles = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(139, 101, 65, 0.9) 0%, rgba(212, 175, 55, 0.9) 100%)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 24,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    padding: 0,
    margin: 0,
    marginLeft: 16,
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
    flexShrink: 0,
    ':hover': {
      background: 'linear-gradient(135deg, rgba(139, 101, 65, 1) 0%, rgba(212, 175, 55, 1) 100%)',
      transform: 'scale(1.05)',
    },
    ':active': {
      transform: 'scale(0.95)',
    },
  }

  const contentStyles = {
    padding: isMobile ? '16px' : '24px',
    paddingBottom: isMobile ? '32px' : '48px',
    position: 'relative' as const,
    height: isMobile ? 'calc(100vh - 100px)' : undefined,
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    background: '#0a0806',
    flex: 1,
  }

  const groupSectionStyles = {
    marginBottom: 24,
    padding: '16px 20px',
    background: 'rgba(139, 101, 65, 0.05)',
    borderRadius: 12,
    border: '1px solid rgba(139, 101, 65, 0.1)',
  }

  const groupHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  }

  const groupColorDotStyles = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  }

  const groupTitleStyles = {
    margin: 0,
    color: '#f4e6d3',
    fontSize: isMobile ? 'inherit' : '1.25em',
    fontWeight: 600,
    fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
    textShadow: '0 0 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
  }

  const groupDescriptionStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.95em',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const cosmologicalTitleStyles = {
    margin: '16px 0 8px 0',
    color: '#d4af37',
    fontSize: isMobile ? 'inherit' : '1.15em',
    fontWeight: 600,
    fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
    textShadow: '0 0 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
  }

  const cosmologicalTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '1.0em',
    fontStyle: 'italic',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const deitiesSectionStyles = {
    marginBottom: 24,
  }

  

  const deityCardStyles = {
    background: 'linear-gradient(135deg, rgba(139, 101, 65, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    border: '1px solid rgba(0, 0, 0, 0.7)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '100%',
  }

  const deityHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  }

  const deityNameStyles = {
    margin: 0,
    color: '#d4af37',
    fontSize: isMobile ? 'inherit' : '1.2em',
    fontWeight: 600,
    fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
    textShadow: '0 0 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
  }

  const deityScriptStyles = {
    fontFamily: 'Noto Sans Old Italic, Aegean, serif',
    color: 'rgba(244, 230, 211, 0.7)',
    fontSize: isMobile ? '1.0em' : '0.9em',
    fontStyle: 'italic',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const deityEquivalentsStyles = {
    display: 'flex',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap' as const,
  }

  const equivalentStyles = {
    fontSize: isMobile ? '1.0em' : '0.95em',
    color: 'rgba(244, 230, 211, 0.8)',
    fontStyle: 'italic',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const deityDomainStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    fontSize: isMobile ? '1.1em' : '1.0em',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const deityDescriptionStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '1.0em',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const descriptionSectionStyles = {
    marginBottom: 24,
    padding: '16px 20px',
    background: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    border: '1px solid rgba(212, 175, 55, 0.1)',
  }

  const descriptionTitleStyles = {
    margin: '0 0 12px 0',
    color: '#d4af37',
    fontSize: isMobile ? 'inherit' : '1.25em',
    fontWeight: 600,
    fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
    textShadow: '0 0 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
  }

  const descriptionTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.9em',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }
  

  // Simplified styles for better mobile handling
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

  const panelStyles = isMobile ? {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    minWidth: '100vw',
    minHeight: '100vh',
    background: '#0a0806',
    backgroundImage: 'none',
    border: 'none',
    borderRadius: 0,
    color: '#f4e6d3',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    transform: 'translateY(0)',
    transition: 'none',
    overflowY: 'hidden' as const,
    overflowX: 'hidden' as const,
    backdropFilter: 'none',
    boxShadow: 'none',
    zIndex: 9999,
    animation: 'panelSlideInMobile 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
    margin: 0,
    padding: 0,
  } : {
    position: 'fixed' as const,
    top: 20,
    right: 20,
    bottom: 20,
    width: 500,
    height: 'calc(100vh - 40px)',
    background: '#0a0806',
    backgroundImage: 'none',
    border: '1px solid rgba(139, 101, 65, 0.2)',
    borderRadius: '12px',
    color: '#f4e6d3',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    overflowY: 'hidden' as const,
    overflowX: 'hidden' as const,
    backdropFilter: 'none',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    animation: 'panelSlideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
  }

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: isMobile ? '20px 16px 16px 16px' : 16,
    paddingTop: isMobile ? 20 : 20,
    borderBottom: '1px solid rgba(139, 101, 65, 0.2)',
    background: 'linear-gradient(135deg, #100c08 0%, #181410 50%, #201a14 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
    borderRadius: isMobile ? 0 : '12px 12px 0 0',
  }
  const headerLeftStyles = {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gridAutoRows: 'auto',
    columnGap: 8,
    rowGap: 4,
    alignItems: 'center',
  }

  const deityNames = gods.map((g: any) => g.name).join(' + ')
  const inscriptionDescription =
    (selectedInscription && (selectedInscription as any).description) ??
    ''

  return (
    <div 
      ref={panelRef}
      style={panelStyles} 
      className={`deity-panel-scrollbar ${isMobile ? 'deity-panel-mobile' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={headerStyles} className="panel-header">
        <div style={headerLeftStyles}>
          <NumberBadge value={selectedInscription.id} size={28} />
          <h2 style={{
            margin: 0,
            color: '#f4e6d3',
            textShadow: '0 0 8px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
            gridColumn: '2 / 3',
            alignSelf: 'center',
            fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
            fontWeight: 600,
            fontSize: isMobile ? '1.4em' : '1.6em',
          }} className={getTextClass('title')}>
            {deityNames}
          </h2>
          <span style={{
            fontFamily: 'Noto Sans Old Italic, Aegean, serif',
            background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: isMobile ? '1.15em' : '1.1em',
            fontStyle: 'italic',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            letterSpacing: '0.5px',
            gridColumn: '1 / -1',
            gridRow: '2 / 3',
          }} className={getTextClass('etruscan')}>
            {selectedInscription.etruscanText}
          </span>
        </div>
        <button
          onClick={closePanel}
          aria-label="Close panel"
          title="Close panel"
          style={closeButtonStyles}
        >
          {isMobile ? '✕' : '×'}
        </button>
      </div>

      <div style={contentStyles} className="panel-content">
        <div style={descriptionSectionStyles}>
          <h3 style={descriptionTitleStyles} className={getTextClass('subsection-title')}>Description</h3>
          <p style={descriptionTextStyles} className={getTextClass('body')}>{inscriptionDescription}</p>
        </div>

        <p style={groupDescriptionStyles} className={getTextClass('body')}>
          Involved deities:
        </p>
        <div style={deitiesSectionStyles}>
          {gods.map((god: any) => (
            <div key={god.id} style={deityCardStyles}>
              <div style={deityHeaderStyles}>
                <h4 style={deityNameStyles} className={getTextClass('subsection-title')}>{god.name}</h4>
                <span style={deityScriptStyles} className={getTextClass('label')}>{god.etruscanScript}</span>
              </div>
              <div style={deityEquivalentsStyles}>
                {god.romanEquivalent && (
                  <span style={equivalentStyles} className={getTextClass('label')}>Roman: {god.romanEquivalent}</span>
                )}
                {god.greekEquivalent && (
                  <span style={equivalentStyles} className={getTextClass('label')}>Greek: {god.greekEquivalent}</span>
                )}
              </div>
              <div style={deityDomainStyles} className={getTextClass('body')}>
                <strong>Domain:</strong> {god.domain}
              </div>
              <p style={deityDescriptionStyles} className={getTextClass('body')}>{god.description}</p>
            </div>
          ))}
        </div>

        <p style={groupDescriptionStyles} className={getTextClass('body')}>
          This inscription is part of:
        </p>
        <div style={groupSectionStyles}>
          <div style={groupHeaderStyles}>
            <div
              style={{
                ...groupColorDotStyles,
                backgroundColor: group?.color,
              }}
            />
            <h3 style={groupTitleStyles} className={getTextClass('section-title')}>{group?.name}</h3>
          </div>
          <p style={cosmologicalTextStyles} className={getTextClass('body')}>{group?.description}</p>
          <div>
            <h4 style={cosmologicalTitleStyles} className={getTextClass('subsection-title')}>Cosmological Meaning</h4>
            <p style={cosmologicalTextStyles} className={getTextClass('body')}>{group?.cosmologicalMeaning}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
 