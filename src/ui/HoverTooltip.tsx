import { liverGods } from '../scene/LiverData'
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
  
  // Don't show tooltip if mobile, no hovered section, modifier keys are pressed, cursor is outside canvas, panel is open, or cursor is over panel
  if (!hoveredSection || isMobile || isModifierKeyPressed || mousePosition.isOverCanvas === false || isPanelOpen || isMouseOverPanel) {
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


  return (
    <div className="dark-chip-padded fixed z-[9999] pointer-events-none max-w-xs"
         style={{
           left: tooltipStyles.left,
           top: tooltipStyles.top,
         }}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <NumberBadge value={hoveredSection.id} size={28} />
          <div className="text-deity-name font-medium text-sm leading-tight">{deityNames}</div>
        </div>
        <span className="text-etruscan text-xs italic opacity-90">{hoveredSection.etruscanText}</span>
      </div>
    </div>
  )
} 