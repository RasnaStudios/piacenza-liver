import {
  buildLocalizedPath,
  extractLocalePrefix,
  getLocalePrefix,
} from "./i18n/localeRouting"

const getStoredLocale = () => {
  try {
    const stored = localStorage.getItem("i18nextLng")
    return stored ? getLocalePrefix(stored) : null
  } catch {
    return null
  }
}

const getCurrentLocale = () =>
  extractLocalePrefix(window.location.pathname) || getStoredLocale() || "en"

export function parseInscriptionIdFromHash(): number | null {
  const m = window.location.hash.match(/^#inscription-(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}

export function getInscriptionHash(id: number): string {
  return `#inscription-${id}`
}

export function setInscriptionHash(id: number): void {
  window.history.replaceState(null, "", getInscriptionHash(id))
}

export function clearInscriptionHash(): void {
  const base = window.location.pathname + window.location.search
  window.history.replaceState(null, "", base || "/")
}

export function isAboutHash(): boolean {
  return window.location.hash === "#about"
}

export function setAboutHash(): void {
  window.history.replaceState(null, "", "#about")
}

export function clearAboutHash(): void {
  const base = window.location.pathname + window.location.search
  window.history.replaceState(null, "", base || "/")
}

export function navigateToSceneInscription(id: number): void {
  const homePath = buildLocalizedPath("/", getCurrentLocale())
  window.history.pushState(null, "", `${homePath}${getInscriptionHash(id)}`)
}

export function navigateToInscriptionsPage(): void {
  window.location.href = buildLocalizedPath("/inscriptions", getCurrentLocale())
}

export function navigateToInscriptionsPageInscription(id: number): void {
  const basePath = buildLocalizedPath("/inscriptions", getCurrentLocale())
  window.location.href = `${basePath}#${id}`
}

export function navigateToInscriptionsPageRegion(regionId: string): void {
  const basePath = buildLocalizedPath("/inscriptions", getCurrentLocale())
  window.location.href = `${basePath}#${regionId}`
}

export function navigateToInscriptionsPageDeity(deityId: string): void {
  const basePath = buildLocalizedPath("/inscriptions", getCurrentLocale())
  window.location.href = `${basePath}#${deityId}`
}
