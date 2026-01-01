import { ActionIcon, Group, Title } from "@mantine/core"
import type { Inscription } from "../../scene/LiverData"
import { NumberBadge } from "./NumberBadge"

interface PanelHeaderProps {
  selectedInscription: Inscription | null
  deityNames: string
  onClose: () => void
}

export function PanelHeader({
  selectedInscription,
  deityNames,
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
          {deityNames}
        </Title>
      </div>

      <ActionIcon
        onClick={onClose}
        variant="light"
        radius="xl"
        color="var(--bronze-light)"
        aria-label="Close panel"
        title="Close panel"
        pos="absolute"
        right={0}
        top={0}
        m="lg"
      >
        ✕
      </ActionIcon>
    </Group>
  )
}
