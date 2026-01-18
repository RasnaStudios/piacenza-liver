import { Anchor, Box, Divider, Stack, Text } from "@mantine/core"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"
import { SiArtstation } from "react-icons/si"
import { AppConfig } from "../../config/AppConfig"
import { ActionButtons } from "./ActionButtons"

interface PanelLegendProps {
  onAboutClick?: () => void
  onExploreClick?: () => void
}

export function PanelLegend({
  onAboutClick,
  onExploreClick,
}: PanelLegendProps) {
  const { t } = useTranslation("common")

  return (
    <Box p="md">
      <Stack gap="md">
        {/* Action Buttons Section - Landscape mode only */}
        {!isMobile && (
          <ActionButtons
            onAboutClick={onAboutClick}
            onExploreClick={onExploreClick}
            showLanguageSwitcher={true}
            disableAnimation={true}
          />
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
            {t("instructions.doubleTapOnModelToReset")}
          </Text>
        )}

        <Divider color="var(--border-secondary)" />

        {/* Credits Section */}
        <Stack gap="lg" style={{ textAlign: "center" }}>
          <Text size="lg" className="text-bronze" tt="uppercase">
            {t("labels.createdBy")}
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
              href={AppConfig.repositoryUrl}
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
              {t("buttons.contribute")} <FaGithub size={30} />
            </Anchor>
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
