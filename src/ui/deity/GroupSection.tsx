import { getInscriptionGroup } from '../../utils/liverUtils'

interface GroupSectionProps {
  selectedInscription: any
}

export function GroupSection({ selectedInscription }: GroupSectionProps) {
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
        <h3 className="text-group-title m-0 ml-10 text-xl sm:text-2xl">
          {group.name}
        </h3>
      </div>
      
      <p className="text-group-description">
        {group.description}
      </p>
      
      <div className="mt-6">
        <h4 className="text-cosmological-title m-0 mb-3 text-lg sm:text-xl">
          Cosmological Meaning
        </h4>
        <p className="text-cosmological-text">
          {group.cosmologicalMeaning}
        </p>
      </div>
    </div>
  )
}
