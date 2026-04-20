import { Box, Text } from "@mantine/core"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"

export function PanelLegend() {
  const { t } = useTranslation("common")

  if (!isMobile) {
    return null
  }

  return (
    <Box p="md">
      <Text
        size="lg"
        className="text-tertiary"
        style={{
          fontFamily: "var(--font-primary)",
          textAlign: "center",
        }}
      >
        {t("instructions.doubleTapOnModelToReset")}
      </Text>
    </Box>
  )
}
