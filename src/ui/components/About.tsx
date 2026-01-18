import { Box, Stack, Text, Transition } from "@mantine/core"
import { aboutContent } from "../../config/AboutContent"
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
  const totalInscriptions = liverInscriptions.length
  const totalZones = Object.keys(liverGroups).length
  const totalDeities = Object.keys(liverGods).length

  if (isLoading) {
    return null
  }

  const interpolateText = (text: string): string => {
    return text
      .replace(/{totalInscriptions}/g, totalInscriptions.toString())
      .replace(/{totalZones}/g, totalZones.toString())
      .replace(/{totalDeities}/g, totalDeities.toString())
  }

  return (
    <Transition
      mounted={isVisible}
      transition="fade"
      duration={1600}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Box className="about-container" style={styles}>
          <Stack align="center" gap="xl" className="about-stack">
            <Text className="about-subtitle">{aboutContent.subtitle}</Text>
            <Text component="p" className="description-text">
              {interpolateText(aboutContent.intro)}
            </Text>
            {aboutContent.sections.map((section) => (
              <div key={section.heading}>
                <Text component="h3" className="about-subtitle">
                  {section.heading}
                </Text>
                <Text component="p" className="description-text">
                  {interpolateText(section.content)}
                </Text>
              </div>
            ))}
            <InteractionButton
              onClick={onStartInteraction}
              variant="text"
              size="lg"
            >
              {aboutContent.buttonText}
            </InteractionButton>
          </Stack>
        </Box>
      )}
    </Transition>
  )
}
