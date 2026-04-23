import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

interface LoadingScreenProps {
  progress: number
  isLoading: boolean
  showLoadingUI: boolean
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

export function LoadingScreen({
  progress,
  isLoading,
  showLoadingUI,
}: LoadingScreenProps) {
  const { t, i18n } = useTranslation("loading")
  const [isDissolving, setIsDissolving] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)
  const messages = useMemo(
    () => t("messages", { returnObjects: true }) as string[],
    [t, i18n.language],
  )
  const loadingText = useMemo(() => {
    const texts = messages
    const n = texts.length
    if (n === 0) return ""
    if (n === 1) return texts[0]
    const idx = Math.min(n - 1, Math.floor((progress / 100) * n))
    return texts[idx]
  }, [messages, progress])
  const [etruscanParticles, setEtruscanParticles] = useState<
    EtruscanParticle[]
  >([])
  const hasShownRef = useRef(false)
  if (showLoadingUI && isLoading) hasShownRef.current = true

  useEffect(() => {
    if (
      (progress >= 100 || !isLoading) &&
      !isDissolving &&
      hasShownRef.current
    ) {
      setIsDissolving(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 2800)
      return () => clearTimeout(timer)
    }
  }, [progress, isLoading, isDissolving])

  // Etruscan Old Italic Unicode characters + fallback symbols
  const etruscanChars = [
    "𐌀",
    "𐌁",
    "𐌂",
    "𐌃",
    "𐌄",
    "𐌅",
    "𐌉",
    "𐌊",
    "𐌋",
    "𐌌",
    "𐌍",
    "𐌏",
    "𐌐",
    "𐌑",
    "𐌓",
    "𐌔",
    "𐌕",
    "𐌖",
    "𐌗",
    "𐌛",
    "𐌜",
  ]

