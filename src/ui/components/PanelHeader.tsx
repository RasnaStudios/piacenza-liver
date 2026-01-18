import { Box, Group, Title } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import type { Inscription } from "../../scene/LiverData"
import { NumberBadge } from "./NumberBadge"

interface PanelHeaderProps {
  selectedInscription: Inscription | null
  onClose: () => void
}

export function PanelHeader({
  selectedInscription,
  onClose,
}: PanelHeaderProps) {
  if (!selectedInscription) return null

  return (
    <Group
      align="center"
      p="lg"
      pb="sm"
      className="border-primary"
      style={{
        borderBottom: "1px solid var(--border-primary)",
        background: "transparent",
      }}
    >
      <NumberBadge value={selectedInscription.id} size={55} />
      <div
        style={{
          columnGap: 2,
          rowGap: 2,
        }}
      >
        <Title order={2} className="font-etruscan text-gradient-gold">
          {selectedInscription.etruscanText}
        </Title>
        <Title
          order={4}
          className="text-bronze-light"
          style={{
            letterSpacing: "0.2px",
          }}
        >
          {selectedInscription.transcription}
        </Title>
      </div>

      <Box
        className="close-button-container"
        onClick={onClose}
        aria-label="Close panel"
        title="Close panel"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          margin: "24px",
        }}
      >
        <IconX size={24} stroke={1.5} />
      </Box>
    </Group>
  )
}
