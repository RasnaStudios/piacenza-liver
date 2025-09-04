import { liverInscriptions } from '../scene/LiverData'
import { getInscriptionGroup } from '../utils/liverUtils'

interface NumberBadgeProps {
  value: number | string
  color?: string
  size?: number // diameter in px; default 32 to match tooltip
}

export function NumberBadge({ value, size = 32, color }: NumberBadgeProps) {
  const dimension = size

  // Resolve color from data if not provided
  let resolvedColor = color
  if (!resolvedColor) {
    const numericId = typeof value === 'number' ? value : parseInt(String(value), 10)
    if (!Number.isNaN(numericId)) {
      const ins = (liverInscriptions as any[]).find((i: any) => i.id === numericId)
      if (ins) {
        const group = getInscriptionGroup(ins.id)
        resolvedColor = group?.color || resolvedColor
      }
    }
  }

  return (
    <div
      className="flex items-center justify-center rounded-full border-2 border-black/30 shadow-badge font-black leading-none flex-shrink-0 text-black"
      style={{
        backgroundColor: resolvedColor || '#ccc',
        minWidth: dimension,
        width: dimension,
        height: dimension,
        fontSize: `${Math.max(10, (dimension as number) * 0.4)}px`,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
      }}
    >
      {value}
    </div>
  )
}
