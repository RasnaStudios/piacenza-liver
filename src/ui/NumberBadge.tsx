import { Badge } from '@mantine/core'
import { liverInscriptions, liverGroups } from '../scene/LiverData'

interface NumberBadgeProps {
  value: number | string
  color?: string
  size?: number // diameter in px; default 28 to match tooltip
}

export function NumberBadge({ value, color, size = 28 }: NumberBadgeProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size
  const fontSize = Math.max(11, Math.round((Number(size) || 28) * 0.46))

  // Resolve color from data if not provided
  let resolvedColor = color
  if (!resolvedColor) {
    const numericId = typeof value === 'number' ? value : parseInt(String(value), 10)
    if (!Number.isNaN(numericId)) {
      const ins = (liverInscriptions as any[]).find((i: any) => i.id === numericId)
      if (ins) {
        const group = (liverGroups as any)[ins.groupId]
        resolvedColor = group?.color || resolvedColor
      }
    }
  }

  return (
    <Badge
      size="sm"
      variant="filled"
      style={{
        backgroundColor: resolvedColor || '#ccc',
        color: '#000',
        border: '2px solid rgba(0, 0, 0, 0.3)',
        boxShadow:
          '0 3px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: dimension,
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        fontSize: `${fontSize}px`,
        fontWeight: 900,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
        padding: 0,
        lineHeight: 1,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {value}
    </Badge>
  )
}
