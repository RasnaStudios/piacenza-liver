import { NumberBadge } from '../NumberBadge'
import { 
  getHeaderStyles, 
  getHeaderLeftStyles, 
  getTitleStyles, 
  getEtruscanTextStyles, 
  getCloseButtonStyles 
} from './styles'
import { isMobile } from 'react-device-detect'

interface PanelHeaderProps {
  selectedInscription: any
  deityNames: string
  onClose: () => void
  getTextClass: (type: string) => string
}

export function PanelHeader({ selectedInscription, deityNames, onClose, getTextClass }: PanelHeaderProps) {
  return (
    <div style={getHeaderStyles()} className="panel-header">
      <div style={getHeaderLeftStyles()}>
        <NumberBadge value={selectedInscription.id} size={40} />
        <h2 style={getTitleStyles()} className={getTextClass('title')}>
          {deityNames}
        </h2>
        <span style={getEtruscanTextStyles()} className={getTextClass('etruscan')}>
          {selectedInscription.etruscanText}
        </span>
      </div>
      
      
      <button
        onClick={onClose}
        aria-label="Close panel"
        title="Close panel"
        style={getCloseButtonStyles()}
      >
        {isMobile ? '✕' : '×'}
      </button>
    </div>
  )
}
