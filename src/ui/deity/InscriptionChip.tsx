import { liverGods } from '../../scene/LiverData'
import { NumberBadge } from '../NumberBadge'

interface InscriptionChipProps {
  inscriptionId: number
  groupColor: string
  associatedGodIds: string[]
  onClick: () => void
  godVariation?: string | null
}

export function InscriptionChip({ inscriptionId, groupColor, associatedGodIds, onClick, godVariation }: InscriptionChipProps) {
  const associatedGods = associatedGodIds.map(id => (liverGods as any)[id]).filter(Boolean)
  
  return (
    <button
      onClick={onClick}
      className="inscription-chip inline-flex items-center gap-2 text-dark-text transition-all duration-200 hover:scale-105 cursor-pointer"
      title={`Go to inscription ${inscriptionId}${associatedGods.length > 0 ? ` (with ${associatedGods.map(g => g.name).join(', ')})` : ''}`}
    >
      <NumberBadge value={inscriptionId} size={24} color={groupColor} />
      
      {godVariation && (
        <span className="text-sm">
          <span className="opacity-60 font-light text-xs">
            as{' '}
          </span>
          <span className="font-bold" style={{ color: groupColor }}>
            {godVariation}
          </span>
        </span>
      )}

      {associatedGods.length > 0 && (
        <span className="text-sm">
          <span className="opacity-60 font-light text-xs">
            with{' '}
          </span>
          <span className="font-bold" style={{ color: groupColor }}>
            {associatedGods.map(g => g.name).join(', ')}
          </span>
        </span>
      )}
    </button>
  )
}
