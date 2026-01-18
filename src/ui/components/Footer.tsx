import { Box, Text } from "@mantine/core"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { AppConfig } from "../../config/AppConfig"
import "./Footer.css"

const MAILTO_URL = `mailto:${AppConfig.feedbackEmail}?subject=${encodeURIComponent("Feedback on Piacenza Liver information")}&body=${encodeURIComponent("I noticed the following incorrect or incomplete information:\n\n")}`

export function Footer() {
  const { creator } = AppConfig
  return (
    <footer className="site-footer">
      <Box className="footer-content">
        <Text className="footer-credit">
          Information compiled by{" "}
          <span className="footer-name">{creator.name}</span>
          <span className="footer-creator-links">
            <a
              href={creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={22} />
            </a>
            <a
              href={creator.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub size={22} />
            </a>
          </span>
        </Text>
        <div className="footer-feedback">
          <Text className="footer-feedback-text">
            Do you see incorrect information?{" "}
            <a
              href={MAILTO_URL}
              className="footer-write-me"
              rel="noopener noreferrer"
            >
              Write me
            </a>
          </Text>
        </div>
      </Box>
    </footer>
  )
}
