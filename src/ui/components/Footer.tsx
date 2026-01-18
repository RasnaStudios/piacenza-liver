import { Box, Text } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { AppConfig } from "../../config/AppConfig"
import { FeedbackSection } from "./FeedbackSection"
import "./Footer.css"

export function Footer() {
  const { t } = useTranslation("common")
  const { creator } = AppConfig

  return (
    <footer className="site-footer">
      <Box className="footer-content">
        <Text className="footer-credit">
          {t("footer.compiledBy")}{" "}
          <span className="footer-name">{creator.name}</span>
          <span className="footer-creator-links">
            <a
              href={creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("aria.linkedIn")}
            >
              <FaLinkedin size={22} />
            </a>
            <a
              href={creator.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("aria.github")}
            >
              <FaGithub size={22} />
            </a>
          </span>
        </Text>
        <FeedbackSection variant="footer" />
      </Box>
    </footer>
  )
}
