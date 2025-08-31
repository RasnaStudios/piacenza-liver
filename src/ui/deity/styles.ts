import { isMobile } from 'react-device-detect'

// Panel container styles
export const getPanelStyles = () => ({
  mobile: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    minWidth: '100vw',
    minHeight: '100vh',
    background: '#0a0806',
    backgroundImage: 'none',
    border: 'none',
    borderRadius: 0,
    color: '#f4e6d3',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    transform: 'translateY(0)',
    transition: 'none',
    overflowY: 'hidden' as const,
    overflowX: 'hidden' as const,
    backdropFilter: 'none',
    boxShadow: 'none',
    zIndex: 9999,
    animation: 'panelSlideInMobile 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
    margin: 0,
    padding: 0,
  },
  desktop: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: 500,
    height: '100vh',
    background: '#0a0806',
    backgroundImage: 'none',
    border: '1px solid rgba(139, 101, 65, 0.2)',
    borderRadius: '12px 0 0 12px',
    color: '#f4e6d3',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    overflowY: 'hidden' as const,
    overflowX: 'hidden' as const,
    backdropFilter: 'none',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    animation: 'panelSlideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
  }
})

// Header styles
export const getHeaderStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px 16px 24px',
  borderBottom: '1px solid rgba(139, 101, 65, 0.2)',
  background: 'transparent',
  position: 'relative' as const,
})

export const getHeaderLeftStyles = () => ({
  display: 'grid',
  gridTemplateColumns: 'max-content 1fr',
  gridAutoRows: 'auto',
  columnGap: 8,
  rowGap: 4,
  alignItems: 'center',
})

export const getTitleStyles = () => ({
  margin: 0,
  color: '#f4e6d3',
  textShadow: '0 0 8px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
  gridColumn: '2 / 3',
  alignSelf: 'center',
  fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
  fontWeight: 600,
  fontSize: isMobile ? '1.4em' : '1.6em',
})

export const getEtruscanTextStyles = () => ({
  fontFamily: 'Noto Sans Old Italic, Aegean, serif',
  background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontSize: isMobile ? '1.15em' : '1.1em',
  fontStyle: 'italic',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
  letterSpacing: '0.5px',
  gridColumn: '1 / -1',
  gridRow: '2 / 3',
})

export const getCloseButtonStyles = () => ({
  background: 'rgba(244, 230, 211, 0.1)',
  border: '1px solid rgba(244, 230, 211, 0.3)',
  borderRadius: '50%',
  width: isMobile ? '40px' : '32px',
  height: isMobile ? '40px' : '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: isMobile ? '20px' : '16px',
  color: 'rgba(244, 230, 211, 0.9)',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
})

// Content styles
export const getContentStyles = () => ({
  flex: 1,
  overflowY: 'scroll' as const,
  overflowX: 'hidden' as const,
  padding: isMobile ? '20px' : '25px',
  scrollbarWidth: 'thin' as const,
  scrollbarColor: 'rgba(244, 230, 211, 0.3) transparent',
  minHeight: 0,
})

export const getInvolvedDeitiesTextStyles = () => ({
  margin: '0 0 16px 0',
  color: 'rgba(244, 230, 211, 0.9)',
  lineHeight: 1.6,
  fontSize: isMobile ? 'inherit' : '0.95em',
  textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
})

export const getDeitiesSectionStyles = () => ({
  marginBottom: 24,
})

// Group section styles
export const getGroupSectionStyles = () => ({
  marginBottom: 24,
  padding: '16px 20px',
  background: 'rgba(139, 101, 65, 0.05)',
  borderRadius: 12,
  border: '1px solid rgba(139, 101, 65, 0.1)',
})

export const getGroupHeaderStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 12,
})

export const getGroupColorDotStyles = (color: string) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  backgroundColor: color,
})

export const getGroupTitleStyles = () => ({
  margin: 0,
  color: '#f4e6d3',
  fontSize: isMobile ? 'inherit' : '1.25em',
  fontWeight: 600,
  fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
  textShadow: '0 0 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
})

export const getGroupDescriptionStyles = () => ({
  margin: '8px 0',
  color: 'rgba(244, 230, 211, 0.9)',
  lineHeight: 1.6,
  fontSize: isMobile ? 'inherit' : '0.95em',
  textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
})

export const getCosmologicalTitleStyles = () => ({
  margin: '16px 0 8px 0',
  color: '#d4af37',
  fontSize: isMobile ? 'inherit' : '1.15em',
  fontWeight: 600,
  fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
  textShadow: '0 0 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
})

export const getCosmologicalTextStyles = () => ({
  margin: 0,
  color: 'rgba(244, 230, 211, 0.9)',
  lineHeight: 1.6,
  fontSize: isMobile ? 'inherit' : '1.0em',
  fontStyle: 'italic',
  textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
})

// DeityCard styles
export const getDeityCardStyles = () => ({
  background: 'rgba(244, 230, 211, 0.05)',
  border: '1px solid rgba(244, 230, 211, 0.15)',
  borderLeft: '4px solid rgba(139, 101, 65, 0.6)',
  borderRadius: 12,
  padding: isMobile ? '20px' : '18px',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
})

