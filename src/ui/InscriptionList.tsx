import { useState, useEffect, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { liverInscriptions, liverGods } from '../scene/LiverData'
import { getInscriptionGroup } from '../utils/liverUtils'
import { NumberBadge } from './NumberBadge'

interface InscriptionListProps {
  onInscriptionSelect: (inscription: any) => void
  selectedInscription: any
  isLoading: boolean
  hasInteracted: boolean
}

export function InscriptionList({ 
  onInscriptionSelect, 
  selectedInscription, 
  isLoading, 
  hasInteracted 
}: InscriptionListProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inscriptionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.matchMedia('(orientation: portrait)').matches)
    }
    
    checkOrientation()
    const mediaQuery = window.matchMedia('(orientation: portrait)')
    mediaQuery.addEventListener('change', checkOrientation)
    
    return () => mediaQuery.removeEventListener('change', checkOrientation)
  }, [])
  

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show on desktop landscape - hide completely in portrait
      const shouldShow = hasInteracted && !isLoading && !isPortrait && !isMobile
      setIsVisible(shouldShow)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [hasInteracted, isLoading, isMobile, isPortrait])

  // Auto-scroll to selected inscription
  useEffect(() => {
    if (selectedInscription && inscriptionRefs.current[selectedInscription.id]) {
      const element = inscriptionRefs.current[selectedInscription.id]
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }, [selectedInscription])

  // Hide in portrait mode completely
  const shouldHide = isLoading || !hasInteracted || !isVisible || isPortrait
  
  if (shouldHide) {
    return null
  }

  const renderInscription = (inscription: any) => {
    
    return (
      <div
        key={inscription.id}
        ref={(el: HTMLDivElement | null) => { inscriptionRefs.current[inscription.id] = el }}
        className={`dark-chip-padded cursor-pointer transition-all duration-200 flex items-center gap-2 ${
          inscription.id === selectedInscription?.id 
            ? 'inscription-selected' 
            : 'hover:ring-1 hover:ring-bronze-600/40'
        }`}
        onClick={() => onInscriptionSelect(inscription)}
      >
        <NumberBadge value={inscription.id} size={24} color={getInscriptionGroup(inscription.id)?.color} />
        <div className="flex-1 flex items-center">
          <span className="text-bronze-600/90 font-normal leading-tight font-serif whitespace-nowrap overflow-hidden text-ellipsis text-sm">
            {inscription.gods.map((godId: string) => (liverGods as any)[godId]?.name).filter(Boolean).join(', ')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="dark-chip fixed top-0 bottom-0 left-0 w-50 rounded-r-xl z-[1000] flex flex-col p-3">
      <div
        className="deity-panel-scrollbar flex-1 overflow-y-scroll overflow-x-hidden touch-pan-y pointer-events-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onWheel={(e) => {
          e.stopPropagation()
        }}
      >
        {liverInscriptions.map(renderInscription)}
      </div>
    </div>
  )
}
