import { Box, Group, Paper, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconArrowLeft } from "@tabler/icons-react"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import YAML from "yaml"
import { buildLiverDataset } from "../../data/LiverDataset"
import { buildLocalizedPath, getLocalePrefix } from "../../i18n/localeRouting"
import { getInscriptionHash, setAboutHash } from "../../navigation"
import type { Inscription, LiverGod } from "../../scene/LiverData"
import {
  getGodInscriptions,
  getGodsDisplayNames,
  getInscriptionGroup,
  liverGods,
  liverGroups,
  liverInscriptions,
} from "../../scene/LiverData"
import { ActionMenu } from "./ActionMenu"
import { DeityCard } from "./DeityCard"
import { Footer } from "./Footer"
import { InteractionButton } from "./InteractionButton"
import { NumberBadge } from "./NumberBadge"
import "../../styles/global.css"
import "./InscriptionExploration.css"

function getGodId(godEntry: { id: string; form: string } | string): string {
  return typeof godEntry === "string" ? godEntry : godEntry.id
}

interface InscriptionCardProps {
  inscription: Inscription
  isHovered: boolean
  isSelected: boolean
  inscriptionGroupColor: string
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

function InscriptionCard({
  inscription,
  isHovered,
  isSelected,
  inscriptionGroupColor,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: InscriptionCardProps) {
  return (
    <Box
      className={`inscription-card ${isSelected ? "selected" : ""}`}
      data-inscription-id={inscription.id}
      style={{
        borderColor: isSelected
          ? inscriptionGroupColor
          : isHovered
            ? `${inscriptionGroupColor}80`
            : `${inscriptionGroupColor}40`,
        background: isSelected
          ? `${inscriptionGroupColor}15`
          : isHovered
            ? `${inscriptionGroupColor}08`
            : "transparent",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <Group
        gap={12}
        align="center"
        wrap="nowrap"
        style={{
          width: "100%",
          minWidth: 0,
          margin: 4,
          padding: 4,
        }}
      >
        <Box
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          <NumberBadge value={inscription.id} size={32} />
        </Box>
        <Stack
          gap={1}
          style={{
            flex: 1,
            minWidth: 0,
            margin: 0,
            padding: 0,
            overflow: "visible",
          }}
        >
          <Text
            className="inscription-etruscan"
            style={{
              lineHeight: 1.1,
              margin: 0,
              padding: 0,
              overflow: "visible",
              whiteSpace: "normal",
            }}
          >
            {inscription.etruscanText}
          </Text>
          <Text
            className="inscription-transcription"
            style={{
              lineHeight: 1.1,
              margin: 0,
              padding: 0,
              overflow: "visible",
              whiteSpace: "normal",
            }}
          >
            {inscription.transcription}
          </Text>
          <Text className="inscription-gods">
            {getGodsDisplayNames(inscription.gods)}
          </Text>
        </Stack>
      </Group>
    </Box>
  )
}

interface InscriptionDetailsPanelProps {
  selectedInscription: Inscription
  borderColor: string
  onViewIn3D: (e: React.MouseEvent) => void
  onInscriptionSelect: (id: number, sectionId?: string) => void
  sectionId: string
}

function InscriptionDetailsPanel({
  selectedInscription,
  borderColor,
  onViewIn3D,
  onInscriptionSelect,
  sectionId,
}: InscriptionDetailsPanelProps) {
  const { t: tCommon } = useTranslation("common")
  return (
    <Box className="inscription-details-container" data-section={sectionId}>
      <Paper
        className="inscription-details-panel"
        style={{ borderLeftColor: borderColor }}
      >
        <Stack gap="md">
          <div>
            <div className="deities-grid">
              {selectedInscription.gods.map((godEntry) => {
                const godId = getGodId(godEntry)
                const god = (liverGods as Record<string, LiverGod>)[godId]
                if (!god) return null

                return (
                  <DeityCard
                    key={godId}
                    god={god}
                    selectedInscriptionId={selectedInscription.id}
                    onInscriptionClick={(inscriptionId) => {
                      const targetGroup = getInscriptionGroup(inscriptionId)
                      onInscriptionSelect(inscriptionId, targetGroup?.id)
                    }}
                  />
                )
              })}
            </div>
          </div>
          <InteractionButton onClick={onViewIn3D} size="md" variant="outline">
            {tCommon("buttons.viewIn3D")}
          </InteractionButton>
        </Stack>
      </Paper>
    </Box>
  )
}

export function InscriptionExploration() {
  const { t } = useTranslation("exploration")
  const { i18n, t: tCommon } = useTranslation("common")
  const { t: tLiverData } = useTranslation("liverData")
  const navigate = useNavigate()
  const localePrefix = getLocalePrefix(i18n.language)
  const inscriptionsPath = buildLocalizedPath("/inscriptions", localePrefix)
  const homePath = buildLocalizedPath("/", localePrefix)
  const isCompactLayout = useMediaQuery("(max-width: 640px)")
  const deityLookup = useMemo(() => {
    const map = new Map<string, string>()
    Object.entries(liverGods).forEach(([id, god]) => {
      const lowerId = id.toLowerCase()
      if (!map.has(lowerId)) {
        map.set(lowerId, id)
      }
      const nameKey = god.name?.toLowerCase()
      if (nameKey && !map.has(nameKey)) {
        map.set(nameKey, id)
      }
    })
    return map
  }, [])
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedInscriptionId, setSelectedInscriptionId] = useState<
    number | null
  >(null)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById("root")
    const origOverflow = {
      html: html.style.overflow,
      body: body.style.overflow,
    }
    const origRoot = root
      ? {
          overflow: root.style.overflow,
          position: root.style.position,
          height: root.style.height,
          background: root.style.background,
        }
      : null
    const origBg = { html: html.style.background, body: body.style.background }

    html.style.overflow = "auto"
    html.style.background = "#000000"
    body.style.overflow = "auto"
    body.style.background = "#000000"
    if (root) {
      root.style.overflow = "auto"
      root.style.position = "relative"
      root.style.height = "auto"
      root.style.background = "#000000"
    }

    return () => {
      html.style.overflow = origOverflow.html
      html.style.background = origBg.html
      body.style.overflow = origOverflow.body
      body.style.background = origBg.body
      if (root && origRoot) {
        root.style.overflow = origRoot.overflow
        root.style.position = origRoot.position
        root.style.height = origRoot.height
        root.style.background = origRoot.background
      }
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return

      const inscriptionId = Number.parseInt(hash, 10)
      if (!Number.isNaN(inscriptionId)) {
        const inscription = liverInscriptions.find(
          (ins) => ins.id === inscriptionId,
        )
        if (inscription) {
          setSelectedInscriptionId(inscriptionId)
          setTimeout(() => {
            const card = document.querySelector(
              `.inscription-card[data-inscription-id="${inscriptionId}"]`,
            )
            if (card) {
              card.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }, 100)
          return
        }
      }

      const group = Object.values(liverGroups).find(
        (g) => g.id.toLowerCase() === hash.toLowerCase(),
      )
      if (group) {
        setTimeout(() => {
          const section = document.querySelector(
            `.group-section[data-section="${group.id}"]`,
          )
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
        return
      }

      const godId = deityLookup.get(hash.toLowerCase())
      if (godId) {
        setTimeout(() => {
          const section = document.querySelector(
            `.group-section[data-section="${godId}"]`,
          )
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const getGroupColor = (inscriptionId: number) => {
    const group = getInscriptionGroup(inscriptionId)
    return group?.color || "#888"
  }

  const scrollToDetails = (sectionId?: string) => {
    setTimeout(() => {
      let detailsContainer: Element | null = null

      if (sectionId) {
        detailsContainer = document.querySelector(
          `.group-section[data-section="${sectionId}"] .inscription-details-container`,
        )
      } else {
        detailsContainer = document.querySelector(
          `.group-section:has(.inscription-details-container) .inscription-details-container`,
        )
      }

      if (detailsContainer) {
        detailsContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
      }
    }, 100)
  }

  const handleInscriptionClick = (
    inscription: Inscription,
    sectionId?: string,
  ) => {
    if (selectedInscriptionId === inscription.id) {
      setSelectedInscriptionId(null)
      window.history.pushState(null, "", inscriptionsPath)
    } else {
      setSelectedInscriptionId(inscription.id)
      window.history.pushState(
        null,
        "",
        `${inscriptionsPath}#${inscription.id}`,
      )
      scrollToDetails(sectionId)
    }
  }

  const handleInscriptionSelect = (id: number, sectionId?: string) => {
    setSelectedInscriptionId(id)
    window.history.pushState(null, "", `${inscriptionsPath}#${id}`)

    const inscription = liverInscriptions.find((ins) => ins.id === id)
    if (!inscription) return

    const targetGroup = sectionId
      ? Object.values(liverGroups).find((g) => g.id === sectionId) ||
        getInscriptionGroup(id)
      : getInscriptionGroup(id)
    if (!targetGroup) return

    const scrollToDetailsPanel = (attempts = 0) => {
      if (attempts > 10) return

      requestAnimationFrame(() => {
        const groupSection = document.querySelector(
          `.group-section[data-section="${targetGroup.id}"]`,
        )
        const selectedCard = document.querySelector(
          `.inscription-card[data-inscription-id="${id}"]`,
        )
        const detailsContainer =
          document.querySelector(
            `.group-section[data-section="${targetGroup.id}"] .inscription-details-container`,
          ) ||
          document.querySelector(
            `.inscription-details-container[data-section="${targetGroup.id}"]`,
          )

        if (groupSection && selectedCard) {
          selectedCard.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        } else if (groupSection) {
          groupSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        } else if (detailsContainer) {
          detailsContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        } else {
          setTimeout(() => scrollToDetailsPanel(attempts + 1), 50)
        }
      })
    }

    setTimeout(() => scrollToDetailsPanel(), 100)
  }

  const handleViewIn3D = (inscription: Inscription, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`${homePath}${getInscriptionHash(inscription.id)}`)
  }

  const handleDownloadYAML = () => {
    const data = buildLiverDataset(tLiverData)

    const yamlContent = YAML.stringify(data)
    const blob = new Blob([yamlContent], { type: "application/x-yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "piacenza-liver-dataset.yaml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const inscriptionsByGroup = Object.values(liverGroups).map((group) => ({
    group,
    inscriptions: liverInscriptions.filter((ins) =>
      group.positions.includes(ins.id),
    ),
  }))

  const deitiesWithInscriptions = Object.entries(liverGods)
    .map(([godId, god]) => ({
      godId,
      god,
      inscriptions: getGodInscriptions(godId),
    }))
    .filter(({ inscriptions }) => inscriptions.length > 0)
    .sort((a, b) => a.god.name.localeCompare(b.god.name))

  return (
    <Box
      className="scrollbar inscription-exploration"
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        color: "#c9a876",
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
        background: "#000000",
      }}
    >
      <Box className="back-button-container" onClick={() => navigate(homePath)}>
        <IconArrowLeft size={32} stroke={2} />
      </Box>
      <ActionMenu
        onAboutClick={() => {
          navigate(homePath)
          setAboutHash()
        }}
        onExploreClick={() => {}}
        isVisible={true}
        hideExploreInscriptions={true}
        hideControls={true}
      />
      <div className="exploration-header">
        <h2 className="exploration-title">{t("title")}</h2>
        <p className="exploration-subtitle">{t("subtitle")}</p>
        <InteractionButton
          onClick={handleDownloadYAML}
          size="md"
          variant="outline"
        >
          {tCommon("buttons.downloadDataset")}
        </InteractionButton>
      </div>

      <div className="exploration-content">
        <h2 className="exploration-section-title" style={{ marginTop: 0 }}>
          {t("exploreByZone")}
        </h2>
        {inscriptionsByGroup.map(({ group, inscriptions }) => {
          const selectedInscription = selectedInscriptionId
            ? liverInscriptions.find((ins) => ins.id === selectedInscriptionId)
            : null
          const showDetailsForThisGroup =
            selectedInscription &&
            group.positions.includes(selectedInscription.id)

          return (
            <div
              key={group.id}
              className="group-section"
              data-section={group.id}
            >
              <div
                className="group-header"
                style={{ borderLeftColor: group.color }}
              >
                <h3 className="group-title">
                  {tLiverData(`groups.${group.id}.name`)}
                </h3>
                <Text className="group-description description-text">
                  {tLiverData(`groups.${group.id}.description`)}
                </Text>
              </div>
              <div className="inscriptions-grid">
                {inscriptions.map((inscription) => {
                  const isSelected = selectedInscriptionId === inscription.id
                  const showInlineDetails =
                    isCompactLayout &&
                    showDetailsForThisGroup &&
                    selectedInscription &&
                    isSelected

                  return (
                    <Fragment key={inscription.id}>
                      <InscriptionCard
                        inscription={inscription}
                        isHovered={hoveredId === inscription.id}
                        isSelected={isSelected}
                        inscriptionGroupColor={getGroupColor(inscription.id)}
                        onMouseEnter={() => setHoveredId(inscription.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() =>
                          handleInscriptionClick(inscription, group.id)
                        }
                      />
                      {showInlineDetails && (
                        <div className="inscription-details-inline">
                          <InscriptionDetailsPanel
                            selectedInscription={selectedInscription}
                            borderColor={getGroupColor(selectedInscription.id)}
                            onViewIn3D={(e) =>
                              handleViewIn3D(selectedInscription, e)
                            }
                            onInscriptionSelect={(id) =>
                              handleInscriptionSelect(id, group.id)
                            }
                            sectionId={group.id}
                          />
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
              {!isCompactLayout &&
                showDetailsForThisGroup &&
                selectedInscription && (
                  <InscriptionDetailsPanel
                    selectedInscription={selectedInscription}
                    borderColor={
                      showDetailsForThisGroup && selectedInscription
                        ? getGroupColor(selectedInscription.id)
                        : group.color
                    }
                    onViewIn3D={(e) => handleViewIn3D(selectedInscription, e)}
                    onInscriptionSelect={(id) =>
                      handleInscriptionSelect(id, group.id)
                    }
                    sectionId={group.id}
                  />
                )}
            </div>
          )
        })}

        <h2 className="exploration-section-title">{t("exploreByDeity")}</h2>
        {deitiesWithInscriptions.map(({ godId, god, inscriptions }) => {
          const headerColor = getGroupColor(inscriptions[0]?.id) || "#8B6541"

          return (
            <div key={godId} className="group-section" data-section={godId}>
              <div
                className="group-header"
                style={{ borderLeftColor: headerColor }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "16px",
                    marginBottom: "8px",
                  }}
                >
                  <h3 className="group-title" style={{ marginBottom: 0 }}>
                    {god.name}
                  </h3>
                  <Text className="deity-inscription-count">
                    {inscriptions.length}{" "}
                    {inscriptions.length === 1
                      ? t("inscriptionCount.singular")
                      : t("inscriptionCount.plural")}
                  </Text>
                </div>
                {(() => {
                  const roman = tLiverData(`deities.${godId}.romanEquivalent`, {
                    defaultValue: "",
                  })
                  const greek = tLiverData(`deities.${godId}.greekEquivalent`, {
                    defaultValue: "",
                  })
                  return roman || greek ? (
                    <div className="deity-equivalents">
                      {roman && (
                        <span>
                          <span className="deity-equiv-label">
                            {tCommon("connectors.roman")}{" "}
                          </span>
                          <span className="deity-equiv-value">{roman}</span>
                        </span>
                      )}
                      {roman && greek && (
                        <span className="deity-equiv-separator"> • </span>
                      )}
                      {greek && (
                        <span>
                          <span className="deity-equiv-label">
                            {tCommon("connectors.greek")}{" "}
                          </span>
                          <span className="deity-equiv-value">{greek}</span>
                        </span>
                      )}
                    </div>
                  ) : null
                })()}
                {tLiverData(`deities.${god.id}.description`) && (
                  <Text
                    className="group-description description-text"
                    style={{ marginTop: "12px" }}
                  >
                    {tLiverData(`deities.${god.id}.description`)}
                  </Text>
                )}
              </div>
              <div className="inscriptions-grid">
                {inscriptions.map((inscription) => (
                  <div key={inscription.id} style={{ position: "relative" }}>
                    <InscriptionCard
                      inscription={inscription}
                      isHovered={hoveredId === inscription.id}
                      isSelected={selectedInscriptionId === inscription.id}
                      inscriptionGroupColor={getGroupColor(inscription.id)}
                      onMouseEnter={() => setHoveredId(inscription.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() =>
                        setSelectedInscriptionId(
                          inscription.id === selectedInscriptionId
                            ? null
                            : inscription.id,
                        )
                      }
                    />
                    {selectedInscriptionId === inscription.id && (
                      <div className="deity-inscription-tooltip">
                        <InteractionButton
                          onClick={(e) => handleViewIn3D(inscription, e)}
                          size="sm"
                          variant="outline"
                        >
                          {tCommon("buttons.viewIn3D")}
                        </InteractionButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <Footer />
    </Box>
  )
}
