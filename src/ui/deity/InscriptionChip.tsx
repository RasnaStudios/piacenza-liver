import { liverGods } from '../../scene/LiverData'
import { isMobile } from 'react-device-detect'

interface InscriptionChipProps {
  inscriptionId: number
  groupColor: string
  associatedGodIds: string[]
  onClick: () => void
  godVariation?: string | null
}

export function InscriptionChip({ inscriptionId, groupColor, associatedGodIds, onClick, godVariation }: InscriptionChipProps) {
  const associatedGods = associatedGodIds.map(id => (liverGods as any)[id]).filter(Boolean)
  
  const chipStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}10 100%)`,
    border: `1px solid ${groupColor}40`,
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: isMobile ? '1.1em' : '1.0em',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    color: 'rgba(244, 230, 211, 0.9)',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
  }

  const numberStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: groupColor,
    color: '#000',
    fontSize: isMobile ? 'inherit' : '0.8em',
    fontWeight: 900,
    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  }

  const godNamesStyles = {
    fontSize: isMobile ? '1.0em' : '0.9em',
    opacity: 0.9,
  }

  return (
    <button
      onClick={onClick}
      style={chipStyles}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${groupColor}30 0%, ${groupColor}20 100%)`
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.borderColor = `${groupColor}60`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}10 100%)`
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = `${groupColor}40`
      }}
      title={`Go to inscription ${inscriptionId}${associatedGods.length > 0 ? ` (with ${associatedGods.map(g => g.name).join(', ')})` : ''}`}
    >
      <div style={numberStyles}>
        {inscriptionId}
      </div>
      
      {godVariation && (
        <span style={godNamesStyles}>
          <span style={{ 
            opacity: 0.6, 
            fontWeight: 300,
            fontSize: isMobile ? 'inherit' : '0.85em'
          }}>
            as{' '}
          </span>
          <span style={{ 
            fontWeight: 700,
            color: groupColor,
            textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`
          }}>
            {godVariation.toUpperCase()}
          </span>
        </span>
      )}

      {associatedGods.length > 0 && (
        <span style={godNamesStyles}>
          <span style={{ 
            opacity: 0.6, 
            fontWeight: 300,
            fontSize: isMobile ? 'inherit' : '0.85em'
          }}>
            with{' '}
          </span>
          <span style={{ 
            fontWeight: 700,
            color: groupColor,
            textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`
          }}>
            {associatedGods.map(god => god.name).join(', ')}
          </span>
        </span>
      )}
    </button>
  )
}
