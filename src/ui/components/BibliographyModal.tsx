import { Box, Divider, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useTranslation } from "react-i18next"
import { type BibEntry, bibliographyEntries } from "../../data/Scholarship"
import { AppModalShell } from "./AppModalShell"
import { WebsiteCitation } from "./WebsiteCitation"
import "./BibliographyModal.css"

function BibliographyEntryLine({ entry }: { entry: BibEntry }) {
  const titleNode = entry.url ? (
    <a
      className="bib-title-link"
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {entry.title}
    </a>
  ) : (
    <span className="bib-title-text">{entry.title}</span>
  )
  return (
    <li className="bib-entry">
      <span className="bib-author">{entry.authors}</span>
      <span className="bib-year"> ({entry.year}).</span> {titleNode}
      {entry.venue ? <span className="bib-venue">. {entry.venue}</span> : null}
      {entry.pages ? <span className="bib-pages">, {entry.pages}</span> : null}
      <span>.</span>
    </li>
  )
}

interface BibliographyModalProps {
  opened: boolean
  onClose: () => void
}

export function BibliographyModal({ opened, onClose }: BibliographyModalProps) {
  const { t } = useTranslation("common")
  const { t: tAbout } = useTranslation("about")
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <AppModalShell
      opened={opened}
      onClose={onClose}
      title={t("buttons.bibliography")}
      size={isMobile ? "calc(100vw - 16px)" : "min(860px, calc(100vw - 48px))"}
      contentClassName="bibliography-modal-content"
      bodyClassName="bibliography-modal-body"
      shellClassName="bibliography-modal-shell"
      closeLabel={t("aria.closeControls")}
    >
      <Stack gap="lg" align="stretch" className="bibliography-modal-stack">
        <Box>
          <Text component="p" className="bibliography-modal-intro">
            {tAbout("references.intro")}
          </Text>
          <ul className="bib-list">
            {bibliographyEntries.map((entry) => (
              <BibliographyEntryLine key={entry.shortRef} entry={entry} />
            ))}
          </ul>
        </Box>

        <Divider className="bibliography-modal-divider" />

        <WebsiteCitation />
      </Stack>
    </AppModalShell>
  )
}
