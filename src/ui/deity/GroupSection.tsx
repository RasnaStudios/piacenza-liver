import { getInscriptionGroup } from '../../utils/liverUtils'
import { isMobile } from 'react-device-detect'

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
    <div className="group-section">
      <div className="group-header">
        <div 
          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
          style={{ backgroundColor: group.color }}
        />
        <h3 className={`text-group-title m-0 ml-10 ${isMobile ? 'text-2xl' : 'text-xl'} ${getTextClass('section-title')}`}>
          {group.name}
        </h3>
      </div>
      
      <p className={`text-group-description ${getTextClass('body')}`}>
        {group.description}
      </p>
      
      <div className="mt-6">
        <h4 className={`text-cosmological-title m-0 mb-3 ${isMobile ? 'text-xl' : 'text-lg'} ${getTextClass('subsection-title')}`}>
          Cosmological Meaning
        </h4>
        <p className={`text-cosmological-text ${getTextClass('body')}`}>
          {group.cosmologicalMeaning}
        </p>
      </div>
    </div>
  )
}
