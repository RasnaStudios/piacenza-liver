import { Anchor, Box, Text } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"
import { FiMail } from "react-icons/fi"
import { SiArtstation } from "react-icons/si"
import { AppConfig } from "../../config/AppConfig"

interface ContactDetailsProps {
  mailtoUrl: string
}

export function ContactDetails({ mailtoUrl }: ContactDetailsProps) {
  const { t } = useTranslation("common")

  return (
    <Box className="app-modal-card app-modal-stack">
      <Box className="app-modal-panel contacts-summary-panel">
        <Box className="contacts-intro-copy">
          <Text className="app-modal-kicker contacts-section-title">
            {t("contactsModal.creditsTitle")}
          </Text>
          <Text className="app-modal-copy contacts-summary-copy">
            {t("contactsModal.summary")}
          </Text>
        </Box>

        <Box className="app-modal-actions contacts-action-group">
          <Anchor
            href={mailtoUrl}
            className="app-modal-action app-modal-action-primary"
          >
            <FiMail size={16} />
            {t("contactsModal.emailCta")}
          </Anchor>
          <Anchor
            href={AppConfig.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="app-modal-action"
          >
            <FaGithub size={16} />
            {t("contactsModal.repositoryCta")}
          </Anchor>
        </Box>
      </Box>

      <Box className="app-modal-grid-2 contacts-people-grid">
        <Box className="app-modal-panel contacts-person-card">
          <Text className="app-modal-kicker contact-person-role">
            {t("contactsModal.maintainerRole")}
          </Text>
          <Text className="app-modal-item-title contact-person-name">
            {AppConfig.creator.name}
          </Text>
          <Box className="app-modal-actions contact-chip-row">
            <Anchor
              href={AppConfig.creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="app-modal-pill"
            >
              <FaLinkedin size={16} />
              LinkedIn
            </Anchor>
            <Anchor
              href={AppConfig.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="app-modal-pill"
            >
              <FaGithub size={16} />
              GitHub
            </Anchor>
          </Box>
        </Box>

        <Box className="app-modal-panel contacts-person-card">
          <Text className="app-modal-kicker contact-person-role">
            {t("contactsModal.artistRole")}
          </Text>
          <Text className="app-modal-item-title contact-person-name">
            {AppConfig.tampieri.name}
          </Text>
          <Box className="app-modal-actions contact-chip-row contact-chip-row-inline">
            <Anchor
              href={AppConfig.tampieri.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="app-modal-pill"
            >
              <FaLinkedin size={16} />
              LinkedIn
            </Anchor>
            <Anchor
              href={AppConfig.tampieri.artstation}
              target="_blank"
              rel="noopener noreferrer"
              className="app-modal-pill"
            >
              <SiArtstation size={16} />
              ArtStation
            </Anchor>
            <Anchor
              href={AppConfig.tampieri.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="app-modal-pill"
            >
              <FaInstagram size={16} />
              Instagram
            </Anchor>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
