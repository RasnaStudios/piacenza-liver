import type { ModalProps } from "@mantine/core"
import { Box, Divider, Group, Modal, Title } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import type { ReactNode } from "react"
import "./AppModalShell.css"

interface AppModalShellProps {
  opened: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: ModalProps["size"]
  contentClassName?: string
  bodyClassName?: string
  shellClassName?: string
  closeLabel: string
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ")
}

export function AppModalShell({
  opened,
  onClose,
  title,
  children,
  size = "md",
  contentClassName,
  bodyClassName,
  shellClassName,
  closeLabel,
}: AppModalShellProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size={size}
      centered
      zIndex={2000}
      classNames={{
        content: joinClassNames("app-modal-content", contentClassName),
        body: joinClassNames("app-modal-body", bodyClassName),
      }}
    >
      <Group
        className="app-modal-header"
        align="center"
        justify="space-between"
      >
        <Title order={3} className="app-modal-title text-bronze font-display">
          {title}
        </Title>
        <Box
          className="close-button-container app-modal-close-button"
          onClick={onClose}
          aria-label={closeLabel}
          title={closeLabel}
        >
          <IconX size={24} stroke={1.5} />
        </Box>
      </Group>
      <Divider className="app-modal-divider" />
      <Box className={joinClassNames("app-modal-shell", shellClassName)}>
        {children}
      </Box>
    </Modal>
  )
}
