import { NumberBadge } from '../NumberBadge'

interface PanelHeaderProps {
  selectedInscription: any
  deityNames: string
  onClose: () => void
}

export function PanelHeader({ selectedInscription, deityNames, onClose }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <div className="grid grid-cols-[max-content_1fr] auto-rows-auto gap-x-2 gap-y-1 items-center">
        <NumberBadge value={selectedInscription.id} size={40} />
        <h2 className="m-0 text-dark-text text-shadow-bronze col-start-2 self-center font-garamond font-semibold text-xl sm:text-2xl">
          {deityNames}
        </h2>
        <span className="text-etruscan col-span-2 row-start-2 text-base sm:text-lg">
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
          w-8 h-8 text-sm sm:w-10 sm:h-10 sm:text-lg
        `}
      >
        <span className="sm:hidden">✕</span><span className="hidden sm:inline">×</span>
      </button>
    </div>
  )
}
