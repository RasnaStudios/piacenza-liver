import { Box, Drawer, Paper, Stack, Title } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useDrag } from "@use-gesture/react"
import { useRef, useState } from "react"
import { useOrientation } from "../hooks/useOrientation"
import {
  type Inscription,
  type LiverGod,
  liverGods,
  liverInscriptions,
} from "../scene/LiverData"
import { getGodsDisplayNames } from "../utils/liverUtils"
import { DeityCard } from "./components/DeityCard"
import { GroupSection } from "./components/GroupSection"
import { PanelHeader } from "./components/PanelHeader"
import { PanelLegend } from "./components/PanelLegend"

interface DeityPanelProps {
  selectedInscription: Inscription | null
  onClose: () => void
  onInscriptionSelect?: (inscription: Inscription) => void
  onAboutClick?: () => void
  onExploreClick?: () => void
}

export function DeityPanel({
  selectedInscription,
  onClose,
  onInscriptionSelect,
  onAboutClick,
  onExploreClick,
}: DeityPanelProps) {
  const isPortrait = useOrientation()
  const isSmallScreen = useMediaQuery("(max-width: 768px)")
  const [panelHeight, setPanelHeight] = useState(33) // Start at 33vh
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartHeight = useRef(33)
  const panelRef = useRef<HTMLDivElement>(null)
  const prevInscriptionId = useRef<number | null>(null)

  const bind = useDrag(
    ({ down, movement: [, my], event }) => {
      const target = event?.target as HTMLElement
      const isInScrollableArea = target?.closest(".scrollbar")

      // Don't drag if touching scrollable content
      if (isInScrollableArea) return

      if (down) {
        // Start dragging
        setIsDragging(true)
        dragStartHeight.current = panelHeight
        if (panelRef.current) {
          panelRef.current.style.transition = "none"
        }
      } else {
        // End dragging
        setIsDragging(false)
        if (panelRef.current) {
          panelRef.current.style.transition = "all 0.3s ease-out"
        }

        // Calculate final height based on drag distance
        const viewportHeight = window.innerHeight
        const deltaVh = (my / viewportHeight) * 100
        const newHeight = Math.min(
          90,
          Math.max(33, dragStartHeight.current - deltaVh),
        )

        // Check if should close (dragged down more than current height)
        const currentPanelHeight =
          (dragStartHeight.current / 100) * viewportHeight
        if (my > currentPanelHeight) {
          onClose()
        } else {
          setPanelHeight(newHeight)
        }
      }

      // Update drag offset for live preview
      setDragOffset(my)
    },
    {
      filterTaps: true,
      rubberband: true,
    },
  )

  const getCurrentHeight = () => {
    if (isDragging && panelRef.current) {
      const viewportHeight = window.innerHeight
      const deltaVh = (dragOffset / viewportHeight) * 100
      return Math.min(90, Math.max(33, dragStartHeight.current - deltaVh))
    }
    return panelHeight
  }

  // Reset to lower third when new inscription is selected
  if (
    selectedInscription &&
    selectedInscription.id !== prevInscriptionId.current
  ) {
    setPanelHeight(33)
    prevInscriptionId.current = selectedInscription.id
  }

  if (!selectedInscription) return null

  // Get display names for the gods in this inscription
  const deityNames = getGodsDisplayNames(selectedInscription.gods || [])

  // Get god objects for DeityCard components
  const gods = (selectedInscription.gods || [])
    .map((god) => {
      const godId = typeof god === "string" ? god : god.id
      return (liverGods as Record<string, LiverGod>)[godId]
    })
    .filter(Boolean)

  // Mobile portrait: custom bottom sheet
  if (isPortrait || isSmallScreen) {
    return (
      <Paper
        ref={panelRef}
        className="bg-primary text-primary"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${getCurrentHeight()}vh`,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
          zIndex: 100,
          transition: isDragging ? "none" : "all 0.3s ease-out",
        }}
        {...bind()}
      >
        {/* Drag handle */}
        <Box
          className="drag-handle"
          style={{
            cursor: "grab",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "8px 0 4px 0",
            touchAction: "none",
          }}
        >
          <Box
            style={{
              width: "40px",
              height: "4px",
              backgroundColor: "rgba(196, 168, 118, 0.7)",
              borderRadius: "2px",
            }}
          />
        </Box>

        <Box
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            style={{
              cursor: "grab",
              touchAction: "none",
              flexShrink: 0,
            }}
          >
            <PanelHeader
              selectedInscription={selectedInscription}
              deityNames={deityNames}
              onClose={onClose}
            />
          </Box>

          <Box
            className="scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              minHeight: 0,
              touchAction: "pan-y",
            }}
            p="md"
            onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
          >
            <Stack gap="lg">
              <Box>
                <Title
                  order={3}
                  my="sm"
                  ml="sm"
                  fw={400}
                  className="text-bronze"
                >
                  Involved deities
                </Title>

                <Stack gap="md">
                  {gods.map((god: LiverGod) => (
                    <DeityCard
                      key={god.id}
                      god={god}
                      selectedInscriptionId={selectedInscription.id}
                      onInscriptionClick={(inscriptionId) => {
                        const inscription = liverInscriptions.find(
                          (ins: Inscription) => ins.id === inscriptionId,
                        )
                        if (inscription && onInscriptionSelect) {
                          setPanelHeight(33)
                          setTimeout(() => {
                            onInscriptionSelect(inscription)
                          }, 300)
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <GroupSection selectedInscription={selectedInscription} />

              <PanelLegend
                onAboutClick={onAboutClick}
                onExploreClick={onExploreClick}
              />
            </Stack>
          </Box>
        </Box>
      </Paper>
    )
  }

  // Desktop/landscape: right side panel
  return (
    <Drawer
      opened={!!selectedInscription}
      onClose={onClose}
      position="right"
      size="45vw"
      withOverlay={false}
      withCloseButton={false}
      className="panel-border"
      styles={{
        content: {
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(45vw, 600px)",
          maxWidth: "600px",
          height: "100vh",
          background: "var(--primary-bg)",
          color: "var(--primary-text)",
          fontFamily: "var(--font-primary)",
          boxShadow: "var(--shadow-primary)",
          animation: "panelSlideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
        },
        body: {
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--primary-bg)",
        },
      }}
      transitionProps={{
        transition: "slide-left",
        duration: 400,
      }}
    >
      <PanelHeader
        selectedInscription={selectedInscription}
        deityNames={deityNames}
        onClose={onClose}
      />
      <Box
        className="scrollbar"
        style={{
          flex: 1,
          overflowY: "scroll",
          overflowX: "hidden",
          minHeight: 0,
        }}
        p="xl"
      >
        <Stack gap="lg">
          <Box>
            <Title order={3} mb="sm" ml="sm" fw={400} className="text-bronze">
              Involved deities
            </Title>

            <Stack gap="md">
              {gods.map((god: LiverGod) => (
                <DeityCard
                  key={god.id}
                  god={god}
                  selectedInscriptionId={selectedInscription.id}
                  onInscriptionClick={(inscriptionId) => {
                    const inscription = liverInscriptions.find(
                      (ins: Inscription) => ins.id === inscriptionId,
                    )
                    if (inscription && onInscriptionSelect) {
                      onInscriptionSelect(inscription)
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          <GroupSection selectedInscription={selectedInscription} />

          <PanelLegend
            onAboutClick={onAboutClick}
            onExploreClick={onExploreClick}
          />
        </Stack>
      </Box>
    </Drawer>
  )
}
