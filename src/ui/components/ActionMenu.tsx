import { Box, Stack, Transition } from "@mantine/core"
import { useState } from "react"
import { useOrientation } from "../../hooks/useOrientation"
import { ControlsModal } from "./ControlsModal"
import { InteractionButton } from "./InteractionButton"

interface ActionMenuProps {
  onAboutClick: () => void
  onExploreClick: () => void
  isVisible: boolean
}

export function ActionMenu({
  onAboutClick,
  onExploreClick,
  isVisible,
}: ActionMenuProps) {
  const isPortrait = useOrientation()
  const [isOpen, setIsOpen] = useState(false)
  const [controlsOpened, setControlsOpened] = useState(false)

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

  const handleControlsClick = () => {
    setControlsOpened(true)
    setIsOpen(false)
  }

  if (!isPortrait) {
    return null
  }

  return (
    <Box
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
      }}
    >
      <Transition
        mounted={isOpen}
        transition="slide-up"
        duration={300}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: "absolute",
              bottom: "60px",
              right: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "12px",
              minWidth: "200px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Stack gap="xs" align="flex-start">
              <InteractionButton
                onClick={handleAboutClick}
                variant="text"
                size="md"
              >
                About the Liver
              </InteractionButton>
              <InteractionButton
                onClick={handleExploreClick}
                variant="text"
                size="md"
              >
                Explore inscriptions
              </InteractionButton>
              <InteractionButton
                onClick={handleControlsClick}
                variant="text"
                size="md"
              >
                Controls
              </InteractionButton>
            </Stack>
          </Box>
        )}
      </Transition>

      <ControlsModal
        opened={controlsOpened}
        onClose={() => setControlsOpened(false)}
      />

      <button
        type="button"
        onClick={toggleMenu}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(0, 0, 0, 0.85)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
          padding: "12px",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          style={{
            width: "20px",
            height: "2px",
            background: "#c9a876",
            borderRadius: "1px",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
          }}
        />
        <Box
          style={{
            width: "20px",
            height: "2px",
            background: "#c9a876",
            borderRadius: "1px",
            transition: "all 0.3s ease",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <Box
          style={{
            width: "20px",
            height: "2px",
            background: "#c9a876",
            borderRadius: "1px",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
          }}
        />
      </button>
    </Box>
  )
}
