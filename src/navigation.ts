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
