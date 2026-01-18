import { Box, Text, Transition } from "@mantine/core"

interface TitleOverlayProps {
  isVisible: boolean
}

export function TitleOverlay({ isVisible }: TitleOverlayProps) {
  return (
    <Box
      pos="fixed"
      top="8%"
      left="50%"
      style={{
        transform: "translateX(-50%)",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <Transition
        mounted={isVisible}
        transition="fade"
        duration={800}
        timingFunction="ease-out"
      >
        {(styles: React.CSSProperties) => (
          <Text
            fw={100}
            ta="center"
            ff="Cinzel"
            className="title-gradient title-main"
            style={styles}
          >
            Piacenza Liver
          </Text>
        )}
      </Transition>
    </Box>
  )
}
