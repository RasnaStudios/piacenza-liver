import { Box, Transition } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { type CSSProperties, useState } from "react"
import { isMobile } from "react-device-detect"
import { FiMenu, FiX } from "react-icons/fi"
import { ActionButtons } from "./ActionButtons"

interface ActionMenuProps {
  onAboutClick: () => void
  onExploreClick: () => void
  isVisible: boolean
  hideExploreInscriptions?: boolean
  hideControls?: boolean
}

export function ActionMenu({
  onAboutClick,
  onExploreClick,
  isVisible,
  hideExploreInscriptions = false,
  hideControls = false,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isNarrow = useMediaQuery("(max-width: 1100px)")
  const useBottomMenu = isMobile || isNarrow
  const buttonOrder = useBottomMenu ? 2 : 1
  const panelOrder = useBottomMenu ? 1 : 2

  if (!isVisible) return null

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleAboutClick = () => {
    onAboutClick()
    setIsOpen(false)
  }

  const handleExploreClick = () => {
    onExploreClick()
    setIsOpen(false)
  }

  const positionStyles: CSSProperties = useBottomMenu
    ? {
        top: "auto",
        bottom: isMobile ? "16px" : "20px",
        right: isMobile ? "16px" : "20px",
      }
    : {}

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: useBottomMenu ? 12 : 10,
    ...positionStyles,
  }

  return (
    <Box className="action-menu-container" style={containerStyle}>
      <Transition
        mounted={isOpen}
        transition={useBottomMenu ? "slide-up" : "slide-down"}
        duration={300}
        timingFunction="ease-out"
        keepMounted
      >
        {(styles) => (
          <Box
            style={{
              order: panelOrder,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "12px",
              minWidth: useBottomMenu ? "220px" : "340px",
              maxWidth: "min(420px, calc(100vw - 48px))",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(97, 80, 53, 0.41)",
              ...styles,
            }}
          >
            <ActionButtons
              onAboutClick={handleAboutClick}
              onExploreClick={handleExploreClick}
              showLanguageSwitcher={true}
              disableAnimation={true}
              hideExploreInscriptions={hideExploreInscriptions}
              hideControls={hideControls}
              onAction={() => setIsOpen(false)}
            />
          </Box>
        )}
      </Transition>

      <button
        type="button"
        onClick={toggleMenu}
        className={`action-menu-button ${isOpen ? "is-open" : ""}`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        title={isOpen ? "Close menu" : "Open menu"}
        style={{ order: buttonOrder }}
      >
        {isOpen ? (
          <FiX className="action-menu-icon" />
        ) : (
          <FiMenu className="action-menu-icon" />
        )}
      </button>
    </Box>
  )
}
