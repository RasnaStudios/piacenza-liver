import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  progress: number
  isLoading: boolean
}

interface EtruscanParticle {
  char: string
  x: number
  y: number
  opacity: number
  size: number
  animationDelay: number
  duration: number
  vx: number
  vy: number
  id: number
}

export function LoadingScreen({ progress, isLoading }: LoadingScreenProps) {
  const [isDissolving, setIsDissolving] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if ((progress >= 100 || !isLoading) && !isDissolving) {
      // Start dissolve animation when loading completes (100%) or isLoading becomes false
      setIsDissolving(true)
      
      // Remove from DOM after dissolve animation completes
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 2000) // 2 second dissolve animation
      
      return () => clearTimeout(timer)
    }
  }, [progress, isLoading, isDissolving])

  if (!shouldRender) {
    return null
  }
  const [loadingText, setLoadingText] = useState('Decoding ancient inscriptions')
  const [etruscanParticles, setEtruscanParticles] = useState<EtruscanParticle[]>([])
  
  // Etruscan Old Italic Unicode characters + fallback symbols
  const etruscanChars = [
    '𐌀', '𐌁', '𐌂', '𐌃', '𐌄', '𐌅', '𐌆', '𐌉', '𐌊', '𐌋', '𐌌', '𐌍', '𐌏',
    '𐌐', '𐌑', '𐌒', '𐌓', '𐌔', '𐌕', '𐌖', '𐌗',   '𐌛', '𐌜', '𐌝', '𐌞',
  ]
  
  useEffect(() => {
    const texts = [
      'Decoding ancient inscriptions',
      'Interpreting divine symbols', 
      'Aligning celestial patterns',
      'Unveiling sacred knowledge',
      'Channeling ethereal energies'
    ]
    let currentIndex = 0
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length
      setLoadingText(texts[currentIndex])
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const particles: EtruscanParticle[] = Array.from({ length: 250 }, (_, i) => {
      // Distribute only on left and right sides with density towards borders
      const isLeft = Math.random() < 0.5
      
      // Use squared random for density towards borders
      const densityRandom = Math.random() * Math.random()
      
      const x = isLeft 
        ? densityRandom * 25 // Left side: denser at x=0
        : 100 - (densityRandom * 25) // Right side: denser at x=100
      
      return {
        char: etruscanChars[Math.floor(Math.random() * etruscanChars.length)],
        x,
        y: Math.random() * 100,
        opacity: Math.random() * 0.6 + 0.2,
        size: Math.random() * 10 + 4,
        animationDelay: Math.random() * 25,
        duration: Math.random() * 50 + 30,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        id: i
      }
    })
    setEtruscanParticles(particles)
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes etruscanFloat {
        0% { 
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: var(--max-opacity);
        }
        25% {
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.25), calc(-50% + var(--move-y, 0px) * 0.25)) scale(1.1) rotate(90deg);
          opacity: var(--max-opacity);
        }
        50% {
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.5), calc(-50% + var(--move-y, 0px) * 0.5)) scale(1) rotate(180deg);
          opacity: var(--max-opacity);
        }
        75% {
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.75), calc(-50% + var(--move-y, 0px) * 0.75)) scale(1.1) rotate(270deg);
          opacity: var(--max-opacity);
        }
        100% { 
          transform: translate(calc(-50% + var(--move-x, 0px)), calc(-50% + var(--move-y, 0px))) scale(1) rotate(360deg);
          opacity: var(--max-opacity);
        }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes fadeInOut {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
      
      @keyframes dissolveParticle {
        0% { 
          opacity: var(--max-opacity);
          transform: translate(-50%, -50%) scale(1);
        }
        70% {
          opacity: var(--max-opacity);
          transform: translate(-50%, -50%) scale(1.2);
        }
        100% { 
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.3);
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const containerStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    border: 'none',
    background: 'black',
    zIndex: 5,
    opacity: isDissolving ? 0 : 1,
    transition: 'opacity 2s ease-out',
    overflow: 'hidden',
    pointerEvents: isDissolving ? 'none' as const : 'auto' as const,
  }



  const etruscanParticleStyles = (particle: EtruscanParticle) => {
    const centerX = 50
    const centerY = 50
    const distanceFromCenter = Math.sqrt(Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2))
    const maxDistance = Math.sqrt(50 * 50 + 50 * 50)
    const distanceMultiplier = Math.min(distanceFromCenter / maxDistance * 1.2, 1)
    
    const exclusionRadius = 0.4
    if (distanceMultiplier < exclusionRadius) {
      return {
        display: 'none' as const,
      } as React.CSSProperties
    }
    
    const scaledSize = particle.size * (0.5 + distanceMultiplier * 2)
    const finalOpacity = distanceMultiplier * 0.9
    const glowIntensity = distanceMultiplier * 30
    
    return {
      position: 'absolute' as const,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      fontSize: `${scaledSize}px`,
      fontWeight: '300' as const,
      color: '#d4af37',
      textShadow: `0 0 ${glowIntensity}px #d4af37, 0 0 ${glowIntensity * 2}px #f0d67c`,
      background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: isDissolving 
        ? `dissolveParticle ${1.5 + Math.random() * 0.8}s ease-out forwards`
        : `etruscanFloat ${particle.duration}s ease-in-out infinite`,
      animationDelay: isDissolving 
        ? `${Math.random() * 0.5}s`
        : `${particle.animationDelay}s`,
      pointerEvents: 'none' as const,
      fontFamily: 'Times, serif',
      transform: 'translate(-50%, -50%)',
      filter: `drop-shadow(0 0 ${glowIntensity}px rgba(212, 175, 55, ${distanceMultiplier}))`,
      zIndex: 1,
      '--max-opacity': finalOpacity,
      '--move-x': `${particle.vx * 200}px`,
      '--move-y': `${particle.vy * 200}px`,
    } as React.CSSProperties
  }



  const contentStyles = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    zIndex: 10,
    maxWidth: '90vw',
  }

  const subtitleStyles = {
    color: 'rgba(244, 230, 211, 0.7)',
    fontSize: 'clamp(1rem, 3vw, 1.5rem)',
    margin: '0 0 60px 0',
    fontStyle: 'italic',
    letterSpacing: '2px',
    fontFamily: 'Cormorant Garamond, serif',
  }

  const progressContainerStyles = {
    marginBottom: 40,
    position: 'relative' as const,
    width: 'min(400px, 80vw)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  }

  const progressBarStyles = {
    height: 2,
    width: '90%',
    background: 'rgba(139, 101, 65, 0.3)',
    overflow: 'hidden',
    position: 'relative' as const,
    borderRadius: '1px',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
  }

  const progressFillStyles = {
    height: '100%',
    background: 'linear-gradient(90deg, transparent, #d4af37, #f0d67c, #d4af37, transparent)',
    width: `${progress}%`,
    transition: 'width 0.3s ease-out',
    animation: 'shimmer 2s linear infinite',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
    borderRadius: '1px',
  }

  const percentageStyles = {
    color: '#d4af37',
    fontSize: 'clamp(2rem, 6vw, 3rem)',
    fontWeight: 700,
    marginTop: 24,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    fontFamily: 'Cinzel, Times New Roman, serif',
    textAlign: 'center' as const,
    width: '100%',
  }

  const loadingTextStyles = {
    color: 'rgba(244, 230, 211, 0.6)',
    fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
    fontStyle: 'italic',
    marginTop: 24,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    letterSpacing: '1px',
    fontFamily: 'Cormorant Garamond, serif',
    animation: 'fadeInOut 3s ease-in-out infinite',
  }

  return (
    <div style={containerStyles}>
      {etruscanParticles.map((particle) => (
        <div
          key={particle.id}
          style={etruscanParticleStyles(particle)}
        >
          {particle.char}
        </div>
      ))}
      

      
      <div style={contentStyles}>
        <p style={subtitleStyles}>Ancient Etruscan Divination</p>
        
        <div style={progressContainerStyles}>
          <div style={progressBarStyles}>
            <div style={progressFillStyles} />
          </div>
          <div style={percentageStyles}>{Math.round(progress)}%</div>
        </div>
        
        <div style={loadingTextStyles}>{loadingText}</div>
      </div>
    </div>
  )
} 