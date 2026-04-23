import { Anchor, Stack, Text } from "@mantine/core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FaGithub } from "react-icons/fa"
import { AppConfig } from "../../config/AppConfig"

interface FeedbackSectionProps {
  variant?: "modal" | "footer"
}

function GitHubContribution({ variant }: { variant: "modal" | "footer" }) {
  const { t } = useTranslation("common")
  const textColor =
    variant === "footer" ? "rgba(244, 230, 211, 0.6)" : undefined

  return (
    <>
      <Text
        size="sm"
        className={variant === "modal" ? "text-tertiary" : undefined}
        style={{ color: textColor }}
        ta="center"
      >
        {t("language.developerText")}
      </Text>
      <Anchor
        href={AppConfig.repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={variant === "modal" ? "app-modal-action" : undefined}
        style={{
          color: variant === "footer" ? "var(--bronze-text)" : undefined,
          textDecoration: "none",
          display: variant === "footer" ? "flex" : undefined,
          alignItems: variant === "footer" ? "center" : undefined,
          gap: variant === "footer" ? "8px" : undefined,
          fontSize: variant === "footer" ? "14px" : undefined,
          fontWeight: variant === "footer" ? 500 : undefined,
        }}
      >
        <FaGithub size={20} />
        {t("language.contributeOnGitHub")}
      </Anchor>
    </>
  )
}

export function FeedbackSection({ variant = "footer" }: FeedbackSectionProps) {
  const { t } = useTranslation("common")

  const mailtoUrl = useMemo(() => {
    const subject = t("footer.mailtoSubject")
    const body = t("footer.mailtoBody")
    return `mailto:${AppConfig.feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [t])

  if (variant === "footer") {
    return (
      <div className="footer-feedback">
        <Text className="footer-feedback-text">
          {t("footer.incorrectInfo")}{" "}
          <a
            href={mailtoUrl}
            className="footer-write-me"
            rel="noopener noreferrer"
          >
            {t("footer.writeMe")}
          </a>
        </Text>
        <Stack gap="xs" align="center" mt="md">
          <GitHubContribution variant="footer" />
        </Stack>
      </div>
    )
  }

  return (
    <Stack gap="md" align="center">
      <Stack gap={4} align="center">
        <Text size="sm" className="text-tertiary" ta="center">
          {t("footer.incorrectInfo")}
        </Text>
        <Text size="sm" className="text-tertiary" ta="center">
          {t("language.newLanguagePrompt")}
        </Text>
      </Stack>
      <Anchor
        href={mailtoUrl}
        className="app-modal-action app-modal-action-primary"
      >
        {t("footer.writeMe")}
      </Anchor>
      <Stack gap="xs" align="center">
        <GitHubContribution variant="modal" />
      </Stack>
    </Stack>
  )
}
