import React from 'react'

interface LoadingScreenProps {
  progress: number // 0-100
  isVisible: boolean
}

export function LoadingScreen({ progress, isVisible }: LoadingScreenProps) {
  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: 'Cinzel, Times New Roman, serif',
      color: '#d4af37'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: 700,
        letterSpacing: '3px',
        marginBottom: '20px',
        background: 'linear-gradient(45deg, #f4e6d3 0%, #d4af37 50%, #f4e6d3 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center'
      }}>
        Piacenza Liver
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '18px',
        fontWeight: 400,
        color: '#c9a876',
        marginBottom: '40px',
        textAlign: 'center',
        lineHeight: 1.4,
        maxWidth: '600px',
        padding: '0 20px'
      }}>
        Loading the 3D bronze liver model with authentic Etruscan inscriptions...
      </p>

      {/* Loading Bar Container */}
      <div style={{
        width: '400px',
        maxWidth: '80vw',
        height: '8px',
        background: 'rgba(139, 101, 65, 0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        marginBottom: '20px'
      }}>
        {/* Loading Bar Fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #8b6541 0%, #d4af37 50%, #f0d67c 100%)',
          borderRadius: '4px',
          transition: 'width 0.3s ease-out',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
        }} />
      </div>

      {/* Progress Text */}
      <div style={{
        fontSize: '16px',
        color: '#b8860b',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        {progress}% Complete
      </div>

      {/* Loading Steps */}
      <div style={{
        fontSize: '14px',
        color: '#8b6541',
        textAlign: 'center',
        lineHeight: 1.6,
        maxWidth: '500px',
        padding: '0 20px'
      }}>
        {progress < 25 && "Loading 3D model geometry..."}
        {progress >= 25 && progress < 50 && "Applying bronze textures..."}
        {progress >= 50 && progress < 75 && "Setting up PBR materials..."}
        {progress >= 75 && progress < 95 && "Initializing inscriptions..."}
        {progress >= 95 && "Preparing interactive view..."}
      </div>

      {/* Historical Note */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: 'rgba(139, 101, 65, 0.8)',
        textAlign: 'center',
        fontStyle: 'italic',
        maxWidth: '600px',
        padding: '0 20px',
        lineHeight: 1.4
      }}>
        The Piacenza Liver (3rd-2nd century BCE) is an Etruscan bronze model used for divination,
        inscribed with the names of Etruscan deities mapped to regions of the sky.
      </div>
    </div>
  )
} 