  useEffect(() => {
    const particles: EtruscanParticle[] = Array.from({ length: 80 }, (_, i) => {
      // Distribute only on left and right sides with density towards borders
      const isLeft = Math.random() < 0.5

      // Use squared random for density towards borders
      const densityRandom = Math.random() * Math.random()

      const x = isLeft
        ? densityRandom * 28 // Left side band (slightly wider)
        : 100 - densityRandom * 28 // Right side band (slightly wider)

      return {
        char: etruscanChars[Math.floor(Math.random() * etruscanChars.length)],
        x,
        y: Math.random() * 100,
        opacity: Math.random() * 0.17 + 0.08, // more transparent overall
        size: Math.random() * 14 + 10, // a bit larger base size
        animationDelay: Math.random() * 20,
        duration: Math.random() * 40 + 30,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        id: i,
      }
    })
    setEtruscanParticles(particles)
  }, [])

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes etruscanFloat {
        0% { 
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
        25% {
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.25), calc(-50% + var(--move-y, 0px) * 0.25)) scale(1.1) rotate(90deg);
        }
        50% {
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.5), calc(-50% + var(--move-y, 0px) * 0.5)) scale(1) rotate(180deg);
        }
        75% {
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.75), calc(-50% + var(--move-y, 0px) * 0.75)) scale(1.1) rotate(270deg);
        }
        100% { 
          transform: translate(calc(-50% + var(--move-x, 0px)), calc(-50% + var(--move-y, 0px))) scale(1) rotate(360deg);
        }
      }

      /* Calmer firefly-like opacity pulsing (subtle amplitude) */
      @keyframes fireflyPulse {
        0%   { opacity: 0.72; }
        35%  { opacity: 0.88; }
        70%  { opacity: 0.75; }
        100% { opacity: 0.86; }
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
          /* keep current computed opacity */
          transform: translate(-50%, -50%) scale(1);
          filter: blur(0px);
        }
        70% {
          opacity: 0.5;
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.1), calc(-50% + var(--move-y, 0px) * 0.1)) scale(1.02);
          filter: blur(1px);
        }
        100% { 
          opacity: 0;
          transform: translate(calc(-50% + var(--move-x, 0px) * 0.15), calc(-50% + var(--move-y, 0px) * 0.15)) translateY(8px) scale(0.92);
          filter: blur(2px);
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const shouldShow =
    (showLoadingUI && isLoading) ||
    (isDissolving && hasShownRef.current) ||
    (hasShownRef.current && (progress >= 100 || !isLoading))
  if (!shouldRender || !shouldShow) {
    return null
  }

  const containerStyles = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    border: "none",
    background: "black",
    zIndex: 5,
    opacity: isDissolving ? 0 : 1,
    transition: "opacity 2.8s cubic-bezier(0.22, 0.61, 0.36, 1)",
    overflow: "hidden",
    pointerEvents: isDissolving ? ("none" as const) : ("auto" as const),
    willChange: "opacity",
    // Edge gradient mask to make the disappearance feel more natural
    WebkitMaskImage: isDissolving
      ? "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)"
      : undefined,
    maskImage: isDissolving
      ? "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)"
      : undefined,
    WebkitMaskSize: isDissolving ? "100% 100%" : undefined,
    maskSize: isDissolving ? "100% 100%" : undefined,
  }

  const etruscanParticleStyles = (particle: EtruscanParticle) => {
    const centerX = 50
    const centerY = 50
    const distanceFromCenter = Math.sqrt(
      (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2,
    )
    const maxDistance = Math.sqrt(50 * 50 + 50 * 50)
    const distanceMultiplier = Math.min(
      (distanceFromCenter / maxDistance) * 1.2,
      1,
    )

    const exclusionRadius = 0.4
    if (distanceMultiplier < exclusionRadius) {
      return {
        display: "none" as const,
      } as React.CSSProperties
    }

    const scaledSize = particle.size * (0.6 + distanceMultiplier * 2.2)
    const finalOpacity = Math.min(particle.opacity, distanceMultiplier * 0.35)
    const glowIntensity = distanceMultiplier * 8
    // Deterministic pseudo-random based on id for stable pulse per particle
    const seed = ((particle.id * 9301 + 49297) % 233280) / 233280
    const pulseDuration = 3.8 + seed * 3.4 // 3.8s - 7.2s
    const pulseDelay = seed * 3.5 // 0 - 3.5s

    // Build animation styles without using shorthand to avoid conflicts
    const animationStyles: React.CSSProperties = isDissolving
      ? {
          animationName: "dissolveParticle",
          animationDuration: `${1.5 + Math.random() * 0.8}s`,
          animationTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
          animationIterationCount: "1",
          animationDelay: `${Math.random() * 0.5}s`,
          animationFillMode: "forwards",
        }
      : {
          animationName: "etruscanFloat, fireflyPulse",
          animationDuration: `${particle.duration}s, ${pulseDuration}s`,
          animationTimingFunction: "ease-in-out, ease-in-out",
          animationIterationCount: "infinite, infinite",
          animationDelay: `${particle.animationDelay}s, ${pulseDelay}s`,
          animationFillMode: "none, none",
        }

    return {
      position: "absolute" as const,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      fontSize: `${scaledSize}px`,
      fontWeight: "200" as const,
      color: `rgba(201, 168, 118, ${Math.max(0.08, Math.min(finalOpacity, 0.28))})`,
      textShadow: `0 0 ${Math.max(1, glowIntensity * 0.6)}px rgba(201, 168, 118, 0.22)`,
      ...animationStyles,
      pointerEvents: "none" as const,
      fontFamily: "Times, serif",
      transform: "translate(-50%, -50%)",
      filter: `drop-shadow(0 0 2px rgba(201, 168, 118, 0.12))`,
      zIndex: 1,
      "--max-opacity": finalOpacity,
      "--move-x": `${particle.vx * 200}px`,
      "--move-y": `${particle.vy * 200}px`,
      willChange: "opacity, transform",
    } as React.CSSProperties
  }

  const contentStyles = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center" as const,
    zIndex: 10,
    width: "min(90vw, 640px)",
  }

  const subtitleStyles = {
    color: "var(--bronze-text)",
    fontSize: "clamp(1rem, 3vw, 1.5rem)",
    margin: "0 0 60px 0",
    fontStyle: "italic",
    letterSpacing: "2px",
    fontFamily: "Cormorant Garamond, serif",
  }

  const progressContainerStyles = {
    margin: "0 auto 40px",
    position: "relative" as const,
    width: "min(400px, 80vw)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  }

  const progressBarStyles = {
    height: 2,
    width: "90%",
    background: "rgba(139, 101, 65, 0.35)",
    overflow: "hidden",
    position: "relative" as const,
    borderRadius: "1px",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.5)",
  }

  const progressFillStyles = {
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, #c9a876, #e6d4b8, #c9a876, transparent)",
    width: `${progress}%`,
    transition: "width 0.3s ease-out",
    animation: "shimmer 2s linear infinite",
    boxShadow: "0 0 20px rgba(201, 168, 118, 0.5)",
    borderRadius: "1px",
  }

  const percentageStyles = {
    color: "#c9a876",
    fontSize: "clamp(2rem, 6vw, 3rem)",
    fontWeight: 700,
    marginTop: 24,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
    fontFamily: "Cinzel, Times New Roman, serif",
    textAlign: "center" as const,
    width: "100%",
    transition:
      "opacity 1.6s cubic-bezier(0.22, 0.61, 0.36, 1), filter 1.6s cubic-bezier(0.22, 0.61, 0.36, 1), transform 1.6s cubic-bezier(0.22, 0.61, 0.36, 1)",
  }

  const loadingTextStyles = {
    color: "var(--tertiary-text)",
    fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
    fontStyle: "italic",
    margin: "24px auto 0",
    maxWidth: "42ch",
    minHeight: "3.2em",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
    letterSpacing: "1px",
    fontFamily: "Cormorant Garamond, serif",
    lineHeight: 1.45,
    animation: "fadeInOut 3s ease-in-out infinite",
    transition:
      "opacity 1.6s cubic-bezier(0.22, 0.61, 0.36, 1), filter 1.6s cubic-bezier(0.22, 0.61, 0.36, 1), transform 1.6s cubic-bezier(0.22, 0.61, 0.36, 1)",
  }

  // Shared dissolve styles for text elements
  const dissolveText = isDissolving
    ? ({
        opacity: 0,
        filter: "blur(1.2px)",
        transform: "translateY(6px)",
      } as React.CSSProperties)
    : ({} as React.CSSProperties)

  return (
    <div style={containerStyles}>
      {etruscanParticles.map((particle) => (
        <div key={particle.id} style={etruscanParticleStyles(particle)}>
          {particle.char}
        </div>
      ))}
      <div style={contentStyles}>
        <p style={subtitleStyles}>{t("subtitle")}</p>

        <div style={progressContainerStyles}>
          <div
            style={{
              ...progressBarStyles,
              transition: "opacity 1.2s ease",
              opacity: isDissolving ? 0 : 1,
            }}
          >
            <div
              style={{
                ...progressFillStyles,
                transition: "opacity 1.2s ease",
                opacity: isDissolving ? 0 : 1,
              }}
            />
          </div>
          <div style={{ ...percentageStyles, ...dissolveText }}>
            {Math.round(progress)}%
          </div>
        </div>

        <div style={{ ...loadingTextStyles, ...dissolveText }}>
          {loadingText}
        </div>
      </div>
    </div>
  )
}
