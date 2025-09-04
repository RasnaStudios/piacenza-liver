import { useState, useEffect } from 'react'

interface BraveDisclaimerProps {}

export function BraveDisclaimer({}: BraveDisclaimerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const hasOptedOut = localStorage.getItem('brave-disclaimer-dismissed') === 'true'
    if (hasOptedOut) return

    const isBrave = () => {
      if ((navigator as any).brave && (navigator as any).brave.isBrave) {
        return true
      }
      
      if (navigator.userAgent.includes('Brave')) {
        return true
      }
      
      if ('webkitSpeechRecognition' in window && 'chrome' in window && !('opr' in window) && !navigator.userAgent.includes('edg')) {
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        if (!isChrome) {
          return true
        }
      }
      
      return false
    }

    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isBrave() && isDesktop) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    
    if (dontShowAgain) {
      localStorage.setItem('brave-disclaimer-dismissed', 'true')
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-5"
      onClick={handleClose}
    >
      <div 
        className="backdrop-blur-md rounded-2xl max-w-md w-full relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          padding: '32px',
          backgroundColor: 'rgba(10, 8, 6, 0.95)',
          border: 'none'
        }}
      >
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full"
            style={{ 
              marginBottom: '20px',
              backgroundColor: 'rgba(139, 101, 65, 0.2)',
              border: 'none'
            }}
          >
            <span className="text-2xl">🛡️</span>
          </div>
          <h3 className="text-dark-text text-lg font-bold font-garamond">
            Brave Browser Detected
          </h3>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <p className="text-dark-text/90 text-xl leading-relaxed text-center" style={{ marginBottom: '16px' }}>
            Brave Shields will interfere with inscription selection on this 3D visualization.
          </p>
          
          <p className="text-bronze-600 text-center font-medium">
            Please disable Shields for optimal experience. We don't have a way to detect Shields, so please check the box below if you have already disabled them
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label className="flex items-center justify-center cursor-pointer group">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 accent-bronze-600 rounded"
              style={{ marginRight: '12px' }}
            />
            <span className="text-dark-text/80 group-hover:text-dark-text transition-colors">
              Don't show this again
            </span>
          </label>
        </div>

        <button
          onClick={handleClose}
          className="rounded-full text-sm font-semibold w-full transition-colors shadow-lg"
          style={{ 
            padding: '16px 32px',
            backgroundColor: '#8b6541',
            color: '#0a0806',
            border: 'none',
            outline: 'none'
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7a5937'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8b6541'}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
