import { useState, useEffect } from 'react'
import { loadDeityContent, getBasicDeityInfo } from '../utils/deityLoader'

export function DeityPanel({ selectedSection, onClose }) {
  const [deityData, setDeityData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load deity content when section changes
  useEffect(() => {
    if (selectedSection && selectedSection.docFile) {
      setLoading(true)
      loadDeityContent(selectedSection.docFile)
        .then(data => {
          if (data) {
            setDeityData(data)
          } else {
            // Fallback to basic info
            const basicInfo = getBasicDeityInfo(selectedSection.name)
            setDeityData({
              name: selectedSection.name,
              romanEquivalent: basicInfo.romanEquivalent,
              description: basicInfo.description,
              divinationMeaning: [],
              historicalContext: '',
              hepatoscopyFavorable: [],
              hepatoscopyUnfavorable: [],
              ritualAssociations: []
            })
          }
        })
        .catch(error => {
          console.error('Error loading deity data:', error)
          // Fallback to basic info
          const basicInfo = getBasicDeityInfo(selectedSection.name)
          setDeityData({
            name: selectedSection.name,
            romanEquivalent: basicInfo.romanEquivalent,
            description: basicInfo.description,
            divinationMeaning: [],
            historicalContext: '',
            hepatoscopyFavorable: [],
            hepatoscopyUnfavorable: [],
            ritualAssociations: []
          })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setDeityData(null)
    }
  }, [selectedSection])

  if (!selectedSection) {
    return null
  }

  return (
    <div className="info-panel visible">
      <div className="panel-header">
        <div className="deity-names">
          <h2>{deityData?.name || selectedSection.name}</h2>
          {deityData?.romanEquivalent && (
            <h3>({deityData.romanEquivalent})</h3>
          )}
          <div className="etruscan-inscription">
            <span className="etruscan-label">Etruscan inscription:</span>
            <span className="etruscan-text">{selectedSection.name}</span>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close panel">×</button>
      </div>
      
      <div className="panel-content">
        {loading ? (
          <div className="loading">Loading deity information...</div>
        ) : deityData ? (
          <>
            <div className="description-section">
              <h3>Description</h3>
              <p>{deityData.description}</p>
            </div>

            {deityData.divinationMeaning && deityData.divinationMeaning.length > 0 && (
              <div className="divination-section">
                <h3>Divination Meaning</h3>
                <ul>
                  {deityData.divinationMeaning.map((meaning, index) => (
                    <li key={index}>{meaning}</li>
                  ))}
                </ul>
              </div>
            )}

            {deityData.historicalContext && (
              <div className="historical-section">
                <h3>Historical Context</h3>
                <p>{deityData.historicalContext}</p>
              </div>
            )}

            {deityData.hepatoscopyFavorable && deityData.hepatoscopyFavorable.length > 0 && (
              <div className="hepatoscopy-section">
                <h3>Hepatoscopy Significance</h3>
                <div className="hepatoscopy-subsection">
                  <h4>Favorable Signs:</h4>
                  <ul>
                    {deityData.hepatoscopyFavorable.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
                {deityData.hepatoscopyUnfavorable && deityData.hepatoscopyUnfavorable.length > 0 && (
                  <div className="hepatoscopy-subsection">
                    <h4>Unfavorable Signs:</h4>
                    <ul>
                      {deityData.hepatoscopyUnfavorable.map((sign, index) => (
                        <li key={index}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {deityData.ritualAssociations && deityData.ritualAssociations.length > 0 && (
              <div className="ritual-section">
                <h3>Ritual Associations</h3>
                <ul>
                  {deityData.ritualAssociations.map((ritual, index) => (
                    <li key={index}>{ritual}</li>
                  ))}
                </ul>
                </div>
            )}

            {deityData.symbols && deityData.symbols.length > 0 && (
              <div className="symbols-section">
                <h3>Symbols & Attributes</h3>
                <ul>
                  {deityData.symbols.map((symbol, index) => (
                    <li key={index}>{symbol}</li>
                  ))}
                </ul>
              </div>
            )}

            {deityData.locationOnLiver && (
              <div className="location-section">
                <h3>Location on Liver</h3>
                <p>{deityData.locationOnLiver}</p>
              </div>
            )}

            {deityData.archaeologicalNotes && (
              <div className="archaeological-section">
                <h3>Archaeological Notes</h3>
                <p>{deityData.archaeologicalNotes}</p>
              </div>
            )}
          </>
        ) : (
          <p>{selectedSection.description}</p>
        )}
      </div>
    </div>
  )
} 