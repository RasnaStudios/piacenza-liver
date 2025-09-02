import { getInscriptionGroup } from '../../utils/liverUtils'
import { getGroupSectionStyles, getGroupHeaderStyles, getGroupColorDotStyles, getGroupTitleStyles, getGroupDescriptionStyles, getCosmologicalTitleStyles, getCosmologicalTextStyles } from './styles'

interface GroupSectionProps {
  selectedInscription: any
  getTextClass: (type: string) => string
}

export function GroupSection({ selectedInscription, getTextClass }: GroupSectionProps) {
  const group = getInscriptionGroup(selectedInscription.id)

  if (!group) {
    return null
  }

  return (
    <div style={getGroupSectionStyles()}>
      <div style={getGroupHeaderStyles()}>
        <div style={getGroupColorDotStyles(group.color)} />
        <h3 style={getGroupTitleStyles()} className={getTextClass('section-title')}>
          {group.name}
        </h3>
      </div>
      <p style={getGroupDescriptionStyles()} className={getTextClass('body')}>
        {group.description}
      </p>
      <div>
        <h4 style={getCosmologicalTitleStyles()} className={getTextClass('subsection-title')}>
          Cosmological Meaning
        </h4>
        <p style={getCosmologicalTextStyles()} className={getTextClass('body')}>
          {group.cosmologicalMeaning}
        </p>
      </div>
    </div>
  )
}
