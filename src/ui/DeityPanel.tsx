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
          top: 10px !important;
          right: 10px !important;
          left: 10px !important;
          width: auto !important;
          max-height: 80vh !important;
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

  const panelStyles = {
    position: 'fixed' as const,
    top: 20,
    right: 20,
    width: 400,
    maxHeight: '85vh',
    background: 'linear-gradient(135deg, rgba(20, 16, 12, 1.0) 0%, rgba(32, 26, 20, 1.0) 25%, rgba(44, 36, 28, 1.0) 50%, rgba(58, 48, 38, 1.0) 75%, rgba(70, 58, 46, 1.0) 100%)',
    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 101, 65, 0.05) 0%, transparent 50%), radial-gradient(circle at 50% 10%, rgba(201, 168, 118, 0.03) 0%, transparent 50%)',
    border: 'none',
    borderRadius: 16,
    color: '#f4e6d3',
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    overflowY: 'auto' as const,
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 8px 24px rgba(139, 101, 65, 0.2), 0 2px 8px rgba(212, 175, 55, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    animation: 'panelSlideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    className: `deity-panel-scrollbar ${isMobile ? 'deity-panel-mobile' : ''}`,
  }

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottom: '2px solid rgba(139, 101, 65, 0.3)',
    background: 'linear-gradient(135deg, rgba(32, 26, 20, 1.0) 0%, rgba(48, 40, 32, 1.0) 50%, rgba(64, 54, 44, 1.0) 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
    borderRadius: '16px 16px 0 0',
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

  const deityTitleStyles = {
    margin: 0,
    background: 'linear-gradient(135deg, #f4e6d3 0%, #e6d4b7 20%, #d4af37 40%, #f0d67c 60%, #e6d4b7 80%, #f4e6d3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '1.8em',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    fontFamily: 'Cinzel, Times New Roman, serif',
  }

  const deitySubtitleStyles = {
    margin: '8px 0 4px 0',
    color: 'rgba(244, 230, 211, 0.8)',
    fontSize: '1.1em',
    fontWeight: 500,
    fontStyle: 'italic',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const etruscanStyles = {
    marginTop: 12,
    padding: '8px 12px',
    background: 'rgba(139, 101, 65, 0.1)',
    borderRadius: 8,
    border: '1px solid rgba(139, 101, 65, 0.2)',
  }

  const etruscanLabelStyles = {
    display: 'block',
    fontSize: '0.85em',
    color: 'rgba(244, 230, 211, 0.7)',
    marginBottom: 4,
    fontStyle: 'italic',
  }

  const etruscanTextStyles = {
    fontFamily: 'Noto Sans Old Italic, Aegean, serif',
    background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '1.1em',
    fontStyle: 'italic',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.5px',
  }

  const closeButtonStyles = {
    background: 'rgba(139, 101, 65, 0.2)',
    border: '1px solid rgba(139, 101, 65, 0.4)',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(244, 230, 211, 0.8)',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  }

  const contentStyles = {
    padding: 24,
    position: 'relative' as const,
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
    fontSize: '1.2em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const groupDescriptionStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: '0.95em',
  }

  const cosmologicalTitleStyles = {
    margin: '16px 0 8px 0',
    color: '#d4af37',
    fontSize: '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const cosmologicalTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: '0.9em',
    fontStyle: 'italic',
  }

  const deitiesSectionStyles = {
    marginBottom: 24,
  }

  const deitiesTitleStyles = {
    margin: '0 0 16px 0',
    color: '#f4e6d3',
    fontSize: '1.3em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const deityCardStyles = {
    marginBottom: 16,
    padding: '16px 20px',
    background: 'rgba(139, 101, 65, 0.08)',
    borderRadius: 12,
    border: '1px solid rgba(139, 101, 65, 0.15)',
    transition: 'all 0.2s ease',
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
    fontSize: '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const deityScriptStyles = {
    fontFamily: 'Noto Sans Old Italic, Aegean, serif',
    color: 'rgba(244, 230, 211, 0.7)',
    fontSize: '0.9em',
    fontStyle: 'italic',
  }

  const deityEquivalentsStyles = {
    display: 'flex',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap' as const,
  }

  const equivalentStyles = {
    fontSize: '0.85em',
    color: 'rgba(244, 230, 211, 0.8)',
    fontStyle: 'italic',
  }

  const deityDomainStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    fontSize: '0.9em',
  }

  const deityDescriptionStyles = {
    margin: '8px 0',
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: '0.9em',
  }

  const deityDivinationStyles = {
    margin: '12px 0 0 0',
    color: 'rgba(244, 230, 211, 0.9)',
    fontSize: '0.9em',
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
    fontSize: '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const relationshipTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: '0.9em',
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
    fontSize: '1.1em',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
  }

  const combinedDivinationTextStyles = {
    margin: 0,
    color: 'rgba(244, 230, 211, 0.9)',
    lineHeight: 1.6,
    fontSize: '0.9em',
    fontStyle: 'italic',
  }

  return (
    <div style={panelStyles}>
      <div style={headerStyles}>
        <div style={headerLeftStyles}>
          <div style={badgeStyles}>
            {selectedInscription.id}
          </div>
          <div style={deityNamesStyles}>
            <h2 style={deityTitleStyles}>{deityNames}</h2>
            {romanEquivalents.length > 0 && (
              <h3 style={deitySubtitleStyles}>Roman: {romanEquivalents.join(', ')}</h3>
            )}
            {greekEquivalents.length > 0 && (
              <h3 style={deitySubtitleStyles}>Greek: {greekEquivalents.join(', ')}</h3>
            )}
            <div style={etruscanStyles}>
              <span style={etruscanLabelStyles}>Etruscan inscription:</span>
              <span style={etruscanTextStyles}>{selectedInscription.etruscanText}</span>
            </div>
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

      <div style={contentStyles}>
        <div style={groupSectionStyles}>
          <div style={groupHeaderStyles}>
            <div 
              style={{
                ...groupColorDotStyles,
                backgroundColor: group?.color
              }}
            />
            <h3 style={groupTitleStyles}>{group?.name}</h3>
          </div>
          <p style={groupDescriptionStyles}>{group?.description}</p>
          <div>
            <h4 style={cosmologicalTitleStyles}>Cosmological Meaning</h4>
            <p style={cosmologicalTextStyles}>{group?.cosmologicalMeaning}</p>
          </div>
        </div>

        <div style={deitiesSectionStyles}>
          <h3 style={deitiesTitleStyles}>Deit{gods.length > 1 ? 'ies' : 'y'} Details</h3>
          
          {gods.map((god: any, index: number) => (
            <div key={god.id} style={deityCardStyles}>
              <div style={deityHeaderStyles}>
                <h4 style={deityNameStyles}>{god.name}</h4>
                <span style={deityScriptStyles}>{god.etruscanScript}</span>
              </div>
              
              <div style={deityEquivalentsStyles}>
                {god.romanEquivalent && (
                  <span style={equivalentStyles}>Roman: {god.romanEquivalent}</span>
                )}
                {god.greekEquivalent && (
                  <span style={equivalentStyles}>Greek: {god.greekEquivalent}</span>
                )}
              </div>
              
              <div style={deityDomainStyles}>
                <strong>Domain:</strong> {god.domain}
              </div>
              
              <p style={deityDescriptionStyles}>{god.description}</p>
              
              <div style={deityDivinationStyles}>
                <strong>Divination Meaning:</strong> {god.divinationMeaning}
              </div>
            </div>
          ))}
        </div>

        {gods.length > 1 && (
          <div style={relationshipSectionStyles}>
            <h3 style={relationshipTitleStyles}>Why These Gods Appear Together</h3>
            <p style={relationshipTextStyles}>{selectedInscription.relationship}</p>
          </div>
        )}

        <div style={combinedDivinationStyles}>
          <h3 style={combinedDivinationTitleStyles}>Combined Divination Meaning</h3>
          <p style={combinedDivinationTextStyles}>{selectedInscription.divinationMeaning}</p>
        </div>
      </div>
    </div>
  )
} 