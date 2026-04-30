import { Group, Paper, Text, Title, Tooltip } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { getDeitySources, getSourceUrl } from "../../data/Scholarship"
import {
  getGodInscriptionData,
  getGodReadingStatusInInscription,
  getGodVariationInInscription,
  type IdentificationStatus,
  type LiverGod,
  type ParallelLocaleTranslator,
  type ReadingStatus,
  resolveDeityParallels,
} from "../../scene/LiverData"
import "./DeityCard.css"
import { InscriptionChip } from "./InscriptionChip"

interface DeityCardProps {
  god: LiverGod
  onInscriptionClick?: (inscriptionId: number) => void
  selectedInscriptionId?: number
}

const tooltipClassNames = {
  tooltip: "deity-tooltip",
  arrow: "deity-tooltip-arrow",
}

const tooltipEvents = { hover: true, focus: true, touch: true }

export function DeityCard({
  god,
  onInscriptionClick,
  selectedInscriptionId,
}: DeityCardProps) {
  const { t } = useTranslation("common")
  const { t: tLiverData } = useTranslation("liverData")
  const godData = getGodInscriptionData(god.id)
  const { godInscriptions } = godData

  const description = tLiverData(`deities.${god.id}.description`, {
    defaultValue: "",
  })

  const parallels = resolveDeityParallels(
    tLiverData as ParallelLocaleTranslator,
    god.id,
  )

  const sources = getDeitySources(god.id)

  const idStatus: IdentificationStatus = god.identificationStatus

  const selectedReadingStatus = selectedInscriptionId
    ? getGodReadingStatusInInscription(god.id, selectedInscriptionId)
    : undefined
  const readingStatus: ReadingStatus =
    selectedReadingStatus ?? god.readingStatus
  const cellReadingNote =
    selectedInscriptionId && selectedReadingStatus
      ? tLiverData(`inscriptions.${selectedInscriptionId}.readingNote`, {
          defaultValue: "",
        })
      : ""

  const idLabel = tLiverData(`deities.identification.${idStatus}.shortLabel`)
  const idTooltip = tLiverData(`deities.identification.${idStatus}.tooltip`)

  const showReadingPill = readingStatus !== "clear"
  const readingLabel = tLiverData(`deities.reading.${readingStatus}.shortLabel`)
  const readingTooltip =
    cellReadingNote || tLiverData(`deities.reading.${readingStatus}.tooltip`)

  const godForm = selectedInscriptionId
    ? getGodVariationInInscription(god.id, selectedInscriptionId)
    : godData.nameVariations[0]

  const groupColor = selectedInscriptionId
    ? godInscriptions.find((insc) => insc.id === selectedInscriptionId)
        ?.groupColor || "#8B6541"
    : godInscriptions[0]?.groupColor || "#8B6541"

  const filteredInscriptions = godInscriptions.filter(
    (inscription) => inscription.id !== selectedInscriptionId,
  )

  return (
    <Paper
      p={{ base: "sm", sm: "md" }}
      radius="md"
      className="bg-overlay border-accent text-secondary shadow-secondary font-primary deity-card"
      style={{
        borderLeft: "4px solid var(--accent-bronze)",
        backdropFilter: "blur(10px)",
        fontFamily: "var(--font-primary)",
      }}
    >
      <div className="deity-card-header">
        <div className="deity-card-title-group">
          <Group gap="xs" align="baseline" wrap="wrap">
            <Title
              order={1}
              className="text-bronze deity-name"
              size="xl"
              fw={400}
            >
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
        </div>
        <div className="deity-status-row">
          <Tooltip
            label={idTooltip}
            multiline
            w={260}
            withArrow
            classNames={tooltipClassNames}
            events={tooltipEvents}
          >
            <span className={`status-pill status-id status-id--${idStatus}`}>
              <span className="status-pill-key">
                {tLiverData("deities.ui.identificationKey", {
                  defaultValue: "Identification",
                })}
              </span>
              <span className="status-pill-value">{idLabel}</span>
            </span>
          </Tooltip>
          {showReadingPill && (
            <Tooltip
              label={readingTooltip}
              multiline
              w={260}
              withArrow
              classNames={tooltipClassNames}
              events={tooltipEvents}
            >
              <span
                className={`status-pill status-reading status-reading--${readingStatus}`}
              >
                <span className="status-pill-key">
                  {tLiverData("deities.ui.readingKey", {
                    defaultValue: "Reading",
                  })}
                </span>
                <span className="status-pill-value">{readingLabel}</span>
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {description && <Text className="deity-description">{description}</Text>}

      {parallels.length > 0 && (
        <div className="deity-section">
          <Title
            className="text-bronze deity-section-heading"
            order={2}
            size="sm"
            fw={600}
            tt="uppercase"
          >
            {tLiverData("deities.ui.classicalParallels")}
          </Title>
          <div className="deity-parallel-list">
            {parallels.map((p) => {
              const tradLabel =
                p.tradition === "roman"
                  ? t("connectors.roman")
                  : t("connectors.greek")
              const statusLabel = tLiverData(
                `deities.parallel.${p.status}.label`,
              )
              const statusTooltip = tLiverData(
                `deities.parallel.${p.status}.tooltip`,
              )
              return (
                <div
                  key={`${p.tradition}-${p.name}`}
                  className={`deity-parallel-row deity-parallel-row--${p.status}`}
                >
                  <span className="deity-parallel-tradition">{tradLabel}</span>
                  <span className="deity-parallel-name">{p.name}</span>
                  <span className="deity-parallel-status-slot">
                    <Tooltip
                      label={statusTooltip}
                      multiline
                      w={260}
                      withArrow
                      classNames={tooltipClassNames}
                      events={tooltipEvents}
                    >
                      <span
                        className={`parallel-status parallel-status--${p.status}`}
                      >
                        {statusLabel}
                      </span>
                    </Tooltip>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {filteredInscriptions.length > 0 && (
        <div className="deity-section">
          <Title
            className="text-bronze deity-section-heading"
            order={2}
            size="sm"
            fw={600}
            tt="uppercase"
          >
            {tLiverData("deities.ui.alsoAppearsIn")}
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

      {sources.length > 0 && (
        <div className="deity-sources">
          <span className="deity-sources-label">
            {tLiverData("deities.ui.sources")}
          </span>
          <span className="deity-sources-list">
            {sources.map((src, i) => {
              const url = getSourceUrl(src)
              const item = url ? (
                <a
                  className="deity-source-link"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={url}
                >
                  {src}
                </a>
              ) : (
                <span className="deity-source-text">{src}</span>
              )
              return (
                <span key={src} className="deity-source-item">
                  {item}
                  {i < sources.length - 1 ? (
                    <span className="deity-sources-sep">·</span>
                  ) : null}
                </span>
              )
            })}
          </span>
        </div>
      )}
    </Paper>
  )
}
