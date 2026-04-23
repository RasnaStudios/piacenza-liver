import { useMediaQuery } from "@mantine/hooks"
import { useTranslation } from "react-i18next"
import { AppConfig } from "../../config/AppConfig"
import { AppModalShell } from "./AppModalShell"
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
    <AppModalShell
      opened={opened}
      onClose={onClose}
      title={t("buttons.contacts")}
      size={isMobile ? "calc(100vw - 16px)" : "min(860px, calc(100vw - 48px))"}
      contentClassName="contacts-modal-content"
      bodyClassName="contacts-modal-body"
      shellClassName="contacts-modal-shell"
      closeLabel={t("aria.closeControls")}
    >
      <ContactDetails mailtoUrl={mailtoUrl} />
    </AppModalShell>
  )
}
