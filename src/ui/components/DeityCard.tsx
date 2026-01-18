import { Group, Paper, Text, Title } from "@mantine/core"
import { useTranslation } from "react-i18next"
import {
  getGodInscriptionData,
  getGodVariationInInscription,
  type LiverGod,
} from "../../scene/LiverData"
import { InscriptionChip } from "./InscriptionChip"

interface DeityCardProps {
  god: LiverGod
  onInscriptionClick?: (inscriptionId: number) => void
  selectedInscriptionId?: number
}

export function DeityCard({
  god,
  onInscriptionClick,
  selectedInscriptionId,
}: DeityCardProps) {
  const { t } = useTranslation("common")
  const { t: tLiverData } = useTranslation("liverData")
  const godData = getGodInscriptionData(god.id)
  const { godInscriptions } = godData

  const localizedDescription = tLiverData(`deities.${god.id}.description`)

  const localizedRomanEquivalent = tLiverData(
    `deities.${god.id}.romanEquivalent`,
    {
      defaultValue: "",
    },
  )

  const localizedGreekEquivalent = tLiverData(
    `deities.${god.id}.greekEquivalent`,
    {
      defaultValue: "",
    },
  )

  // Get the god's form from the selected inscription (if any) or first available inscription
  const godForm = selectedInscriptionId
    ? getGodVariationInInscription(god.id, selectedInscriptionId)
    : godData.nameVariations[0]

  // Get the group color from the selected inscription or first available inscription
  const groupColor = selectedInscriptionId
    ? godInscriptions.find((insc) => insc.id === selectedInscriptionId)
        ?.groupColor || "#8B6541"
    : godInscriptions[0]?.groupColor || "#8B6541"

  // Filter out the currently selected inscription
  const filteredInscriptions = godInscriptions.filter(
    (inscription) => inscription.id !== selectedInscriptionId,
  )

  return (
    <Paper
      p={{ base: "sm", sm: "md" }}
      radius="md"
      className="bg-overlay border-accent text-secondary shadow-secondary font-primary"
      style={{
        borderLeft: "4px solid var(--accent-bronze)",
        backdropFilter: "blur(10px)",
        fontFamily: "var(--font-primary)",
      }}
    >
      <Group
        justify="space-between"
        align="center"
        mb="sm"
        pb="xs"
        className="border-accent"
        style={{ borderBottom: "1px solid var(--border-accent)" }}
      >
        <Group gap="xs" align="baseline">
          <Title order={1} className="text-bronze" size="xl" fw={400}>
            {god.name}
          </Title>
          {godForm && (
            <Text>
              <Text component="span" size="lg" mr="xs">
                {t("connectors.as")}
              </Text>
              <Text
                component="span"
                fw={700}
                style={{
                  color: groupColor,
                  textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`,
                }}
              >
                {godForm.toUpperCase()}
              </Text>
            </Text>
          )}
        </Group>
      </Group>
      {localizedDescription && (
        <Text size="xl" fw={400}>
          {localizedDescription}
        </Text>
      )}
      {(localizedRomanEquivalent || localizedGreekEquivalent) && (
        <div>
          <Title
            className="text-bronze"
            order={2}
            size="md"
            fw={600}
            tt="uppercase"
            mt="xl"
            mb="sm"
          >
            {tLiverData("deities.equivalentGods")}
          </Title>
          <div className="deity-equivalents">
            {localizedRomanEquivalent && (
              <span>
                <span className="deity-equiv-label">
                  {t("connectors.roman")}{" "}
                </span>
                <span className="deity-equiv-value">
                  {localizedRomanEquivalent}
                </span>
              </span>
            )}
            {localizedRomanEquivalent && localizedGreekEquivalent && (
              <span className="deity-equiv-separator"> • </span>
            )}
            {localizedGreekEquivalent && (
              <span>
                <span className="deity-equiv-label">
                  {t("connectors.greek")}{" "}
                </span>
                <span className="deity-equiv-value">
                  {localizedGreekEquivalent}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Also appears in inscriptions */}
      {filteredInscriptions.length > 0 && (
        <div>
          <Title
            className="text-bronze"
            order={2}
            size="md"
            fw={600}
            tt="uppercase"
            mt="xl"
            mb="sm"
          >
            {tLiverData("deities.alsoAppearsIn")}
          </Title>
          <Group gap="xs" style={{ display: "flex", flexWrap: "wrap" }}>
            {filteredInscriptions.map((inscription) => (
              <InscriptionChip
                key={inscription.id}
                inscriptionId={inscription.id}
                groupColor={inscription.groupColor}
                associatedGodIds={inscription.otherGods}
                godVariation={getGodVariationInInscription(
                  god.id,
                  inscription.id,
                )}
                onClick={() => onInscriptionClick?.(inscription.id)}
              />
            ))}
          </Group>
        </div>
      )}
    </Paper>
  )
}
