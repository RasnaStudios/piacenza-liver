import { 
  Paper
} from '@mantine/core'
import { liverGods } from '../../scene/LiverData'
import { NumberBadge } from './NumberBadge'
import { isMobile } from 'react-device-detect'

interface HoverTooltipProps {
  hoveredSection: any
  mousePosition: { x: number; y: number; isOverCanvas?: boolean }
  isPanelOpen?: boolean
  isModifierKeyPressed?: boolean
  isMouseOverPanel?: boolean
}

export function HoverTooltip({ hoveredSection, mousePosition, isPanelOpen = false, isModifierKeyPressed = false, isMouseOverPanel = false }: HoverTooltipProps) {
  
  // Don't show tooltip if mobile, no hovered section, modifier keys are pressed, cursor is outside canvas, or cursor is over panel
  if (!hoveredSection || isMobile || isModifierKeyPressed || mousePosition.isOverCanvas === false || isMouseOverPanel) {
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
    background: 'var(--gradient-tooltip)',
    borderRadius: 12,
    padding: '6px 10px',
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

  return (
    <Paper style={tooltipStyles} className="text-primary panel-border">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <NumberBadge value={hoveredSection.id} size={28} />
          <div className="text-primary" style={{ fontSize: '1em', fontWeight: 600, lineHeight: 1.2, letterSpacing: '0.3px' }}>
            {deityNames}
          </div>
        </div>
        <span className="font-etruscan text-gradient-gold" style={{ fontSize: '1.2em', fontStyle: 'italic', letterSpacing: '0.5px' }}>
          {hoveredSection.etruscanText}
        </span>
      </div>
    </Paper>
  )
} 