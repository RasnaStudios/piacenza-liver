import { Box, Divider, SimpleGrid, Stack, Text } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { buildLocalizedPath, getLocalePrefix } from "../../i18n/localeRouting"
import { AppModalShell } from "./AppModalShell"
import { FeedbackSection } from "./FeedbackSection"

interface LanguageModalProps {
  opened: boolean
  onClose: () => void
}

const languages = [
  { code: "en_US", label: "English", flag: "🇺🇸" },
  { code: "it_IT", label: "Italiano", flag: "🇮🇹" },
]

export function LanguageModal({ opened, onClose }: LanguageModalProps) {
  const { i18n, t } = useTranslation("common")
  const navigate = useNavigate()
  const location = useLocation()

  const handleLanguageChange = (langCode: string) => {
    const locale = getLocalePrefix(langCode)
    const nextPath = buildLocalizedPath(location.pathname, locale)
    navigate(`${nextPath}${location.search}${location.hash}`)
    i18n.changeLanguage(langCode)
    onClose()
  }

  return (
    <AppModalShell
      opened={opened}
      onClose={onClose}
      title={t("language.title")}
      size="md"
      closeLabel={t("aria.closeControls")}
    >
      <Box className="app-modal-card">
        <Stack gap="lg">
          <SimpleGrid cols={2} spacing="md" className="app-modal-choice-grid">
            {languages.map((lang) => {
              const isSelected = i18n.language === lang.code
              return (
                <Box
                  key={lang.code}
                  component="button"
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`app-modal-choice${
                    isSelected ? " app-modal-choice-active" : ""
                  }`}
                >
                  <Text className="app-modal-choice-flag">{lang.flag}</Text>
                  <Text
                    className={`app-modal-choice-label${
                      isSelected ? " text-bronze" : " text-secondary"
                    }`}
                    fw={isSelected ? 600 : 400}
                  >
                    {lang.label}
                  </Text>
                </Box>
              )
            })}
          </SimpleGrid>

          <Divider className="app-modal-divider" />

          <Box className="app-modal-panel app-modal-panel-center">
            <FeedbackSection variant="modal" />
          </Box>
        </Stack>
      </Box>
    </AppModalShell>
  )
}
