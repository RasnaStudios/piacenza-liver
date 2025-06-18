import { 
  Paper, 
  Badge
} from '@mantine/core'
import { liverGroups, liverGods } from '../scene/LiverData'

interface HoverTooltipProps {
  hoveredSection: any
  mousePosition: { x: number; y: number }
}

export function HoverTooltip({ hoveredSection, mousePosition }: HoverTooltipProps) {
  // Disable hover tooltip completely on mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (!hoveredSection || isMobile) {
    return null
  }

  const group = (liverGroups as any)[hoveredSection.groupId]
  const gods = hoveredSection.gods.map((godId: string) => (liverGods as any)[godId]).filter(Boolean)
  const deityNames = gods.map((god: any) => god.name).join(' + ')

  const tooltipX = mousePosition.x + 15
  const tooltipY = mousePosition.y - 10

  const tooltipStyles = {
    position: 'fixed' as const,
    left: tooltipX,
    top: tooltipY,
    background: 'linear-gradient(135deg, rgba(20, 16, 12, 0.95) 0%, rgba(32, 26, 20, 0.95) 25%, rgba(44, 36, 28, 0.95) 50%, rgba(58, 48, 38, 0.95) 75%, rgba(70, 58, 46, 0.95) 100%)',
    border: '2px solid rgba(139, 101, 65, 0.6)',
    borderRadius: 12,
    padding: '6px 10px',
    color: '#f4e6d3',
    backdropFilter: 'blur(15px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(139, 101, 65, 0.2), 0 2px 8px rgba(212, 175, 55, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    maxWidth: 320,
    minWidth: 'auto',
    opacity: 1,
    transform: 'translateY(0) scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
    pointerEvents: 'none' as const,
  }

  const contentStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap' as const,
  }

  const etruscanTextStyles = {
    fontFamily: 'Noto Sans Old Italic, Aegean, serif',
    background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '0.8em',
    fontStyle: 'italic',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.5px',
  }

  const deityNamesStyles = {
    color: '#f4e6d3',
    fontSize: '0.85em',
    fontWeight: 600,
    lineHeight: 1.2,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    fontFamily: 'Cinzel, Times New Roman, serif',
    letterSpacing: '0.3px',
  }

  return (
    <Paper style={tooltipStyles}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={contentStyles}>
          <Badge 
            size="sm" 
            variant="filled"
            style={{ 
              backgroundColor: group?.color,
              color: '#000',
              border: '2px solid rgba(0, 0, 0, 0.3)',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '28px',
              width: 'auto',
              height: '28px',
              borderRadius: '50%',
              fontSize: '13px',
              fontWeight: '900',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
              padding: '0 4px',
              lineHeight: '1',
              flexShrink: 0,
            }}
          >
            {hoveredSection.id}
          </Badge>
          
          <span style={etruscanTextStyles}>
            {hoveredSection.etruscanText}
          </span>
        </div>
        
        <div style={deityNamesStyles}>
          {deityNames}
        </div>
      </div>
    </Paper>
  )
} 