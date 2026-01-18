import { useEffect } from "react"
import { useTranslation } from "react-i18next"

const localeMap: Record<string, string> = {
  en_US: "en",
  it_IT: "it",
  es_ES: "es",
  fr_FR: "fr",
  de_DE: "de",
}

export function MetaTags() {
  const { i18n, t } = useTranslation("meta")

  useEffect(() => {
    const htmlLang = localeMap[i18n.language] || "en"
    const ogLocale = i18n.language.replace("_", "-") || "en_US"

    document.documentElement.lang = htmlLang

    const updateMetaContent = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement("meta")
        meta.setAttribute("name", name)
        document.head.appendChild(meta)
      }
      meta.setAttribute("content", content)
    }

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement("meta")
        meta.setAttribute("property", property)
        document.head.appendChild(meta)
      }
      meta.setAttribute("content", content)
    }

    const updateLink = (rel: string, href: string, hreflang?: string) => {
      let link = document.querySelector(
        hreflang
          ? `link[rel="${rel}"][hreflang="${hreflang}"]`
          : `link[rel="${rel}"]`,
      )
      if (!link) {
        link = document.createElement("link")
        link.setAttribute("rel", rel)
        if (hreflang) {
          link.setAttribute("hreflang", hreflang)
        }
        document.head.appendChild(link)
      }
      link.setAttribute("href", href)
    }

    const htmlTitle = t("htmlTitle")
    const ogTitle = t("ogTitle")
    const ogDescription = t("ogDescription")
    const ogImageAlt = t("ogImageAlt")
    const ogSiteName = t("ogSiteName")
    const description = t("description")
    const keywords = t("keywords")

    const appleMobileWebAppTitle = htmlTitle.split(" - ")[0]

    const structuredDataDescription = ogDescription.replace(
      /\. Created by.*$/,
      "",
    )

    const datasetName = t("structuredData.datasetName")
    const datasetDescription = t("structuredData.datasetDescription")

    const baseUrl = "https://liver.rasna.dev"
    const currentUrl =
      baseUrl + window.location.pathname + window.location.search

    document.title = htmlTitle
    updateMetaContent("title", htmlTitle)
    updateMetaContent("description", description)
    updateMetaContent("keywords", keywords)
    updateMetaContent("application-name", ogSiteName)
    updateMetaContent("apple-mobile-web-app-title", appleMobileWebAppTitle)

    updateLink("canonical", currentUrl)

    const supportedLanguages = [
      { code: "en_US", hreflang: "en" },
      { code: "it_IT", hreflang: "it" },
    ]

    supportedLanguages.forEach((lang) => {
      updateLink("alternate", baseUrl, lang.hreflang)
    })

    updateLink("alternate", baseUrl, "x-default")

    updateProperty("og:type", "website")
    updateProperty("og:url", currentUrl)
    updateProperty("og:title", ogTitle)
    updateProperty("og:description", ogDescription)
    updateProperty("og:image", `${baseUrl}/homepage.png`)
    updateProperty("og:image:width", "1200")
    updateProperty("og:image:height", "630")
    updateProperty("og:image:alt", ogImageAlt)
    updateProperty("og:site_name", ogSiteName)
    updateProperty("og:locale", ogLocale)

    updateProperty("twitter:card", "summary_large_image")
    updateProperty("twitter:url", currentUrl)
    updateProperty("twitter:title", ogTitle)
    updateProperty("twitter:description", ogDescription)
    updateProperty("twitter:image", `${baseUrl}/homepage.png`)
    updateProperty("twitter:image:alt", ogImageAlt)
    updateProperty("twitter:creator", "@andraghetti")

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: htmlTitle,
      description: structuredDataDescription,
      url: "https://liver.rasna.dev/",
      publisher: {
        "@type": "Organization",
        name: ogSiteName,
      },
      creator: {
        "@type": "Person",
        name: "Lorenzo Andraghetti",
        alternateName: "@andraghetti",
      },
      about: {
        "@type": "CreativeWork",
        name: appleMobileWebAppTitle,
        description: t("structuredData.aboutDescription"),
        dateCreated: "c. 100 BCE",
      },
      keywords: keywords,
      isAccessibleForFree: true,
      distribution: {
        "@type": "DataDownload",
        contentUrl: "https://liver.rasna.dev/data/inscriptions.json",
        encodingFormat: "application/json",
        name: datasetName,
        description: datasetDescription,
      },
      mainEntity: {
        "@type": "Dataset",
        name: datasetName,
        description: datasetDescription,
        url: "https://liver.rasna.dev/data/inscriptions.json",
        encodingFormat: "application/json",
        keywords: keywords,
        creator: {
          "@type": "Person",
          name: "Lorenzo Andraghetti",
          alternateName: "@andraghetti",
        },
        license: "https://opensource.org/licenses/MIT",
      },
    }

    let script = document.querySelector('script[type="application/ld+json"]')
    if (!script) {
      script = document.createElement("script")
      script.setAttribute("type", "application/ld+json")
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(structuredData)
  }, [i18n.language, t])

  return null
}
