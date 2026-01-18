import { Anchor, Box, Divider, Stack, Text } from "@mantine/core"
import { useState } from "react"
import { isMobile } from "react-device-detect"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"
import { SiArtstation } from "react-icons/si"
import { AppConfig } from "../../config/AppConfig"
import { ControlsModal } from "./ControlsModal"
import { InteractionButton } from "./InteractionButton"

interface PanelLegendProps {
  onAboutClick?: () => void
  onExploreClick?: () => void
}

export function PanelLegend({
  onAboutClick,
  onExploreClick,
}: PanelLegendProps) {
  const [controlsOpened, setControlsOpened] = useState(false)

  return (
    <Box p="md">
      <Stack gap="md">
        {/* Action Buttons Section - Landscape mode only */}
        {!isMobile && onAboutClick && onExploreClick && (
          <Stack gap="xs">
            <InteractionButton onClick={onAboutClick} variant="text" size="md">
              About the Liver
            </InteractionButton>
            <InteractionButton
              onClick={onExploreClick}
              variant="text"
              size="md"
            >
              Explore inscriptions
            </InteractionButton>
            <InteractionButton
              onClick={() => setControlsOpened(true)}
              variant="text"
              size="md"
            >
              Controls
            </InteractionButton>
          </Stack>
        )}

        {/* Mobile: Reset instruction */}
        {isMobile && (
          <Text
            size="lg"
            className="text-tertiary"
            style={{
              fontFamily: "var(--font-primary)",
              textAlign: "center",
            }}
          >
            Double tap on the model to reset the view
          </Text>
        )}

        <Divider color="var(--border-secondary)" />

        {/* Credits Section */}
        <Stack gap="lg" style={{ textAlign: "center" }}>
          <Text size="lg" className="text-bronze" tt="uppercase">
            Created by
          </Text>

          {/* Team Members - Side by Side */}
          <Box
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: "32px",
            }}
          >
            <Box style={{ textAlign: "center" }}>
              <Text
                size="xl"
                className="text-secondary"
                style={{
                  fontFamily: "var(--font-primary)",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                {AppConfig.creator.name}
              </Text>
              <Text
                size="lg"
                className="text-tertiary"
                style={{ fontStyle: "italic", marginBottom: "12px" }}
              >
                {AppConfig.creator.role}
              </Text>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <Anchor
                  href={AppConfig.creator.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin size={30} color="var(--bronze-text)" />
                </Anchor>
                <Anchor
                  href={AppConfig.creator.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub size={30} color="var(--bronze-text)" />
                </Anchor>
              </Box>
            </Box>

            <Box style={{ textAlign: "center" }}>
              <Text
                size="xl"
                className="text-secondary"
                style={{
                  fontFamily: "var(--font-primary)",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                {AppConfig.tampieri.name}
              </Text>
              <Text
                size="lg"
                className="text-tertiary"
                mb="12px"
                style={{ fontStyle: "italic" }}
              >
                {AppConfig.tampieri.role}
              </Text>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <Anchor
                  href={AppConfig.tampieri.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin size={30} color="var(--bronze-text)" />
                </Anchor>
                <Anchor
                  href={AppConfig.tampieri.artstation}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiArtstation size={30} color="var(--bronze-text)" />
                </Anchor>
                <Anchor
                  href={AppConfig.tampieri.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={30} color="var(--bronze-text)" />
                </Anchor>
              </Box>
            </Box>
          </Box>

          {/* Studio Links */}
          <Box
            mt="16px"
            display="flex"
            style={{
              justifyContent: "center",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <Anchor
              href="https://github.com/rasnastudios/piacenza-liver"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--bronze-text)",
                fontSize: "20px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Contribute <FaGithub size={30} />
            </Anchor>
          </Box>
        </Stack>
      </Stack>

      {!isMobile && (
        <ControlsModal
          opened={controlsOpened}
          onClose={() => setControlsOpened(false)}
        />
      )}
    </Box>
  )
}
