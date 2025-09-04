import { NumberBadge } from '../NumberBadge'
import { isMobile } from 'react-device-detect'

interface PanelHeaderProps {
  selectedInscription: any
  deityNames: string
  onClose: () => void
  getTextClass: (type: string) => string
}

export function PanelHeader({ selectedInscription, deityNames, onClose, getTextClass }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <div className="grid grid-cols-[max-content_1fr] auto-rows-auto gap-x-2 gap-y-1 items-center">
        <NumberBadge value={selectedInscription.id} size={40} />
        <h2 className={`m-0 text-dark-text text-shadow-bronze col-start-2 self-center font-garamond font-semibold ${isMobile ? 'text-xl' : 'text-2xl'} ${getTextClass('title')}`}>
          {deityNames}
        </h2>
        <span className={`text-etruscan col-span-2 row-start-2 ${isMobile ? 'text-lg' : 'text-base'} ${getTextClass('etruscan')}`}>
          {selectedInscription.etruscanText}
        </span>
      </div>
      
      <button
        onClick={onClose}
        aria-label="Close panel"
        title="Close panel"
        className={`
          w-8 h-8 rounded-full 
          bg-dark-text/10 border border-dark-text/30 
          hover:bg-dark-text/20 hover:border-dark-text/50
          active:scale-95
          flex items-center justify-center
          text-dark-text/80 hover:text-dark-text
          transition-all duration-200
          backdrop-blur-sm
          ${isMobile ? 'w-10 h-10 text-lg' : 'text-sm'}
        `}
      >
        {isMobile ? '✕' : '×'}
      </button>
    </div>
  )
}
