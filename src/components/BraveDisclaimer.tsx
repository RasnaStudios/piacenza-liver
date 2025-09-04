import { useEffect, useState } from 'react'

export function BraveDisclaimer() {
  const [showModal, setShowModal] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Don't show on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      return
    }

    // Check if browser is Brave
    const userAgent = navigator.userAgent
    const isBraveUA = userAgent.includes('Brave') || userAgent.includes('brave')
    const hasBraveAPI = (navigator as any).brave && (navigator as any).brave.isBrave
    
    if (!isBraveUA && !hasBraveAPI) {
      return // Not Brave browser
    }

    // Check if user has previously dismissed the warning
    const dismissed = localStorage.getItem('brave-shields-disclaimer-dismissed')
    if (dismissed === 'true') {
      return
    }

    // Since shield detection is unreliable, just show for all Brave users
    // but make it less intrusive by showing after a delay
    setTimeout(() => {
      setShowModal(true)
    }, 2000)
  }, [])

  const handleDismiss = () => {
    setShowModal(false)
    if (dontShowAgain) {
      localStorage.setItem('brave-shields-disclaimer-dismissed', 'true')
    }
  }

  if (!showModal) {
    return null
  }

  return (
    <>
        {/* Modal backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={handleDismiss}
        >
          {/* Modal content */}
          <div
            style={{
              backgroundColor: '#0a0806',
              border: '2px solid rgba(139, 101, 65, 0.6)',
              borderRadius: 12,
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(139, 101, 65, 0.2)',
              textAlign: 'center' as const,
              color: '#f4e6d3',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 28, marginBottom: 16, opacity: 0.8 }}>🛡️</div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 500, color: '#f4e6d3' }}>
              Brave Browser Notice
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: 15, lineHeight: 1.5, color: '#c9a876' }}>
            For reliable inscription selection, please disable Brave Shields for this site.
            We don't save any personal data and we don't use any analytics.
            We cannot detect if your shields are enabled, so if you have already disabled them,
            please check the checkbox below.
            </p>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#c9a876'
            }}>
              <input
                type="checkbox"
                id="dont-show-again"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{
                  accentColor: '#d4af37',
                  transform: 'scale(1.1)'
                }}
              />
              <label htmlFor="dont-show-again" style={{ cursor: 'pointer' }}>
                Don't show again
              </label>
            </div>
            
            <button
              onClick={handleDismiss}
              style={{
                background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #d4af37 100%)',
                color: '#0a0806',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 6,
                fontSize: 15,
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              Continue
            </button>
          </div>
        </div>
    </>
  )
}
