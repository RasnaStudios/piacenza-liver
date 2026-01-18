import { Stack } from "@mantine/core"
import { useState } from "react"
import { useTranslation } from "react-i18next"
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
}

export function ActionButtons({
  onAboutClick,
  onExploreClick,
  showLanguageSwitcher = false,
  disableAnimation = false,
  hideExploreInscriptions = false,
  hideControls = false,
}: ActionButtonsProps) {
  const { t, i18n } = useTranslation("common")
  const [controlsOpened, setControlsOpened] = useState(false)
  const [languageModalOpened, setLanguageModalOpened] = useState(false)

  const isEnglish = i18n.language === "en_US"
  const languageButtonText = isEnglish
    ? "Language"
    : `Language / ${t("buttons.language")}`

  if (!onAboutClick) {
    return null
  }

  return (
    <>
      <Stack gap="xs">
        <InteractionButton
          onClick={onAboutClick}
          variant="text"
          size="md"
          disableAnimation={disableAnimation}
        >
          {t("buttons.aboutLiver")}
        </InteractionButton>
        {onExploreClick && !hideExploreInscriptions && (
          <InteractionButton
            onClick={onExploreClick}
            variant="text"
            size="md"
            disableAnimation={disableAnimation}
          >
            {t("buttons.exploreInscriptions")}
          </InteractionButton>
        )}
        {!hideControls && (
          <InteractionButton
            onClick={() => setControlsOpened(true)}
            variant="text"
            size="md"
            disableAnimation={disableAnimation}
          >
            {t("buttons.controls")}
          </InteractionButton>
        )}
        {showLanguageSwitcher && (
          <InteractionButton
            onClick={() => setLanguageModalOpened(true)}
            variant="text"
            size="md"
            disableAnimation={disableAnimation}
          >
            {languageButtonText}
          </InteractionButton>
        )}
      </Stack>
      <ControlsModal
        opened={controlsOpened}
        onClose={() => setControlsOpened(false)}
      />
      <LanguageModal
        opened={languageModalOpened}
        onClose={() => setLanguageModalOpened(false)}
      />
    </>
  )
}
