import type * as THREE from "three"

// Type definition for god entries in inscriptions (matches LiverData.ts)
type GodEntry = string | { id: string; form: string }

/**
 * Represents a hovered section/inscription with its ID and optional position
 */
export interface HoveredSection {
  id: number
  position?: THREE.Vector3
  gods?: GodEntry[]
  etruscanText?: string
}

/**
 * Represents a click payload for inscription interactions
 */
export interface InscriptionClickPayload {
  inscriptionId: number
  clickedUV: THREE.Vector2
  cameraWorldPosition: THREE.Vector3
  cameraWorldTarget: THREE.Vector3
  cameraLocalPosition: THREE.Vector3
  cameraLocalTarget: THREE.Vector3
  modelMatrix: THREE.Matrix4
}

/**
 * Represents atlas metadata structure
 */
export interface AtlasMeta {
  cols: number
  rows: number
  tileSize: number
  labels: Record<
    string,
    {
      index: number
      row: number
      col: number
    }
  >
}

/**
 * Represents atlas tweak configuration
 */
export interface AtlasTweak {
  flipX: boolean
  flipY: boolean
  repeatScaleX: number
  repeatScaleY: number
  offsetX: number
  offsetY: number
  idMap?: Record<number, number>
  idOffset?: number
}
