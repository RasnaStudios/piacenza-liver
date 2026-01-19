import { Box, Stack, Text, Transition } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { SceneConfig } from "../../config/SceneConfig"
import {
  liverGods,
  liverGroups,
  liverInscriptions,
} from "../../scene/LiverData"
import { InteractionButton } from "./InteractionButton"
import "./About.css"

interface AboutProps {
  onStartInteraction: () => void
  isVisible: boolean
  isLoading: boolean
}

export function About({
  onStartInteraction,
  isVisible,
  isLoading,
}: AboutProps) {
  const { t } = useTranslation("about")
  const { t: tCommon } = useTranslation("common")
  const totalInscriptions = liverInscriptions.length
  const totalZones = Object.keys(liverGroups).length
  const totalDeities = Object.keys(liverGods).length

  if (isLoading) {
    return null
  }

  const sections = t("sections", {
    returnObjects: true,
  }) as Record<string, { heading: string; content: string }>
  const sectionEntries = Object.entries(sections)

  return (
    <Transition
      mounted={isVisible}
      transition="fade"
      duration={SceneConfig.ui.aboutFadeDuration}
      exitDuration={SceneConfig.ui.aboutExitDuration}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Box className="about-container" style={styles}>
          <Stack align="center" gap="xl" className="about-stack">
            <Text className="about-subtitle">{t("subtitle")}</Text>
            <Text component="p" className="description-text">
              {t("intro", { totalInscriptions, totalZones, totalDeities })}
            </Text>
            {sectionEntries.map(([key, section]) => {
              const heading = t(`sections.${key}.heading`, {
                defaultValue: section?.heading,
              })
              const content = t(`sections.${key}.content`, {
                totalInscriptions,
                totalZones,
                totalDeities,
                defaultValue: section?.content,
              })
              return (
                <div key={heading || key}>
                  <Text component="h3" className="about-subtitle">
                    {heading}
                  </Text>
                  <Text component="p" className="description-text">
                    {content}
                  </Text>
                </div>
              )
            })}
            <InteractionButton
              onClick={onStartInteraction}
              variant="text"
              size="lg"
            >
              {tCommon("buttons.exploreLiver")}
            </InteractionButton>
          </Stack>
        </Box>
      )}
    </Transition>
  )
}
