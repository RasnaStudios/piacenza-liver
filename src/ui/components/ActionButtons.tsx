import { Stack } from "@mantine/core"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { BibliographyModal } from "./BibliographyModal"
import { ContactsModal } from "./ContactsModal"
import { ControlsModal } from "./ControlsModal"
import { InteractionButton } from "./InteractionButton"
import { LanguageModal } from "./LanguageModal"

interface ActionButtonsProps {
  onAboutClick?: () => void
  onExploreClick?: () => void
  showLanguageSwitcher?: boolean
  disableAnimation?: boolean
  hideExploreInscriptions?: boolean
  hideControls?: boolean
  align?: "left" | "right"
  onAction?: () => void
}

export function ActionButtons({
  onAboutClick,
  onExploreClick,
  showLanguageSwitcher = false,
  disableAnimation = false,
  hideExploreInscriptions = false,
  hideControls = false,
  align = "left",
  onAction,
}: ActionButtonsProps) {
  const { t, i18n } = useTranslation("common")
  const [controlsOpened, setControlsOpened] = useState(false)
  const [languageModalOpened, setLanguageModalOpened] = useState(false)
  const [bibliographyModalOpened, setBibliographyModalOpened] = useState(false)
  const [contactsModalOpened, setContactsModalOpened] = useState(false)

  const isEnglish = i18n.language === "en_US"
  const languageButtonText = isEnglish
    ? "Language"
    : `Language / ${t("buttons.language")}`
  const contactButtonText = t("buttons.contacts")

  if (!onAboutClick) {
    return null
  }

  const alignStyles =
    align === "right"
      ? {
          alignItems: "flex-end",
          textAlign: "right" as const,
        }
      : undefined

  return (
    <>
      <Stack gap="xs" style={alignStyles}>
        <InteractionButton
          onClick={() => {
            onAction?.()
            onAboutClick()
          }}
          variant="text"
          size="md"
          disableAnimation={disableAnimation}
        >
          {t("buttons.aboutLiver")}
        </InteractionButton>
        {onExploreClick && !hideExploreInscriptions && (
          <InteractionButton
            onClick={() => {
              onAction?.()
              onExploreClick()
            }}
            variant="text"
            size="md"
            disableAnimation={disableAnimation}
          >
            {t("buttons.exploreInscriptions")}
          </InteractionButton>
        )}
        {showLanguageSwitcher && (
          <InteractionButton
            onClick={() => {
              onAction?.()
              setLanguageModalOpened(true)
            }}
            variant="text"
            size="md"
            disableAnimation={disableAnimation}
          >
            {languageButtonText}
          </InteractionButton>
        )}
        {!hideControls && (
          <InteractionButton
            onClick={() => {
              onAction?.()
              setControlsOpened(true)
            }}
            variant="text"
            size="md"
            disableAnimation={disableAnimation}
          >
            {t("buttons.controls")}
          </InteractionButton>
        )}
        <InteractionButton
          onClick={() => {
            onAction?.()
            setBibliographyModalOpened(true)
          }}
          variant="text"
          size="md"
          disableAnimation={disableAnimation}
        >
          {t("buttons.bibliography")}
        </InteractionButton>
        <InteractionButton
          onClick={() => {
            onAction?.()
            setContactsModalOpened(true)
          }}
          variant="text"
          size="md"
          disableAnimation={disableAnimation}
        >
          {contactButtonText}
        </InteractionButton>
      </Stack>
      <ControlsModal
        opened={controlsOpened}
        onClose={() => setControlsOpened(false)}
      />
      <LanguageModal
        opened={languageModalOpened}
        onClose={() => setLanguageModalOpened(false)}
      />
      <BibliographyModal
        opened={bibliographyModalOpened}
        onClose={() => setBibliographyModalOpened(false)}
      />
      <ContactsModal
        opened={contactsModalOpened}
        onClose={() => setContactsModalOpened(false)}
      />
    </>
  )
}
