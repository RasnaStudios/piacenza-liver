import { Anchor, Stack, Text } from "@mantine/core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FaGithub } from "react-icons/fa"
import { AppConfig } from "../../config/AppConfig"
import { InteractionButton } from "./InteractionButton"

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
        style={{
          color: "var(--bronze-text)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        <FaGithub size={20} />
        {t("language.contributeOnGitHub")}
      </Anchor>
    </>
  )
}

export function FeedbackSection({ variant = "modal" }: FeedbackSectionProps) {
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
      <Text size="sm" className="text-tertiary" ta="center">
        {t("footer.incorrectInfo")}
      </Text>
      <InteractionButton
        onClick={() => {
          window.location.href = mailtoUrl
        }}
        variant="outline"
        size="md"
      >
        {t("footer.writeMe")}
      </InteractionButton>
      <GitHubContribution variant="modal" />
    </Stack>
  )
}
