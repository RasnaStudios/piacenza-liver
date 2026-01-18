import { Box, Transition } from "@mantine/core"
import { useState } from "react"
import { isMobile } from "react-device-detect"
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

  return (
    <Box className="action-menu-container">
      <Transition
        mounted={isOpen}
        transition="slide-down"
        duration={300}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: "absolute",
              top: "60px",
              right: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "12px",
              minWidth: isMobile ? "200px" : "350px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(97, 80, 53, 0.41)",
            }}
          >
            <ActionButtons
              onAboutClick={handleAboutClick}
              onExploreClick={handleExploreClick}
              showLanguageSwitcher={true}
              disableAnimation={true}
              hideExploreInscriptions={hideExploreInscriptions}
              hideControls={hideControls}
            />
          </Box>
        )}
      </Transition>

      <button
        type="button"
        onClick={toggleMenu}
        className={`action-menu-button ${isOpen ? "is-open" : ""}`}
      >
        <Box className="action-menu-icon" />
        <Box
          className="action-menu-icon"
          style={{
            opacity: isOpen ? 0 : 1,
          }}
        />
        <Box
          className="action-menu-icon"
          style={{
            transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
          }}
        />
      </button>
    </Box>
  )
}
