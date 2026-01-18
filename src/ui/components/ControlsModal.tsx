import { Box, Divider, Group, Modal, Stack, Text, Title } from "@mantine/core"
import { IconX } from "@tabler/icons-react"

interface ControlsModalProps {
  opened: boolean
  onClose: () => void
}

export function ControlsModal({ opened, onClose }: ControlsModalProps) {
  const getControlsData = () => {
    return [
      {
        command: "Double-click",
        description: "Reset to default view",
      },
      {
        command: "Mouse",
        description: "Rotate the 3D model around",
      },
      {
        command: "Alt + Mouse",
        description: "Pan the camera view",
      },
      {
        command: "Scroll",
        description: "Zoom in and out",
      },
      {
        command: "⇧ + Drag",
        description: "Move the model position",
      },
    ]
  }

  const controls = getControlsData()

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="md"
      centered
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
          Controls
        </Title>
        <Box
          className="close-button-container"
          onClick={onClose}
          aria-label="Close controls"
          title="Close controls"
        >
          <IconX size={24} stroke={1.5} />
        </Box>
      </Group>
      <Divider color="var(--border-secondary)" />
      <Box p="lg">
        <Stack gap="xs">
          {controls.map((control) => (
            <Box key={control.command}>
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
