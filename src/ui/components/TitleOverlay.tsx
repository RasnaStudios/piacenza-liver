import { Box, Text, Transition } from "@mantine/core"
import { useTranslation } from "react-i18next"

interface TitleOverlayProps {
  isVisible: boolean
}

export function TitleOverlay({ isVisible }: TitleOverlayProps) {
  const { t } = useTranslation("common")
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
            {t("titles.piacenzaLiver")}
          </Text>
        )}
      </Transition>
    </Box>
  )
}
