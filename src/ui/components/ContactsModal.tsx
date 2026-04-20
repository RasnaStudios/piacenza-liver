import { Box, Group, Modal, Title } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconX } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { AppConfig } from "../../config/AppConfig"
import { ContactDetails } from "./ContactDetails"
import "./ContactsModal.css"

interface ContactsModalProps {
  opened: boolean
  onClose: () => void
}

export function ContactsModal({ opened, onClose }: ContactsModalProps) {
  const { t } = useTranslation("common")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const subject = t("footer.mailtoSubject")
  const body = t("footer.mailtoBody")
  const mailtoUrl = `mailto:${AppConfig.feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size={isMobile ? "calc(100vw - 16px)" : "min(860px, calc(100vw - 48px))"}
      centered
      zIndex={2000}
      classNames={{
        content: "contacts-modal-content",
        body: "contacts-modal-body",
      }}
      styles={{
        content: {
          backgroundColor: "var(--primary-bg)",
          border: "1px solid var(--border-primary)",
          borderRadius: isMobile ? "16px" : "20px",
          boxShadow: "var(--shadow-primary)",
          fontFamily: "var(--font-primary)",
          maxHeight: isMobile ? "calc(100dvh - 12px)" : "calc(100vh - 56px)",
          overflow: "hidden",
        },
        body: {
          backgroundColor: "var(--primary-bg)",
          padding: "0",
          fontFamily: "var(--font-primary)",
          overflow: isMobile ? "auto" : "hidden",
        },
      }}
    >
      <Group
        align="center"
        justify="space-between"
        p={isMobile ? "sm" : "md"}
        pb={isMobile ? 6 : "xs"}
      >
        <Title order={3} className="text-bronze font-display">
          {t("buttons.contacts")}
        </Title>
        <Box
          className="close-button-container contacts-close-button"
          onClick={onClose}
          aria-label={t("aria.closeControls")}
          title={t("aria.closeControls")}
        >
          <IconX size={24} stroke={1.5} />
        </Box>
      </Group>
      <Box className="contacts-modal-shell">
        <ContactDetails mailtoUrl={mailtoUrl} />
      </Box>
    </Modal>
  )
}
