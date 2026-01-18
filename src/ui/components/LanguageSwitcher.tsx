import { Box, Menu } from "@mantine/core"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const languages = [
  { code: "en_US", label: "English", flag: "🇺🇸" },
  { code: "it_IT", label: "Italiano", flag: "🇮🇹" },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [opened, setOpened] = useState(false)

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setOpened(false)
  }

  return (
    <Menu opened={opened} onChange={setOpened} position="top" offset={8}>
      <Menu.Target>
        <Box
          component="button"
          type="button"
          style={{
            background: "transparent",
            border: "none",
            color: "#c9a876",
            cursor: "pointer",
            fontSize: "14px",
            padding: "8px 12px",
            fontFamily: "var(--font-primary)",
            width: "100%",
            textAlign: "left",
            borderRadius: "4px",
            transition: "background-color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(201, 168, 118, 0.1)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
        >
          <span style={{ fontSize: "18px" }}>{currentLanguage.flag}</span>
          <span>{currentLanguage.label}</span>
        </Box>
      </Menu.Target>

      <Menu.Dropdown
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(201, 168, 118, 0.3)",
        }}
      >
        {languages.map((lang) => (
          <Menu.Item
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            style={{
              color: i18n.language === lang.code ? "#c9a876" : "#f4e6d3",
              backgroundColor:
                i18n.language === lang.code
                  ? "rgba(201, 168, 118, 0.1)"
                  : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>{lang.flag}</span>
            <span>{lang.label}</span>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
