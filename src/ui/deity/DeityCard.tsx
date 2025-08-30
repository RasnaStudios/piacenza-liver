import { InscriptionChip } from './InscriptionChip'
import { getGodInscriptionData, getGodVariationInInscription } from '../../utils/liverUtils'
import {
  getDeityCardStyles,
  getDeityHeaderStyles,
  getDeityNameStyles,
  getDeityScriptStyles,
  getAboutSectionStyles,
  getDomainSectionStyles,
  getSectionHeaderStyles,
  getSectionLabelStyles,
  getSectionTextStyles,
  getInscriptionSectionStyles,
  getInscriptionHeaderStyles,
  getInscriptionTitleStyles,
  getInscriptionChipsStyles
} from './styles'

interface DeityCardProps {
  god: any
  getTextClass: (type: string) => string
  onInscriptionClick?: (inscriptionId: number) => void
  selectedInscriptionId?: number
}

export function DeityCard({ god, getTextClass, onInscriptionClick, selectedInscriptionId }: DeityCardProps) {
  const godData = getGodInscriptionData(god.id)
  const { godInscriptions } = godData
  
  // Filter out the currently selected inscription
  const filteredInscriptions = godInscriptions.filter(inscription => 
    inscription.id !== selectedInscriptionId
  )

  return (
    <div style={getDeityCardStyles()}>
      <div style={getDeityHeaderStyles()}>
        <h4 style={getDeityNameStyles()} className={getTextClass('subsection-title')}>
          {god.name}
        </h4>
        <span style={getDeityScriptStyles()} className={getTextClass('label')}>
          {god.etruscanScript}
        </span>
      </div>
      
      {/* About - First */}
      <div style={getAboutSectionStyles()}>
        <div style={getSectionHeaderStyles()}>
          <span style={getSectionLabelStyles()} className={getTextClass('label')}>About</span>
        </div>
        <p style={getSectionTextStyles()} className={getTextClass('body')}>{god.description}</p>
      </div>

      {/* Domain - Second */}
      <div style={getDomainSectionStyles()}>
        <div style={getSectionHeaderStyles()}>
          <span style={getSectionLabelStyles()} className={getTextClass('label')}>Domain</span>
        </div>
        <p style={getSectionTextStyles()} className={getTextClass('body')}>{god.domain}</p>
      </div>

      {/* Also appears in inscriptions */}
      {filteredInscriptions.length > 0 && (
        <div style={getInscriptionSectionStyles()}>
          <div style={getInscriptionHeaderStyles()}>
            <h5 style={getInscriptionTitleStyles()} className={getTextClass('label')}>ALSO Appears in:</h5>
          </div>
          <div style={getInscriptionChipsStyles()}>
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
