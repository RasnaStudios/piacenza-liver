import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa'
import { SiArtstation } from 'react-icons/si'

interface LegendProps {
  hasInteracted: boolean
}

export function Legend({ hasInteracted }: LegendProps) {
  const [platform, setPlatform] = useState('mac')
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // Mobile drag state
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Auto-open on first load if user hasn't interacted yet
  useEffect(() => {
    setIsOpen(!hasInteracted)
  }, [hasInteracted])


  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) {
      setPlatform('mac')
    } else if (userAgent.includes('win')) {
      setPlatform('windows')
    } else {
      setPlatform('linux')
    }
  }, [])

  const getControlsText = () => {
    const modifier = platform === 'mac' ? '⌘' : 'Alt'
    const shift = '⇧'
    return [
      'Mouse: rotate',
      `${modifier} + mouse: pan`,
      'Scroll: zoom',
      'Double-click: reset view',
      `${shift} + drag: move model`
    ]
  }
  
  const getMobileControlsText = () => {
    return [
      'Touch: rotate',
      'Pinch: zoom', 
      'Double-tap: reset view'
    ]
  }

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
      onDoubleClick={() => setIsOpen((v) => !v)}
    >
      {/* Thumbnail Tab (panel slides over this) */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 bg-black/85 backdrop-blur border border-bronze-600/40 border-b-0 rounded-t-lg px-3.5 py-2 text-[#c4a876]/90 text-xs font-semibold font-serif tracking-wide cursor-pointer select-none text-center min-w-[200px] shadow-lg transition-all duration-200"
        onClick={() => setIsOpen((v) => !v)}
        onTouchStart={() => setIsOpen((v) => !v)}
        onMouseEnter={(e) => {
          setIsHovered(true)
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)'
          e.currentTarget.style.color = 'rgba(212, 175, 55, 0.95)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)'
          e.currentTarget.style.borderColor = 'rgba(139, 101, 65, 0.4)'
          e.currentTarget.style.color = 'rgba(196, 168, 118, 0.9)'
        }}
      >
        Credits and Controls
      </div>

      <div 
        className={`absolute z-[1] text-[#c4a876]/60 font-serif text-sm pointer-events-auto select-none bg-black/90 backdrop-blur-lg rounded-t-lg overflow-visible transition-all duration-300 border border-bronze-600/40 w-[90vw] max-w-[460px] md:w-[440px] left-1/2 -translate-x-1/2 leading-tight md:leading-normal ${isDragging ? 'transition-none' : ''} ${isOpen || (!isMobile && isHovered) ? 'bottom-0' : '-bottom-[300px]'}`}
        style={{
          transform: isMobile
            ? `translate(-50%, ${isOpen ? dragY : 0}px)`
            : undefined,
          opacity: isMobile && isOpen ? Math.max(0.6, 1 - dragY / 600) : undefined,
        }}
        onMouseLeave={() => { if (!isOpen) setIsHovered(false) }}
        onTouchStart={(e) => {
          if (!isMobile) return
          setIsDragging(true)
          setTouchStartY(e.touches[0].clientY)
          setDragY(0)
        }}
        onTouchMove={(e) => {
          if (!isMobile || !isDragging || touchStartY === null) return
          const currentY = e.touches[0].clientY
          const dy = Math.max(0, currentY - touchStartY)
          setDragY(dy)
        }}
        onTouchEnd={() => {
          if (!isMobile) return
          const threshold = 120
          if (dragY > threshold) {
            setIsOpen(false)
            setIsHovered(false)
          }
          setIsDragging(false)
          setTouchStartY(null)
          setDragY(0)
        }}
      >
      {isMobile && (
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-9 h-1 rounded-sm bg-[#c4a876]/35" />
      )}
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_1px_minmax(160px,max-content)] md:items-start md:gap-8">
        {/* Left side: Names */}
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            <div className={`text-white/90 ${isMobile ? 'text-[13px]' : 'text-sm'} font-medium flex items-center gap-3 mb-2`}>
              <span className="whitespace-nowrap">Lorenzo Andraghetti</span>
              <div className="flex gap-2">
                <a 
                  href="https://linkedin.com/in/andraghetti" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0077b5] text-sm no-underline"
                >
                  <FaLinkedin />
                </a>
                <a 
                href="https://github.com/andraghetti" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#333] text-sm no-underline"
                >
                  <FaGithub />
                </a>
              </div>
              <span className={`text-[#c4a876]/70 ${isMobile ? 'text-[11px]' : 'text-xs'} italic ml-2`}>
                Developer
              </span>
            </div>
            
            <div className={`text-white/90 ${isMobile ? 'text-[13px]' : 'text-sm'} font-medium flex items-center gap-3 mb-2`}>
              <span className="whitespace-nowrap">Luca Tampieri</span>
              <div className="flex gap-2">
                <a 
                  href="https://linkedin.com/in/luca-tampieri" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0077b5] text-sm no-underline"
                >
                  <FaLinkedin />
                </a>
                <a 
                  href="https://www.artstation.com/lukedt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#13aff0] text-sm no-underline"
                >
                  <SiArtstation />
                </a>
                <a 
                  href="https://www.instagram.com/heythereluke/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#e4405f] text-sm no-underline"
                >
                  <FaInstagram />
                </a>
              </div>
              <span className={`text-[#c4a876]/70 ${isMobile ? 'text-[11px]' : 'text-xs'} italic ml-2`}>
                3D Artist
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-bronze-600/30">
            <a 
              href="https://github.com/rasnastudios" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pointer-events-auto text-inherit no-underline transition-all duration-200 text-[#c4a876]/80 text-[11px] md:text-xs hover:text-[#d4af37]/90"
            >
              Rasna Studios
            </a>
            
            <a 
              href="https://github.com/rasnastudios/piacenza-liver" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pointer-events-auto text-inherit no-underline transition-all duration-200 inline-flex items-center gap-1 text-[#c4a876]/80 text-[11px] md:text-xs hover:text-[#d4af37]/90"
            >
              Contribute
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Vertical separator (desktop only) */}
        <div className="hidden md:block w-px h-[50px] bg-bronze-600/40 self-center" />

        {/* Right side: Controls */}
        <div className="flex-shrink-0 min-w-[160px] w-max">
          <div className="text-[#d4af37]/90 text-xs md:text-[13px] font-semibold mb-3 uppercase tracking-wider">
            Controls
          </div>
          
          {(isMobile ? getMobileControlsText() : getControlsText()).map((control, index) => (
            <div
              key={index}
              className={`text-[#c4a876]/80 text-[11px] md:text-xs block leading-relaxed ${index === (isMobile ? getMobileControlsText() : getControlsText()).length - 1 ? '' : 'mb-1'}`}
            >
              {control}
            </div>
          ))}
        </div>
        </div>
      </div>
      </div>
    </div>
  )
} 