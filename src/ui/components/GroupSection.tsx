import { Group, Paper, Text, Title } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { getInscriptionGroup, type Inscription } from "../../scene/LiverData"

interface GroupSectionProps {
  selectedInscription: Inscription | null
}

export function GroupSection({ selectedInscription }: GroupSectionProps) {
  const { t } = useTranslation("liverData")
  if (!selectedInscription) return null

  const group = getInscriptionGroup(selectedInscription.id)

  if (!group) {
    return null
  }

  const localizedName = t(`groups.${group.id}.name`)
  const localizedDescription = t(`groups.${group.id}.description`)

  return (
    <Paper
      p={{ base: "md", sm: "lg" }}
      radius="md"
      style={{
        border: "1px solid var(--border-secondary)",
        backgroundColor: `${group.color}10`,
      }}
    >
      <Group gap={16} mb="sm">
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
            backgroundColor: group.color,
          }}
        />
        <Title order={3} className="text-bronze">
          {localizedName}
        </Title>
      </Group>

      <Text size="xl" fw={400}>
        {localizedDescription}
      </Text>
    </Paper>
  )
}
