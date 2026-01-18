import { Box, Group, Paper, Stack, Text } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import YAML from "yaml"
import { AppConfig } from "../../config/AppConfig"
import { getInscriptionHash } from "../../navigation"
import type { Inscription, LiverGod } from "../../scene/LiverData"
import {
  liverGods,
  liverGroups,
  liverInscriptions,
} from "../../scene/LiverData"
import {
  getGodInscriptions,
  getGodsDisplayNames,
  getInscriptionGroup,
} from "../../utils/liverUtils"
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
            View in 3D Visualization
          </InteractionButton>
        </Stack>
      </Paper>
    </Box>
  )
}

export function InscriptionExploration() {
  const navigate = useNavigate()
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
              card.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 100)
          return
        }
      }

      const group = Object.values(liverGroups).find(
        (g) =>
          g.id.toLowerCase() === hash.toLowerCase() ||
          g.name.toLowerCase() === hash.toLowerCase(),
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

      const deity = Object.entries(liverGods).find(
        ([id, god]) =>
          id.toLowerCase() === hash.toLowerCase() ||
          god.name.toLowerCase() === hash.toLowerCase(),
      )
      if (deity) {
        const [godId] = deity
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
      window.history.pushState(null, "", "/inscriptions")
    } else {
      setSelectedInscriptionId(inscription.id)
      window.history.pushState(null, "", `/inscriptions#${inscription.id}`)
      scrollToDetails(sectionId)
    }
  }

  const handleInscriptionSelect = (id: number, sectionId?: string) => {
    setSelectedInscriptionId(id)
    window.history.pushState(null, "", `/inscriptions#${id}`)

    setTimeout(() => {
      const card = document.querySelector(
        `.inscription-card[data-inscription-id="${id}"]`,
      )
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (sectionId) {
        scrollToDetails(sectionId)
      }
    }, 100)
  }

  const handleViewIn3D = (inscription: Inscription, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/${getInscriptionHash(inscription.id)}`)
  }

  const handleDownloadYAML = () => {
    const zones = Object.entries(liverGroups).map(([zoneId, group]) => {
      const inscriptions = liverInscriptions
        .filter((ins) => getInscriptionGroup(ins.id)?.id === zoneId)
        .map((ins) => {
          const entry: {
            id: number
            etruscanText: string
            transcription: string
            gods: string[]
            description?: string
          } = {
            id: ins.id,
            etruscanText: ins.etruscanText,
            transcription: ins.transcription,
            gods: ins.gods.map((g) => (typeof g === "string" ? g : g.id)),
          }
          if (ins.description) entry.description = ins.description
          return entry
        })
      return {
        id: zoneId,
        name: group.name,
        description: group.description,
        inscriptions,
      }
    })

    const deities = Object.entries(liverGods).map(([id, deity]) => {
      const d: {
        id: string
        name: string
        romanEquivalent: string
        greekEquivalent?: string
      } = {
        id,
        name: deity.name,
        romanEquivalent: (deity as LiverGod).romanEquivalent ?? "N/A",
      }
      const greek = (deity as LiverGod).greekEquivalent
      if (greek) d.greekEquivalent = greek
      return d
    })

    const data = {
      metadata: {
        title: "Piacenza Liver Dataset - Complete Archaeological Data",
        totalInscriptions: liverInscriptions.length,
        totalZones: Object.keys(liverGroups).length,
        totalDeities: Object.keys(liverGods).length,
        creator: AppConfig.creator.name,
        source: "https://liver.rasna.dev/",
      },
      zones,
      deities,
    }

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
      <Box className="back-button-container" onClick={() => navigate("/")}>
        <IconArrowLeft size={24} stroke={1.5} />
      </Box>
      <div className="exploration-header">
        <h2 className="exploration-title">Explore All Inscriptions</h2>
        <p
          className="exploration-subtitle"
          style={{
            fontFamily:
              "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          }}
        >
          Click any inscription to view details. &quot;View in 3D
          Visualization&quot; opens the 3D scene.
        </p>
        <InteractionButton
          onClick={handleDownloadYAML}
          size="md"
          variant="outline"
        >
          Download Dataset
        </InteractionButton>
      </div>

      <div className="exploration-content">
        <h2 className="exploration-section-title" style={{ marginTop: 0 }}>
          Explore by Zone
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
                <h3 className="group-title">{group.name}</h3>
                <Text
                  className="group-description description-text"
                  style={{
                    fontFamily:
                      "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                  }}
                >
                  {group.description}
                </Text>
              </div>
              <div className="inscriptions-grid">
                {inscriptions.map((inscription) => (
                  <InscriptionCard
                    key={inscription.id}
                    inscription={inscription}
                    isHovered={hoveredId === inscription.id}
                    isSelected={selectedInscriptionId === inscription.id}
                    inscriptionGroupColor={getGroupColor(inscription.id)}
                    onMouseEnter={() => setHoveredId(inscription.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() =>
                      handleInscriptionClick(inscription, group.id)
                    }
                  />
                ))}
              </div>
              {showDetailsForThisGroup && selectedInscription && (
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

        <h2 className="exploration-section-title">Explore by Deity</h2>
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
                    {inscriptions.length} inscription
                    {inscriptions.length !== 1 ? "s" : ""}
                  </Text>
                </div>
                {((god as LiverGod).romanEquivalent ||
                  (god as LiverGod).greekEquivalent) && (
                  <div className="deity-equivalents">
                    {(god as LiverGod).romanEquivalent && (
                      <span>
                        <span className="deity-equiv-label">Roman:</span>{" "}
                        <span className="deity-equiv-value">
                          {(god as LiverGod).romanEquivalent}
                        </span>
                      </span>
                    )}
                    {(god as LiverGod).romanEquivalent &&
                      (god as LiverGod).greekEquivalent && (
                        <span className="deity-equiv-separator"> • </span>
                      )}
                    {(god as LiverGod).greekEquivalent && (
                      <span>
                        <span className="deity-equiv-label">Greek:</span>{" "}
                        <span className="deity-equiv-value">
                          {(god as LiverGod).greekEquivalent}
                        </span>
                      </span>
                    )}
                  </div>
                )}
                {god.description && (
                  <Text
                    className="group-description description-text"
                    style={{
                      marginTop: "12px",
                      fontFamily:
                        "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                    }}
                  >
                    {god.description}
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
                          View in 3D Visualization
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
