import { Text } from "@mantine/core"
import { useTranslation } from "react-i18next"
import "./WebsiteCitation.css"

interface WebsiteCitationProps {
  variant?: "default" | "compact"
}

export function WebsiteCitation({ variant = "default" }: WebsiteCitationProps) {
  const { t } = useTranslation("about")
  const currentYear = new Date().getFullYear()
  const blockClass =
    variant === "compact"
      ? "website-citation website-citation--compact"
      : "website-citation"

  return (
    <section className={blockClass}>
      <Text
        component="h3"
        className="website-citation-heading text-bronze font-display"
      >
        {t("howToCite.heading")}
      </Text>
      <Text component="p" className="website-citation-intro">
        {t("howToCite.intro")}
      </Text>
      <pre className="cite-block">
        {t("howToCite.format", {
          year: currentYear,
        })}
      </pre>
      <Text component="p" className="website-citation-sigla">
        {t("howToCite.sigla")}
      </Text>
    </section>
  )
}
