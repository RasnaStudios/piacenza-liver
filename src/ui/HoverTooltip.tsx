import { 
  Paper
} from '@mantine/core'
import { liverGods } from '../scene/LiverData'
import { NumberBadge } from './NumberBadge'
import { isMobile } from 'react-device-detect'

interface HoverTooltipProps {
  hoveredSection: any
  mousePosition: { x: number; y: number }
  isPanelOpen?: boolean
  isModifierKeyPressed?: boolean
}

export function HoverTooltip({ hoveredSection, mousePosition, isPanelOpen = false, isModifierKeyPressed = false }: HoverTooltipProps) {
  
  // Don't show tooltip if mobile, no hovered section, panel is open, or modifier keys are pressed
  if (!hoveredSection || isMobile || isModifierKeyPressed) {
    return null
  }

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
    fontSize: '1.2em',
    fontStyle: 'italic',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.5px',
  }

  const deityNamesStyles = {
    color: '#f4e6d3',
    fontSize: '1em',
    fontWeight: 600,
    lineHeight: 1.2,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.3px',
  }

  return (
    <Paper style={tooltipStyles}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={contentStyles}>
          <NumberBadge value={hoveredSection.id} size={28} />
          <div style={deityNamesStyles}>{deityNames}</div>
        </div>
        <span style={etruscanTextStyles}>{hoveredSection.etruscanText}</span>
      </div>
    </Paper>
  )
} 