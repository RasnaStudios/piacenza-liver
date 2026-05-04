import { Button, Group, Text } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { type LiverGod, liverGods } from "../../scene/LiverData"
import { NumberBadge } from "./NumberBadge"

interface InscriptionChipProps {
  inscriptionId: number
  groupColor: string
  associatedGodIds: string[]
  onClick: () => void
  godVariation?: string | null
  isSelected?: boolean
  selectedLabel?: string
}

export function InscriptionChip({
  inscriptionId,
  groupColor,
  associatedGodIds,
  onClick,
  godVariation,
  isSelected = false,
  selectedLabel = "Selected occurrence",
}: InscriptionChipProps) {
  const { t } = useTranslation("common")
  const associatedGods = associatedGodIds
    .map((id) => (liverGods as Record<string, LiverGod>)[id])
    .filter(Boolean)
  const idleBackground = isSelected
    ? `linear-gradient(135deg, ${groupColor}44 0%, ${groupColor}24 100%)`
    : `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}10 100%)`
  const idleBorder = isSelected
    ? `2px solid ${groupColor}`
    : `1px solid ${groupColor}40`
  const idleShadow = isSelected
    ? `0 0 0 1px ${groupColor}55, 0 6px 22px ${groupColor}32`
    : "0 2px 8px rgba(0, 0, 0, 0.1)"
  const idleTransform = isSelected ? "translateY(-3px)" : ""

  return (
    <Button
      onClick={onClick}
      variant="light"
      radius="xl"
      className={`font-primary text-secondary fancy-button inscription-chip${
        isSelected ? " inscription-chip--selected" : ""
      }`}
      h="auto"
      py={5}
      pl={6}
      aria-current={isSelected ? "true" : undefined}
      aria-label={`${isSelected ? `${selectedLabel}: ` : ""}${t("actions.goToInscription")} ${inscriptionId}${associatedGods.length > 0 ? `, ${t("connectors.with")} ${associatedGods.map((g) => g.name).join(", ")}` : ""}`}
      style={{
        background: idleBackground,
        border: idleBorder,
        boxShadow: idleShadow,
        minHeight: "30px",
        transform: idleTransform || undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${groupColor}40 0%, ${groupColor}25 100%)`
        e.currentTarget.style.border = isSelected
          ? `2px solid ${groupColor}`
          : `1px solid ${groupColor}60`
        e.currentTarget.style.boxShadow = `0 4px 16px ${groupColor}30, 0 2px 8px rgba(0, 0, 0, 0.2)`
        if (isSelected) e.currentTarget.style.transform = "translateY(-4px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = idleBackground
        e.currentTarget.style.border = idleBorder
        e.currentTarget.style.boxShadow = idleShadow
        e.currentTarget.style.transform = idleTransform || ""
      }}
      title={`${isSelected ? `${selectedLabel}: ` : ""}${t("actions.goToInscription")} ${inscriptionId}${associatedGods.length > 0 ? ` (${t("connectors.with")} ${associatedGods.map((g) => g.name).join(", ")})` : ""}`}
    >
      <Group gap="xs" wrap="nowrap">
        <NumberBadge value={inscriptionId} color={groupColor} />

        {godVariation && (
          <Text>
            <Text component="span" size="lg" style={{ color: "white" }}>
              {t("connectors.as")}{" "}
            </Text>
            <Text
              component="span"
              fw={700}
              style={{
                color: groupColor,
                textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`,
              }}
            >
              {godVariation.toUpperCase()}
            </Text>
          </Text>
        )}

        {associatedGods.length > 0 && (
          <>
            <Text component="span" size="lg" style={{ color: "white" }}>
              {t("connectors.with")}{" "}
            </Text>
            <Text
              component="span"
              size="md"
              fw={700}
              style={{
                color: groupColor,
                textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`,
              }}
            >
              {associatedGods.map((god) => god.name).join(", ")}
            </Text>
          </>
        )}
      </Group>
    </Button>
  )
}
