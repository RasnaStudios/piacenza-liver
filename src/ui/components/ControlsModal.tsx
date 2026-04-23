import { Box, Stack, Text } from "@mantine/core"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"
import { AppModalShell } from "./AppModalShell"

interface ControlsModalProps {
  opened: boolean
  onClose: () => void
}

export function ControlsModal({ opened, onClose }: ControlsModalProps) {
  const { t } = useTranslation("controls")
  const { t: tCommon } = useTranslation("common")

  const getControlsData = () => {
    if (isMobile) {
      const mobileControls = t("mobile", { returnObjects: true }) as Array<{
        command: string
        description: string
      }>
      return mobileControls
    }

    const desktopControls = t("desktop", { returnObjects: true }) as Array<{
      command: string
      description: string
    }>
    return desktopControls
  }

  const controls = getControlsData()

  return (
    <AppModalShell
      opened={opened}
      onClose={onClose}
      title={t("title")}
      size="md"
      closeLabel={tCommon("aria.closeControls")}
    >
      <Box className="app-modal-card">
        <Stack gap="xs">
          {controls.map((control, index) => (
            <Box key={control.command || index} className="app-modal-panel">
              <Stack gap={6}>
                <Text className="app-modal-item-title">{control.command}</Text>
                <Text className="app-modal-copy">{control.description}</Text>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </AppModalShell>
  )
}