export const getDeityHeaderStyles = () => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid rgba(244, 230, 211, 0.15)',
})

export const getDeityNameStyles = () => ({
  fontSize: isMobile ? '1.3em' : '1.2em',
  fontWeight: 300,
  background: 'linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #ffed4e 50%, #f0d67c 75%, #d4af37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  margin: 0,
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
})

export const getDeityScriptStyles = () => ({
  fontFamily: 'Noto Sans Old Italic, Aegean, serif',
  color: 'rgba(244, 230, 211, 0.7)',
  fontSize: isMobile ? '1.0em' : '0.9em',
  fontStyle: 'italic',
  textShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)',
})

export const getAboutSectionStyles = () => ({
  padding: '12px 16px',
  background: 'rgba(139, 101, 65, 0.03)',
  borderRadius: 8,
  border: '1px solid rgba(139, 101, 65, 0.08)',
  marginBottom: 16
})

export const getDomainSectionStyles = () => ({
  padding: '12px 16px',
  background: 'rgba(139, 101, 65, 0.05)',
  borderRadius: 8,
  marginBottom: 20
})

export const getSectionHeaderStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: isMobile ? 10 : 8
})

export const getSectionLabelStyles = () => ({
  fontSize: isMobile ? '0.8em' : '0.75em',
  fontWeight: 600,
  color: 'rgba(139, 101, 65, 0.8)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
})

export const getSectionTextStyles = () => ({
  margin: 0,
  fontSize: isMobile ? '1.0em' : '0.95em',
  color: 'rgba(244, 230, 211, 0.9)',
  lineHeight: 1.6,
  fontWeight: 500
})

export const getInscriptionSectionStyles = () => ({
  marginTop: 20
})

export const getInscriptionHeaderStyles = () => ({
  marginBottom: 12
})

export const getInscriptionBarStyles = () => ({
  width: 3,
  height: 20,
  background: 'linear-gradient(to bottom, rgba(139, 101, 65, 0.8), rgba(139, 101, 65, 0.4))',
  borderRadius: 2
})

export const getInscriptionTitleStyles = () => ({
  fontSize: isMobile ? '1.1em' : '1.0em',
  fontWeight: 600,
  color: 'rgba(139, 101, 65, 0.9)',
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
})

export const getInscriptionChipsStyles = () => ({
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 8
})

export const getNameVariationStyles = () => ({
  marginTop: 16
})

export const getNameVariationChipsStyles = () => ({
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 6
})

export const getNameVariationChipStyles = () => ({
  background: 'rgba(139, 101, 65, 0.08)',
  border: '1px solid rgba(139, 101, 65, 0.15)',
  padding: '6px 10px',
  borderRadius: 16,
  fontSize: isMobile ? '0.9em' : '0.8em',
  fontWeight: 500,
  color: 'rgba(244, 230, 211, 0.9)',
  fontFamily: 'Noto Sans Old Italic, Aegean, serif',
  fontStyle: 'italic'
})

// CSS animations
export const CSS_ANIMATIONS = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  @keyframes panelSlideIn {
    0% {
      opacity: 0;
      transform: translateX(100%) scale(0.95);
      filter: blur(5px);
    }
    50% {
      opacity: 0.8;
      transform: translateX(20%) scale(0.98);
      filter: blur(2px);
    }
    100% {
      opacity: 1;
      transform: translateX(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes panelSlideInPortrait {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    @keyframes panelSlideInMobile {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes panelSlideInPortrait {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Responsive typography for small screens */
    .mobile-title {
      font-size: clamp(1.1rem, 4vw, 1.4rem) !important;
      line-height: 1.3 !important;
    }
    
    .mobile-subtitle {
      font-size: clamp(0.9rem, 3vw, 1.1rem) !important;
      line-height: 1.4 !important;
    }
    
    .mobile-section-title {
      font-size: clamp(0.85rem, 2.5vw, 1rem) !important;
      line-height: 1.4 !important;
    }
    
    .mobile-body-text {
      font-size: clamp(0.8rem, 2.2vw, 0.9rem) !important;
      line-height: 1.5 !important;
    }
    
    .mobile-label-text {
      font-size: clamp(0.75rem, 2vw, 0.85rem) !important;
      line-height: 1.4 !important;
    }
    
    .mobile-etruscan-text {
      font-size: clamp(0.9rem, 2.8vw, 1.1rem) !important;
      line-height: 1.3 !important;
    }
  }  
    @keyframes panelSlideIn {
      0% {
        opacity: 0;
        transform: translateY(100%) scale(0.95);
        filter: blur(5px);
      }
      50% {
        opacity: 0.8;
        transform: translateY(20%) scale(0.98);
        filter: blur(2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }
  }

  .deity-panel-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .deity-panel-scrollbar::-webkit-scrollbar-track {
    background: rgba(139, 101, 65, 0.1);
    border-radius: 4px;
  }

  .deity-panel-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.6) 0%, rgba(139, 101, 65, 0.6) 100%);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .deity-panel-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(139, 101, 65, 0.8) 100%);
  }

  @media (max-width: 768px) {
    .deity-panel-mobile {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
    }
  }
`
