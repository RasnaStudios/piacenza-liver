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
    <Box className="contacts-board">
      <Box className="contacts-intro">
        <Box className="contacts-intro-copy">
          <Text className="contacts-section-title">
            {t("contactsModal.creditsTitle")}
          </Text>
          <Text className="contacts-intro-text">
            {t("contactsModal.summary")}
          </Text>
        </Box>

        <Box className="contacts-action-group">
          <Anchor
            href={mailtoUrl}
            className="contact-action contact-action-strong"
          >
            <FiMail size={16} />
            {t("contactsModal.emailCta")}
          </Anchor>
          <Anchor
            href={AppConfig.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-action"
          >
            <FaGithub size={16} />
            {t("contactsModal.repositoryCta")}
          </Anchor>
        </Box>
      </Box>

      <Box className="contacts-people-grid">
        <Box className="contact-person-card">
          <Text className="contact-person-role">
            {t("contactsModal.maintainerRole")}
          </Text>
          <Text className="contact-person-name">{AppConfig.creator.name}</Text>
          <Box className="contact-chip-row">
            <Anchor
              href={AppConfig.creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-chip"
            >
              <FaLinkedin size={16} />
              LinkedIn
            </Anchor>
            <Anchor
              href={AppConfig.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-chip"
            >
              <FaGithub size={16} />
              GitHub
            </Anchor>
          </Box>
        </Box>

        <Box className="contact-person-card">
          <Text className="contact-person-role">
            {t("contactsModal.artistRole")}
          </Text>
          <Text className="contact-person-name">{AppConfig.tampieri.name}</Text>
          <Box className="contact-chip-row">
            <Anchor
              href={AppConfig.tampieri.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-chip"
            >
              <FaLinkedin size={16} />
              LinkedIn
            </Anchor>
            <Anchor
              href={AppConfig.tampieri.artstation}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-chip"
            >
              <SiArtstation size={16} />
              ArtStation
            </Anchor>
            <Anchor
              href={AppConfig.tampieri.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-chip"
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
