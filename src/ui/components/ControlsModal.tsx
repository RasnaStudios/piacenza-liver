import { Box, Divider, Group, Modal, Stack, Text, Title } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"

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
          fontFamily: "var(--font-primary)",
        },
        body: {
          backgroundColor: "var(--primary-bg)",
          padding: "0",
          fontFamily: "var(--font-primary)",
        },
      }}
    >
      <Group align="center" justify="space-between" p="lg" pb="md">
        <Title order={3} className="text-bronze font-display">
          {t("title")}
        </Title>
        <Box
          className="close-button-container"
          onClick={onClose}
          aria-label={tCommon("aria.closeControls")}
          title={tCommon("aria.closeControls")}
        >
          <IconX size={24} stroke={1.5} />
        </Box>
      </Group>
      <Divider color="var(--border-secondary)" />
      <Box p="lg">
        <Stack gap="xs">
          {controls.map((control, index) => (
            <Box key={control.command || index}>
              <Box className="bg-overlay-secondary border-secondary" p="xs">
                <Stack gap="xs">
                  <Text size="lg" className="text-bronze font-display">
                    {control.command}
                  </Text>
                  <Text size="md" className="text-secondary font-primary">
                    {control.description}
                  </Text>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Modal>
  )
}
