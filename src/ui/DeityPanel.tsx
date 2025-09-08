import { useState, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { liverGods, liverInscriptions } from '../scene/LiverData'
import { GroupSection } from './deity/GroupSection'
import { DeityCard } from './deity/DeityCard'
import { PanelHeader } from './deity/PanelHeader'

interface DeityPanelProps {
  selectedInscription: any
  onClose: () => void
  onInscriptionSelect?: (inscription: any) => void
}

export function DeityPanel({ selectedInscription, onClose, onInscriptionSelect }: DeityPanelProps) {
  const isPortrait = window.matchMedia('(orientation: portrait)').matches
  const [panelHeight, setPanelHeight] = useState(33) // Start at 33vh
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef(0)
  const prevInscriptionId = useRef<number | null>(null)
  
  // Reset to lower third when new inscription is selected
  if (selectedInscription && selectedInscription.id !== prevInscriptionId.current) {
    setPanelHeight(33)
    prevInscriptionId.current = selectedInscription.id
  }
  
  if (!selectedInscription) return null

  // Fix gods data structure - use selectedInscription.gods like original
  const gods = selectedInscription.gods?.map((godId: string) => (liverGods as any)[godId]).filter(Boolean) || []
  const deityNames = gods.map((g: any) => g.name).join(' + ')

  

  const handleDragStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    dragStartY.current = e.touches[0].clientY
    e.stopPropagation()
  }

  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - dragStartY.current
    setDragOffset(deltaY)
    e.stopPropagation()
  }

  const handleDragEnd = (e: React.TouchEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    
    // Calculate actual panel position relative to viewport bottom
    const viewportHeight = window.innerHeight
    const currentPanelHeight = (panelHeight / 100) * viewportHeight
    const panelBottomPosition = dragOffset // How far panel moved from bottom
    
    // Only close if dragged down more than the current panel height
    if (panelBottomPosition > currentPanelHeight) {
      onClose()
    } else {
      // Save the new position based on drag direction
      if (dragOffset < 0) {
        // Dragged up - expand panel
        const dragUpDistance = Math.abs(dragOffset)
        const heightIncrease = (dragUpDistance / viewportHeight) * 100 // Convert to vh
        setPanelHeight(Math.min(90, Math.max(33, panelHeight + heightIncrease)))
      } else if (dragOffset > 0) {
        // Dragged down - contract panel
        const dragDownDistance = dragOffset
        const heightDecrease = (dragDownDistance / viewportHeight) * 100 // Convert to vh
        setPanelHeight(Math.min(90, Math.max(33, panelHeight - heightDecrease)))
      }
    }
    
    setDragOffset(0)
    e.stopPropagation()
  }


  const getCurrentHeight = () => {
    if (isDragging) {
      const viewportHeight = window.innerHeight
      if (dragOffset > 0) {
        // When dragging down, show live height decrease
        const dragDownDistance = dragOffset
        const heightDecrease = (dragDownDistance / viewportHeight) * 100
        return Math.min(90, Math.max(33, panelHeight - heightDecrease))
      } else if (dragOffset < 0) {
        // When dragging up, show live height increase
        const dragUpDistance = Math.abs(dragOffset)
        const heightIncrease = (dragUpDistance / viewportHeight) * 100
        return Math.min(90, Math.max(33, panelHeight + heightIncrease))
      }
    }
    return panelHeight
  }

  // Mobile portrait: custom bottom sheet
  if (isMobile && isPortrait) {
    return (
      <div
        className="dark-chip fixed bottom-0 left-0 right-0 rounded-t-2xl z-[100] flex flex-col pointer-events-auto transition-all duration-300 ease-out"
        style={{
          height: `${getCurrentHeight()}vh`,
          ...(isDragging && { transition: 'none' }),
        }}
      >
        <div 
          className="drag-handle flex justify-center items-center py-2 cursor-grab"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-10 h-1 bg-bronze-600/70 rounded-sm" />
        </div>
        
        <div className="flex-1 text-dark-text overflow-hidden flex flex-col">
          <div
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            className="cursor-grab"
          >
            <PanelHeader 
              selectedInscription={selectedInscription}
              deityNames={deityNames}
              onClose={onClose}
            />
          </div>
        <div className="deity-panel-scrollbar flex-1 overflow-y-scroll overflow-x-hidden text-dark-text min-h-0 touch-pan-y">
          <div className="px-6 py-4">
          
          <h4 className="panel-section-header text-xl sm:text-2xl">
            Involved deities
          </h4>
          
          <div className="flex flex-col gap-4 mb-6">
            {gods.map((god: any) => (
              <DeityCard
                key={god.id}
                god={god}
                selectedInscriptionId={selectedInscription.id}
                onInscriptionClick={(inscriptionId) => {
                  const inscription = liverInscriptions.find((ins: any) => ins.id === inscriptionId)
                  if (inscription && onInscriptionSelect) {
                    // First: Lower the panel to 33vh
                    setPanelHeight(33)
                    // Then: Trigger camera animation and new inscription selection
                    setTimeout(() => {
                      onInscriptionSelect(inscription)
                    }, 100)
                  }
                }}
              />
            ))}
          </div>
          

          <div className="pb-6">
            <GroupSection 
              selectedInscription={selectedInscription}
            />
          </div>
          </div>
        </div>
        </div>
      </div>
    )
  }

  // Desktop/landscape: right side panel
  return (
    <div className={`deity-panel-desktop ${selectedInscription ? 'open' : ''}`}>
      <PanelHeader 
        selectedInscription={selectedInscription}
        deityNames={deityNames}
        onClose={onClose}
      />
      <div className="deity-panel-scrollbar panel-content overflow-y-scroll overflow-x-hidden min-h-0 p-4 sm:p-6">
        <div className="mb-6">
          <div className="mb-3">
            <h5 className="section-label text-bronze-600/90 m-0 text-base sm:text-lg">
              Involved deities
            </h5>
          </div>
          
          <div className="deities-section">
            {gods.map((god: any) => (
              <DeityCard
                key={god.id}
                god={god}
                selectedInscriptionId={selectedInscription.id}
                onInscriptionClick={(inscriptionId) => {
                  const inscription = liverInscriptions.find((ins: any) => ins.id === inscriptionId)
                  if (inscription && onInscriptionSelect) {
                    onInscriptionSelect(inscription)
                  }
                }}
              />
            ))}
          </div>
        </div>
          
        <div className="m-8">
          <h5 className="section-label text-bronze-600/90 text-base sm:text-lg">
            Group
          </h5>
        </div>

        <GroupSection 
          selectedInscription={selectedInscription}
        />
      </div>
    </div>
  )
}
