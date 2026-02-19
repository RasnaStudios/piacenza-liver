import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import {
  buildLocalizedPath,
  type LocalePrefix,
  normalizePath,
  stripLocalePrefix,
} from "../i18n/localeRouting"

const localeMap: Record<string, string> = {
  en_US: "en",
  it_IT: "it",
  es_ES: "es",
  fr_FR: "fr",
  de_DE: "de",
}

const ensureTrailingSlash = (pathname: string): string => {
  if (pathname === "/") {
    return "/"
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`
}

export function MetaTags() {
  const { i18n, t } = useTranslation("meta")
  const location = useLocation()

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
    const currentPath = normalizePath(location.pathname)
    const canonicalPath = ensureTrailingSlash(currentPath)
    const currentUrl = `${baseUrl}${canonicalPath}${location.search}`
    const basePath = stripLocalePrefix(currentPath)
    const xDefaultUrl = `${baseUrl}${ensureTrailingSlash(basePath)}`

    const isIndexable = location.pathname === "/" || location.pathname === ""
    const robotsContent = isIndexable
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, follow"
    updateMetaContent("robots", robotsContent)

    document.title = htmlTitle
    updateMetaContent("title", htmlTitle)
    updateMetaContent("description", description)
    updateMetaContent("keywords", keywords)
    updateMetaContent("application-name", ogSiteName)
    updateMetaContent("apple-mobile-web-app-title", appleMobileWebAppTitle)

    updateLink("canonical", currentUrl)

    const supportedLanguages: Array<{
      code: string
      hreflang: string
      locale: LocalePrefix
    }> = [
      { code: "en_US", hreflang: "en", locale: "en" },
      { code: "it_IT", hreflang: "it", locale: "it" },
    ]

    supportedLanguages.forEach((lang) => {
      const localizedPath = ensureTrailingSlash(
        buildLocalizedPath(basePath, lang.locale),
      )
      updateLink("alternate", `${baseUrl}${localizedPath}`, lang.hreflang)
    })

    updateLink("alternate", xDefaultUrl, "x-default")

    updateProperty("og:type", "website")
    updateProperty("og:url", currentUrl)
    updateProperty("og:title", ogTitle)
    updateProperty("og:description", ogDescription)
    updateProperty("og:image", `${baseUrl}/homepage.png`)
    updateProperty("og:image:width", "1136")
    updateProperty("og:image:height", "1010")
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

    const datasetUrl = `${baseUrl}/data/inscriptions.yaml`
    const websiteId = `${baseUrl}/#website`
    const webAppId = `${baseUrl}/#webapp`
    const webPageId = `${currentUrl}#webpage`
    const datasetId = `${datasetUrl}#dataset`

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: `${baseUrl}/`,
          name: ogSiteName,
          description: description,
          inLanguage: htmlLang,
          publisher: {
            "@type": "Organization",
            name: ogSiteName,
          },
        },
        {
          "@type": "WebPage",
          "@id": webPageId,
          url: currentUrl,
          name: htmlTitle,
          description: structuredDataDescription,
          isPartOf: {
            "@id": websiteId,
          },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: `${baseUrl}/homepage.png`,
          },
          inLanguage: htmlLang,
          about: {
            "@type": "CreativeWork",
            name: appleMobileWebAppTitle,
            description: t("structuredData.aboutDescription"),
            dateCreated: "c. 100 BCE",
          },
          mainEntity: {
            "@id": webAppId,
          },
        },
        {
          "@type": ["WebApplication", "SoftwareApplication"],
          "@id": webAppId,
          name: htmlTitle,
          description: structuredDataDescription,
          url: `${baseUrl}/`,
          inLanguage: htmlLang,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          keywords: keywords,
          isAccessibleForFree: true,
          creator: {
            "@type": "Person",
            name: "Lorenzo Andraghetti",
            alternateName: "@andraghetti",
          },
          publisher: {
            "@type": "Organization",
            name: ogSiteName,
          },
          about: {
            "@type": "CreativeWork",
            name: appleMobileWebAppTitle,
            description: t("structuredData.aboutDescription"),
            dateCreated: "c. 100 BCE",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Dataset",
          "@id": datasetId,
          name: datasetName,
          description: datasetDescription,
          url: datasetUrl,
          encodingFormat: "application/x-yaml",
          keywords: keywords,
          isAccessibleForFree: true,
          creator: {
            "@type": "Person",
            name: "Lorenzo Andraghetti",
            alternateName: "@andraghetti",
          },
          license: "https://opensource.org/licenses/MIT",
          distribution: {
            "@type": "DataDownload",
            contentUrl: datasetUrl,
            encodingFormat: "application/x-yaml",
          },
        },
      ],
    }

    let script = document.querySelector('script[type="application/ld+json"]')
    if (!script) {
      script = document.createElement("script")
      script.setAttribute("type", "application/ld+json")
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(structuredData)
  }, [i18n.language, location.pathname, location.search, t])

  return null
}
