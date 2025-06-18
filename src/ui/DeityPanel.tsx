import React, { useEffect } from 'react'
import { liverGroups, liverGods } from '../scene/LiverData'

interface DeityPanelProps {
  selectedInscription: any
  onClose: () => void
}

export function DeityPanel({ selectedInscription, onClose }: DeityPanelProps) {
  useEffect(() => {
    // Inject CSS for animations and scrollbar
    const style = document.createElement('style')
    style.textContent = `
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
          max-height: 100vh !important;
          border-radius: 0 !important;
          z-index: 9999 !important;
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

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  const group = (liverGroups as any)[selectedInscription.groupId]
  const gods = selectedInscription.gods.map((godId: string) => (liverGods as any)[godId]).filter(Boolean)

  const deityNames = gods.map((god: any) => god.name).join(' + ')
  const romanEquivalents = gods.map((god: any) => god.romanEquivalent).filter(Boolean)
  const greekEquivalents = gods.map((god: any) => god.greekEquivalent).filter(Boolean)

  const deityTitleStyles = {
    margin: 0,
    background: 'linear-gradient(135deg, #f4e6d3 0%, #e6d4b7 20%, #d4af37 40%, #f0d67c 60%, #e6d4b7 80%, #f4e6d3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: isMobile ? 'inherit' : '1.8em',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    fontFamily: 'Cinzel, Times New Roman, serif',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }


  const etruscanStyles = {
    marginTop: 0,
    marginBottom: 0,
    padding: '0',
    background: 'transparent',
    borderRadius: 0,
    border: 'none',
  }

  const etruscanTextStyles = {
    fontFamily: 'Noto Sans Old Italic, Aegean, serif',
    background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: isMobile ? '10vw' : '1.4em',
    fontStyle: 'italic',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.5px',
  }

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
    height: isMobile ? 'calc(100vh - 120px)' : undefined,
    overflowX: 'hidden' as const,
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
    fontSize: isMobile ? 'inherit' : '1.2em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const groupDescriptionStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.95em',
  }

  const cosmologicalTitleStyles = {
    margin: '16px 0 8px 0',
    color: '#d4af37',
    fontSize: isMobile ? 'inherit' : '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const cosmologicalTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.9em',
    fontStyle: 'italic',
  }

  const deitiesSectionStyles = {
    marginBottom: 24,
  }

  const deitiesTitleStyles = {
    margin: '0 0 16px 0',
    color: '#f4e6d3',
    fontSize: isMobile ? 'inherit' : '1.3em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const deityCardStyles = {
    background: 'linear-gradient(135deg, rgba(139, 101, 65, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    border: '1px solid rgba(139, 101, 65, 0.2)',
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
    fontSize: isMobile ? 'inherit' : '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const deityScriptStyles = {
    fontFamily: 'Noto Sans Old Italic, Aegean, serif',
    color: 'rgba(244, 230, 211, 0.7)',
    fontSize: isMobile ? '1.0em' : '0.9em',
    fontStyle: 'italic',
  }

  const deityEquivalentsStyles = {
    display: 'flex',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap' as const,
  }

  const equivalentStyles = {
    fontSize: isMobile ? '0.95em' : '0.85em',
    color: 'rgba(244, 230, 211, 0.8)',
    fontStyle: 'italic',
  }

  const deityDomainStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    fontSize: isMobile ? '1.0em' : '0.9em',
  }

  const deityDescriptionStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.9em',
  }

  const deityDivinationStyles = {
    margin: '12px 0 0 0',
    color: 'rgba(244, 230, 211, 0.9)',
    fontSize: isMobile ? 'inherit' : '0.9em',
    fontStyle: 'italic',
  }

  const relationshipSectionStyles = {
    marginBottom: 24,
    padding: '16px 20px',
    background: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    border: '1px solid rgba(212, 175, 55, 0.1)',
  }

  const relationshipTitleStyles = {
    margin: '0 0 12px 0',
    color: '#d4af37',
    fontSize: isMobile ? 'inherit' : '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const relationshipTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.9em',
    fontStyle: 'italic',
  }

  const combinedDivinationStyles = {
    padding: '16px 20px',
    background: 'rgba(139, 101, 65, 0.08)',
    borderRadius: 12,
    border: '1px solid rgba(139, 101, 65, 0.15)',
  }

  const combinedDivinationTitleStyles = {
    margin: '0 0 12px 0',
    color: '#d4af37',
    fontSize: isMobile ? 'inherit' : '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const combinedDivinationTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: isMobile ? 'inherit' : '0.9em',
    fontStyle: 'italic',
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

  const panelStyles = {
    position: 'fixed' as const,
    top: 0,
    right: isMobile ? 0 : 20,
    left: isMobile ? 0 : undefined,
    bottom: 0,
    width: isMobile ? '100vw' : 500,
    height: '100vh',
    background: 'linear-gradient(135deg, rgba(8, 6, 4, 0.92) 0%, rgba(12, 9, 6, 0.92) 25%, rgba(16, 12, 8, 0.92) 50%, rgba(20, 15, 10, 0.92) 75%, rgba(24, 18, 12, 0.92) 100%)',
    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 101, 65, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 10%, rgba(201, 168, 118, 0.05) 0%, transparent 50%)',
    border: '1px solid rgba(139, 101, 65, 0.2)',
    borderRadius: isMobile ? 0 : '0 0 0 0',
    color: '#f4e6d3',
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    backdropFilter: 'blur(30px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(139, 101, 65, 0.1), 0 2px 8px rgba(212, 175, 55, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.05), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
    zIndex: isMobile ? 9999 : 1000,
    animation: 'panelSlideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  }

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: isMobile ? 16 : 24,
    paddingTop: 32,
    borderBottom: '1px solid rgba(139, 101, 65, 0.2)',
    background: 'linear-gradient(135deg, rgba(16, 12, 8, 0.7) 0%, rgba(24, 20, 16, 0.7) 50%, rgba(32, 26, 20, 0.7) 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
    borderRadius: isMobile ? 0 : '16px 16px 0 0',
  }

  const headerLeftStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
  }

  const badgeStyles = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(139, 101, 65, 0.9) 100%)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1,
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 6px rgba(0, 0, 0, 0.5)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
    flexShrink: 0,
    marginTop: 2,
  }

  const deityNamesStyles = {
    flex: 1,
  }

  return (
    <div style={panelStyles} className={`deity-panel-scrollbar ${isMobile ? 'deity-panel-mobile' : ''}`}>
      <div style={headerStyles} className="panel-header">
        <div style={{...headerLeftStyles, flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
            <div style={badgeStyles}>
              {selectedInscription.id}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={deityTitleStyles} className={getTextClass('title')}>{deityNames}</h2>
            </div>
          </div>
          <div style={etruscanStyles}>
            <span style={etruscanTextStyles} className={getTextClass('etruscan')}>{selectedInscription.etruscanText}</span>
          </div>
          
          <div style={{ marginTop: '4px' }}>

          </div>
        </div>
        <button 
          onClick={onClose} 
          aria-label="Close panel" 
          title="Close panel"
          style={closeButtonStyles}
        >
          {isMobile ? '✕' : '×'}
        </button>
      </div>

      <div style={contentStyles} className="panel-content">
      <p style={groupDescriptionStyles} className={getTextClass('body')}>
        Involved deities:
      </p>
        <div style={deitiesSectionStyles}>

          {gods.map((god: any, index: number) => (
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
              
              <div style={deityDivinationStyles} className={getTextClass('body')}>
                <strong>Divination Meaning:</strong> {god.divinationMeaning}
              </div>
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
                backgroundColor: group?.color
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

        {gods.length > 1 && (
          <div style={relationshipSectionStyles}>
            <h3 style={relationshipTitleStyles} className={getTextClass('subsection-title')}>Why These Gods Appear Together</h3>
            <p style={relationshipTextStyles} className={getTextClass('body')}>{selectedInscription.relationship}</p>
          </div>
        )}

        <div style={combinedDivinationStyles}>
          <h3 style={combinedDivinationTitleStyles} className={getTextClass('subsection-title')}>Combined Divination Meaning</h3>
          <p style={combinedDivinationTextStyles} className={getTextClass('body')}>{selectedInscription.divinationMeaning}</p>
        </div>
      </div>
    </div>
  )
} 