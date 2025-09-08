import { InscriptionChip } from './InscriptionChip'
import { getGodInscriptionData, getGodVariationInInscription } from '../../utils/liverUtils'

interface DeityCardProps {
  god: any
  onInscriptionClick?: (inscriptionId: number) => void
  selectedInscriptionId?: number
}

export function DeityCard({ god, onInscriptionClick, selectedInscriptionId }: DeityCardProps) {
  const godData = getGodInscriptionData(god.id)
  const { godInscriptions } = godData
  
  const filteredInscriptions = godInscriptions.filter(inscription => 
    inscription.id !== selectedInscriptionId
  )

  return (
    <div className="deity-card">
      <div className="deity-header">
        <h4 className="text-deity-name m-0 text-lg sm:text-xl">
          {god.name}
        </h4>
        <span className="font-italic text-dark-text/70 text-shadow-subtle text-lg sm:text-xl">
          {god.etruscanScript}
        </span>
      </div>
      
      <div className="bg-bronze-600/3 rounded-card">
        <span className="section-label">About</span>
        <p className="section-text">{god.description}</p>
      </div>

      <div className="bg-bronze-600/5 rounded-card">
        <span className="section-label">Domain</span>
        <p className="section-text">{god.domain}</p>
      </div>

      {filteredInscriptions.length > 0 && (
        <div className="mt-5">
          <h5 className="section-label text-bronze-600/90 m-0 text-lg sm:text-xl">
            ALSO Appears in:
          </h5>
          <div className="flex flex-wrap gap-1 p-2 -m-2">
            {filteredInscriptions.map(inscription => (
              <InscriptionChip
                key={inscription.id}
                inscriptionId={inscription.id}
                groupColor={inscription.groupColor}
                associatedGodIds={inscription.otherGods}
                onClick={() => onInscriptionClick?.(inscription.id)}
                godVariation={getGodVariationInInscription(god.id, inscription.id)}
              />
            ))}
          </div>
        </div>
      )}
      
    </div>
  )
}
