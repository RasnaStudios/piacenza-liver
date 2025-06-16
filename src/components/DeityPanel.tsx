import React from 'react'
import { liverGroups, liverGods } from '../data/liverData'

interface DeityPanelProps {
  selectedInscription: any
  onClose: () => void
}

export function DeityPanel({ selectedInscription, onClose }: DeityPanelProps) {
  if (!selectedInscription) {
    return null
  }

  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Get the group information
  const group = (liverGroups as any)[selectedInscription.groupId]
  
  // Get the god(s) information
  const gods = selectedInscription.gods.map((godId: string) => (liverGods as any)[godId]).filter(Boolean)

  // Create display names for the header
  const deityNames = gods.map((god: any) => god.name).join(' + ')
  const romanEquivalents = gods.map((god: any) => god.romanEquivalent).filter(Boolean)
  const greekEquivalents = gods.map((god: any) => god.greekEquivalent).filter(Boolean)

  return (
    <div className="info-panel visible">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <div className="section-number-badge">
            {selectedInscription.id}
          </div>
          <div className="deity-names">
            <h2>{deityNames}</h2>
            {romanEquivalents.length > 0 && (
              <h3>Roman: {romanEquivalents.join(', ')}</h3>
            )}
            {greekEquivalents.length > 0 && (
              <h3>Greek: {greekEquivalents.join(', ')}</h3>
            )}
            <div className="etruscan-inscription">
              <span className="etruscan-label">Etruscan inscription:</span>
              <span className="etruscan-text">{selectedInscription.etruscanText}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          aria-label="Close panel"
          title="Close panel"
        >
          {isMobile ? '✕' : '×'}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="panel-content">
        {/* Group Section */}
        <div className="group-section">
          <div className="group-header">
            <div 
              className="group-color-dot" 
              style={{ backgroundColor: group?.color }}
            />
            <h3>{group?.name}</h3>
          </div>
          <div className="group-description">
            {group?.description}
          </div>
          <div className="cosmological-meaning">
            <h4>Cosmological Meaning</h4>
            <p>{group?.cosmologicalMeaning}</p>
          </div>
        </div>

        {/* Deities Section */}
        <div className="deities-section">
          <h3>Deit{gods.length > 1 ? 'ies' : 'y'} Details</h3>
          
          {gods.map((god: any, index: number) => (
            <div key={god.id} className="deity-card">
              <div className="deity-header">
                <h4>{god.name}</h4>
                <span className="deity-script">{god.etruscanScript}</span>
              </div>
              
              <div className="deity-equivalents">
                {god.romanEquivalent && (
                  <span className="roman-equiv">Roman: {god.romanEquivalent}</span>
                )}
                {god.greekEquivalent && (
                  <span className="greek-equiv">Greek: {god.greekEquivalent}</span>
                )}
              </div>
              
              <div className="deity-domain">
                <strong>Domain:</strong> {god.domain}
              </div>
              
              <div className="deity-description">
                {god.description}
              </div>
              
              <div className="deity-divination">
                <strong>Divination Meaning:</strong> {god.divinationMeaning}
              </div>
            </div>
          ))}
        </div>

        {/* Relationship Section (for multiple gods) */}
        {gods.length > 1 && (
          <div className="relationship-section">
            <h3>Why These Gods Appear Together</h3>
            <p>{selectedInscription.relationship}</p>
          </div>
        )}

        {/* Combined Divination Meaning */}
        <div className="combined-divination-section">
          <h3>Combined Divination Meaning</h3>
          <p>{selectedInscription.divinationMeaning}</p>
        </div>
        
        {/* Mobile: Add some bottom padding for better scrolling */}
        {isMobile && <div style={{ height: '40px' }} />}
      </div>
    </div>
  )
} 