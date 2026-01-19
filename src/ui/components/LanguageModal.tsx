import {
  Box,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="md"
      centered
      zIndex={2000}
      styles={{
        content: {
          backgroundColor: "var(--primary-bg)",
          border: "1px solid var(--border-primary)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-primary)",
        },
        body: {
          backgroundColor: "var(--primary-bg)",
          padding: "0",
        },
      }}
    >
      <Group align="center" justify="space-between" p="lg" pb="md">
        <Title order={3} className="text-bronze font-display">
          {t("language.title")}
        </Title>
        <Box
          className="close-button-container"
          onClick={onClose}
          aria-label={t("aria.closeControls")}
          title={t("aria.closeControls")}
        >
          <IconX size={24} stroke={1.5} />
        </Box>
      </Group>
      <Divider color="var(--border-secondary)" />
      <Box p="lg">
        <Stack gap="lg">
          <SimpleGrid cols={2} spacing="md">
            {languages.map((lang) => {
              const isSelected = i18n.language === lang.code
              return (
                <Box
                  key={lang.code}
                  component="button"
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  style={{
                    background: isSelected
                      ? "rgba(201, 168, 118, 0.15)"
                      : "rgba(201, 168, 118, 0.05)",
                    border: `2px solid ${
                      isSelected
                        ? "rgba(201, 168, 118, 0.6)"
                        : "rgba(201, 168, 118, 0.2)"
                    }`,
                    borderRadius: "8px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background =
                        "rgba(201, 168, 118, 0.1)"
                      e.currentTarget.style.borderColor =
                        "rgba(201, 168, 118, 0.4)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background =
                        "rgba(201, 168, 118, 0.05)"
                      e.currentTarget.style.borderColor =
                        "rgba(201, 168, 118, 0.2)"
                    }
                  }}
                >
                  <Text style={{ fontSize: "32px", lineHeight: 1 }}>
                    {lang.flag}
                  </Text>
                  <Text
                    size="md"
                    fw={isSelected ? 600 : 400}
                    className={isSelected ? "text-bronze" : "text-secondary"}
                  >
                    {lang.label}
                  </Text>
                </Box>
              )
            })}
          </SimpleGrid>

          <Divider color="var(--border-secondary)" />

          <FeedbackSection variant="modal" />
        </Stack>
      </Box>
    </Modal>
  )
}
