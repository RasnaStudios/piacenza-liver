export type LocalePrefix = "en" | "it"

const normalizePathname = (pathname: string) => {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1)
  }
  return withLeadingSlash
}

export const getLocalePrefix = (language?: string): LocalePrefix => {
  if (language?.toLowerCase().startsWith("it")) {
    return "it"
  }
  return "en"
}

export const extractLocalePrefix = (pathname: string): LocalePrefix | null => {
  const normalized = normalizePathname(pathname)
  const match = normalized.match(/^\/(en|it)(?=\/|$)/)
  return match ? (match[1] as LocalePrefix) : null
}

export const stripLocalePrefix = (pathname: string): string => {
  const normalized = normalizePathname(pathname)
  const stripped = normalized.replace(/^\/(en|it)(?=\/|$)/, "")
  return stripped === "" ? "/" : stripped
}

export const buildLocalizedPath = (
  pathname: string,
  locale: LocalePrefix,
): string => {
  const basePath = stripLocalePrefix(pathname)
  const suffix = basePath === "/" ? "/" : `${basePath}/`
  return `/${locale}${suffix}`
}

export const normalizePath = (pathname: string): string =>
  normalizePathname(pathname)
