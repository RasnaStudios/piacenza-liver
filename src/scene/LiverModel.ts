import { gsap } from "gsap"
import * as THREE from "three"
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import objUrl from "../assets/liver-model/Fegato.obj"
import baseColorUrl from "../assets/liver-model/Fegato_baseColor.jpg"
import normalUrl from "../assets/liver-model/Fegato_normal.jpg"
import ormUrl from "../assets/liver-model/Fegato_occlusionRoughnessMetallic.jpg"
import maskUrl from "../assets/segmentation.png"
import atlasMeta from "../assets/segmentation_atlas.json"
import atlasPngUrl from "../assets/segmentation_atlas.png"
import { SceneConfig } from "../config/SceneConfig"
import type { AtlasMeta, AtlasTweak } from "../types"
import { getInscriptionGroup, liverInscriptions } from "./LiverData"

export class LiverModel {
  private scene: THREE.Scene
  private mesh: THREE.Mesh | null = null
  private object: THREE.Object3D | null = null
  private onProgress?: (progress: number) => void
  private loadingManager: THREE.LoadingManager
  private lastProgress: number = 0
  private liverCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  private reportProgress(p: number) {
    const clamped = Math.max(0, Math.min(100, Math.floor(p)))
    const monotonic = Math.max(this.lastProgress, clamped)
    this.lastProgress = monotonic
    this.onProgress?.(monotonic)
  }

  setAtlasTweak(partial: Partial<typeof this.atlasTweak>) {
    this.atlasTweak = { ...this.atlasTweak, ...partial }
    // Re-apply current hover if active
    if (this.currentHoveredId) {
      this.setHoveredInscription(this.currentHoveredId)
    }
  }

  getAtlasTweak() {
    return { ...this.atlasTweak }
  }

  // Offscreen canvas for CPU-side sampling of the segmentation mask
  private maskCanvas: HTMLCanvasElement | null = null
  private maskCtx: CanvasRenderingContext2D | null = null
  private maskWidth = 0
  private maskHeight = 0

  private onModelReady?: () => void
  private atlasTexture: THREE.Texture | null = null
  private selectedMaterial: THREE.MeshStandardMaterial | null = null
  private selectedMesh: THREE.Mesh | null = null
  private hoveredMaterial: THREE.MeshStandardMaterial | null = null
  private hoveredMesh: THREE.Mesh | null = null
  private atlasCols = 1
  private atlasRows = 1
  private labelToTile: Record<number, { row: number; col: number }> = {}
  private atlasTweak: AtlasTweak = {
    flipX: false,
    flipY: true,
    repeatScaleX: 1,
    repeatScaleY: 1,
    offsetX: 0,
    offsetY: 0,
    idOffset: 0,
  }

  private currentHoveredId: number = 0
  private currentSelectedId: number = 0
  private textureCloneCache: Map<string, THREE.Texture> = new Map()

  private getHighlightColor(id: number): THREE.Color {
    // Apply the same ID remapping as the highlighting system
    let remappedId = this.atlasTweak.idMap?.[id] ?? id
    remappedId = Math.round(remappedId + (this.atlasTweak.idOffset || 0))

    const ins = liverInscriptions.find((i) => i.id === remappedId)
    if (ins) {
      const group = getInscriptionGroup(ins.id)
      if (group?.color) {
        return new THREE.Color(group.color)
      }
    }
    return new THREE.Color(0xffc107)
  }

  private loadedAssets = 0
  private totalAssets = 7

  constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
    this.scene = scene
    this.onProgress = onProgress
    this.loadingManager = new THREE.LoadingManager()

    if (!this.checkWebGLSupport()) {
      console.error("WebGL not supported on this device")
      throw new Error("WebGL not supported")
    }

    this.loadLiverModel()
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement("canvas")
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      return !!gl
    } catch (_e) {
      return false
    }
  }

  private calculateLiverCenter() {
    if (!this.mesh || !this.object) {
      console.warn(
        "Cannot calculate liver center: mesh or object not available",
      )
      return
    }

    // Calculate bounding box of the entire object (which includes all transforms)
    const worldBoundingBox = new THREE.Box3()
    worldBoundingBox.setFromObject(this.object)

    const worldCenter = new THREE.Vector3()
    worldBoundingBox.getCenter(worldCenter)

    // Store the calculated center for reuse
    this.liverCenter = worldCenter.clone()

    if (
      import.meta.env.VITE_DEBUG_ENABLED === "true" &&
      import.meta.env.VITE_DEBUG_LIVER_BOUNDING_BOX === "true"
    ) {
      // DEBUG: Add world-space bounding box visualization
      const boxGeometry = new THREE.BoxGeometry(
        worldBoundingBox.max.x - worldBoundingBox.min.x,
        worldBoundingBox.max.y - worldBoundingBox.min.y,
        worldBoundingBox.max.z - worldBoundingBox.min.z,
      )
      const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      })
      const worldBoxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
      worldBoxMesh.position.copy(worldCenter)
      this.scene.add(worldBoxMesh)
    }

    if (
      import.meta.env.VITE_DEBUG_ENABLED === "true" &&
      import.meta.env.VITE_DEBUG_LIVER_INSCRIPTION === "true"
    ) {
      // Add green spheres at inscription camera targets for debugging
      for (const inscription of liverInscriptions) {
        if (inscription.cameraTarget) {
          // Transform local coordinates to world coordinates
          const worldTarget = inscription.cameraTarget.clone()
          worldTarget.applyMatrix4(this.object.matrixWorld)

          const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16)
          const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
          })
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
          sphere.position.copy(worldTarget)
          sphere.name = `inscription-${inscription.id}-target`
          this.scene.add(sphere)
        }
      }
    }
  }

  // Getter for the calculated liver center
  getLiverCenter(): THREE.Vector3 {
    return this.liverCenter.clone()
  }

  // Method to reset camera target to liver center
  resetCameraToCenter(controls?: OrbitControls) {
    if (this.liverCenter && controls) {
      controls.target.copy(this.liverCenter)
      console.log("Camera target reset to liver center:", this.liverCenter)
    }
  }

  private markAssetLoaded() {
    this.loadedAssets++
    const percent = Math.min(
      95,
      Math.round((this.loadedAssets / this.totalAssets) * 95),
    )
    this.reportProgress(percent)
  }

  private async loadTextureWithProgress(
    loader: THREE.TextureLoader,
    url: string,
  ): Promise<THREE.Texture> {
    const texture = await loader.loadAsync(url)
    this.markAssetLoaded()
    return texture
  }

  private async loadFontWithProgress(): Promise<void> {
    try {
      const font = new FontFace("Cinzel", "url(/fonts/cinzel-400.woff2)")
      await font.load()
      document.fonts.add(font)
    } catch {
      console.warn("Failed to preload Cinzel font, will use fallback")
    }
    this.markAssetLoaded()
  }

  private async loadLiverModel() {
    try {
      this.reportProgress(0)
      const textureLoader = new THREE.TextureLoader(this.loadingManager)

      const [[baseColor, normalTex, ormTex, maskTex, atlasTex]] =
        await Promise.all([
          Promise.all([
            this.loadTextureWithProgress(textureLoader, baseColorUrl),
            this.loadTextureWithProgress(textureLoader, normalUrl),
            this.loadTextureWithProgress(textureLoader, ormUrl),
            this.loadTextureWithProgress(textureLoader, maskUrl),
            this.loadTextureWithProgress(textureLoader, atlasPngUrl),
          ]),
          this.loadFontWithProgress(),
        ])

      // Configure textures
      const configureTexture = (
        texture: THREE.Texture,
        config: Partial<THREE.Texture>,
      ) => {
        Object.assign(texture, { needsUpdate: true, ...config })
      }
      const textureAnisotropy = SceneConfig.material.textureAnisotropy

      // Configure segmentation mask texture
      configureTexture(maskTex, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        generateMipmaps: false,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        flipY: false,
      })

      // Configure base color texture
      configureTexture(baseColor, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        colorSpace: THREE.SRGBColorSpace,
        flipY: baseColor.flipY,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        anisotropy: textureAnisotropy,
      })

      // Configure ORM texture separately (non-color data)
      configureTexture(ormTex, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        colorSpace: THREE.NoColorSpace,
        flipY: ormTex.flipY,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        anisotropy: textureAnisotropy,
      })

      // Configure normal map separately with proper settings
      configureTexture(normalTex, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        colorSpace: THREE.NoColorSpace,
        flipY: normalTex.flipY,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        anisotropy: textureAnisotropy,
      })

      // Configure atlas texture for smooth highlights
      configureTexture(atlasTex, {
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        flipY: false,
        colorSpace: THREE.NoColorSpace,
      })
      this.atlasTexture = atlasTex

      // Parse atlas meta
      this.atlasCols = (atlasMeta as AtlasMeta).cols || 1
      this.atlasRows = (atlasMeta as AtlasMeta).rows || 1
      const labelsObj = (atlasMeta as AtlasMeta).labels || {}
      this.labelToTile = {}
      Object.keys(labelsObj).forEach((k) => {
        const n = Number(k)
        this.labelToTile[n] = { row: labelsObj[k].row, col: labelsObj[k].col }
      })

      // Prepare offscreen canvas for mask sampling
      const img = maskTex.image as HTMLImageElement
      if (img?.width && img?.height) {
        this.maskCanvas = document.createElement("canvas")
        this.maskCanvas.width = this.maskWidth = img.width
        this.maskCanvas.height = this.maskHeight = img.height
        this.maskCtx = this.maskCanvas.getContext("2d", {
          willReadFrequently: true,
        })
        this.maskCtx?.drawImage(img, 0, 0, img.width, img.height)
      }

      // Create base material with PBR settings
      // Three.js automatically handles ORM texture channel mapping:
      // R channel = Ambient Occlusion, G channel = Roughness, B channel = Metallic
      const baseMaterial = new THREE.MeshStandardMaterial({
        // Texture maps
        map: baseColor,
        normalMap: normalTex,
        normalMapType: THREE.TangentSpaceNormalMap,
        aoMap: ormTex,
        roughnessMap: ormTex,
        metalnessMap: ormTex,

        // Rendering properties
        side: THREE.FrontSide,
        transparent: false,
        depthWrite: true,
        depthTest: true,

        // Material properties for color reproduction and blending
        metalness: SceneConfig.material.metalness,
        roughness: SceneConfig.material.roughness,
        aoMapIntensity: SceneConfig.material.aoMapIntensity,
        flatShading: SceneConfig.material.flatShading,
        normalScale: SceneConfig.material.normalScale,
      })

      baseMaterial.shadowSide = THREE.FrontSide

      // Create separate materials for selected and hovered states
      const createHighlightMaterial = () =>
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xffc107),
          transparent: true,
          opacity: 0.0,
          alphaMap: this.atlasTexture,
          depthWrite: false,
          alphaTest: SceneConfig.highlight.alphaCutoff,
          blending: THREE.AdditiveBlending,
          depthTest: true,
        })

      this.selectedMaterial = createHighlightMaterial()
      this.hoveredMaterial = createHighlightMaterial()

      // Load OBJ geometry
      const objLoader = new OBJLoader(this.loadingManager)
      const object = await objLoader.loadAsync(objUrl)
      this.markAssetLoaded()

      object.traverse((child) => {
        if ((child as THREE.Object3D & { isMesh?: boolean }).isMesh) {
          const mesh = child as THREE.Mesh
          const geom = mesh.geometry as THREE.BufferGeometry

          if (
            geom.index &&
            geom.attributes.position &&
            geom.attributes.normal &&
            geom.attributes.uv
          ) {
            geom.computeTangents()
          }

          mesh.material = baseMaterial
          mesh.castShadow = true
          mesh.receiveShadow = true
          this.mesh = mesh

          // Create overlay meshes
          const createOverlayMesh = (
            material: THREE.Material,
            renderOrderOffset: number,
          ) => {
            const overlayMesh = new THREE.Mesh(geom, material)
            overlayMesh.position.copy(mesh.position)
            overlayMesh.rotation.copy(mesh.rotation)
            overlayMesh.scale.copy(mesh.scale)
            overlayMesh.renderOrder =
              (mesh.renderOrder || 0) + renderOrderOffset
            if (mesh.parent) {
              mesh.parent.add(overlayMesh)
            } else {
              this.scene.add(overlayMesh)
            }
            return overlayMesh
          }

          // Create and add selected overlay mesh
          if (!this.selectedMesh && this.selectedMaterial) {
            this.selectedMesh = createOverlayMesh(this.selectedMaterial, 1)
          }

          // Create and add hovered overlay mesh
          if (!this.hoveredMesh && this.hoveredMaterial) {
            this.hoveredMesh = createOverlayMesh(this.hoveredMaterial, 2)
          }
        }
      })

      // Hide model during loading to prevent snap
      object.visible = false

      // Apply transforms before adding to scene to avoid snap
      object.scale.setScalar(SceneConfig.model.scale)
      object.position.copy(SceneConfig.model.position)
      object.rotation.setFromVector3(SceneConfig.model.rotation)

      this.object = object
      this.scene.add(object)

      // Show model after positioning
      object.visible = true
      this.calculateLiverCenter()

      ;(
        window as typeof window & {
          liverAtlas?: {
            set: (t: Partial<AtlasTweak>) => void
            get: () => AtlasTweak
          }
        }
      ).liverAtlas = {
        set: (t: Partial<AtlasTweak>) => this.setAtlasTweak(t),
        get: () => this.getAtlasTweak(),
      }

      // Complete load
      this.reportProgress(100)
      if (this.onModelReady) this.onModelReady()
    } catch (error) {
      console.error("Error loading liver model:", error)
      throw error
    }
  }

  getPosition() {
    const target = this.object || this.mesh
    return target ? target.position.clone() : new THREE.Vector3()
  }

  setPosition(position: THREE.Vector3) {
    const target = this.object || this.mesh
    if (target) {
      target.position.copy(position)
    }
  }

  getMesh() {
    return this.mesh
  }

  getObject() {
    return this.object
  }

  getMaskTexture() {
    // Return the segmentation mask texture used for UV-based inscription picking
    return this.maskCanvas ? { image: this.maskCanvas } : null
  }

  setHoveredInscription(inscriptionId: number) {
    this.currentHoveredId = inscriptionId
    this.updateHoveredHighlight()
  }

  setSelectedInscription(inscriptionId: number) {
    this.currentSelectedId = inscriptionId
    this.updateSelectedHighlight()
  }

  getSelectedInscriptionId(): number {
    return this.currentSelectedId
  }

  private updateHighlight(
    material: THREE.MeshStandardMaterial | null,
    inscriptionId: number,
    opacity: number,
  ) {
    if (!this.atlasTexture || !material) return

    if (!inscriptionId) {
      material.opacity = 0.0
      material.needsUpdate = true
      return
    }

    this.applyHighlightToMaterial(inscriptionId, material, opacity)
  }

  private updateSelectedHighlight() {
    this.updateHighlight(
      this.selectedMaterial,
      this.currentSelectedId,
      SceneConfig.highlight.selectedOpacity,
    )
  }

  private updateHoveredHighlight() {
    // Don't show hovered highlight if hovering over selected inscription to avoid overlap
    const hoverId =
      this.currentHoveredId && this.currentHoveredId !== this.currentSelectedId
        ? this.currentHoveredId
        : 0
    this.updateHighlight(
      this.hoveredMaterial,
      hoverId,
      SceneConfig.highlight.hoveredOpacity,
    )
  }

  private calculateUVCoordinates(labelId: number) {
    const tile = this.labelToTile[labelId]
    const baseU = 1 / Math.max(1, this.atlasCols)
    const baseV = 1 / Math.max(1, this.atlasRows)
    const { flipX, flipY, repeatScaleX, repeatScaleY, offsetX, offsetY } =
      this.atlasTweak

    const scaledRepeatX = baseU * (repeatScaleX || 1)
    const scaledRepeatY = baseV * (repeatScaleY || 1)

    // For negative repeats, offset to the far edge so the sampled band stays on the intended tile.
    const repeatX = (flipX ? -1 : 1) * scaledRepeatX
    const repeatY = (flipY ? -1 : 1) * scaledRepeatY

    const atlasOffsetX = (flipX ? tile.col + 1 : tile.col) * baseU + offsetX
    const atlasOffsetY = (flipY ? tile.row + 1 : tile.row) * baseV + offsetY

    return {
      repeat: new THREE.Vector2(repeatX, repeatY),
      offset: new THREE.Vector2(atlasOffsetX, atlasOffsetY),
    }
  }

  private applyHighlightToMaterial(
    inscriptionId: number,
    material: THREE.MeshStandardMaterial,
    opacity: number,
  ) {
    // Remap incoming id if configured
    let labelId = this.atlasTweak.idMap?.[inscriptionId] ?? inscriptionId
    labelId = Math.round(labelId + (this.atlasTweak.idOffset || 0))

    if (!labelId || !this.labelToTile[labelId]) {
      material.opacity = 0.0
      material.needsUpdate = true
      return
    }

    const { repeat, offset } = this.calculateUVCoordinates(labelId)

    // Use cached texture clone or create new one
    const cacheKey = `${labelId}-${repeat.x}-${repeat.y}-${offset.x}-${offset.y}`
    let textureClone = this.textureCloneCache.get(cacheKey)

    if (!textureClone && this.atlasTexture) {
      textureClone = this.atlasTexture.clone()
      this.textureCloneCache.set(cacheKey, textureClone)
    }

    if (textureClone) {
      textureClone.repeat.copy(repeat)
      textureClone.offset.copy(offset)
      material.alphaMap = textureClone
    }
    material.color.copy(this.getHighlightColor(labelId))
    material.opacity = opacity
    material.needsUpdate = true
  }

  getInscriptionAtUV(_u: number, _v: number): number {
    if (
      !this.maskCtx ||
      !this.maskCanvas ||
      this.maskWidth === 0 ||
      this.maskHeight === 0
    )
      return 0
    // Clamp uv to [0,1]
    const u = Math.min(1, Math.max(0, _u))
    const v = Math.min(1, Math.max(0, _v))
    // Canvas origin is top-left; OBJ UV v=0 is bottom => use (1 - v)
    const x = Math.min(
      this.maskWidth - 1,
      Math.max(0, Math.floor(u * this.maskWidth)),
    )
    const y = Math.min(
      this.maskHeight - 1,
      Math.max(0, Math.floor((1 - v) * this.maskHeight)),
    )
    const data = this.maskCtx.getImageData(x, y, 1, 1).data
    const id = data[0] // red channel encodes id 0..255
    return id
  }

  getModelMatrix(): THREE.Matrix4 {
    return this.object?.matrix || new THREE.Matrix4()
  }

  setOnModelReady(callback: () => void) {
    this.onModelReady = callback
  }

  dispose() {
    // Use Three.js traverse to dispose of all meshes and materials
    const disposeObject = (obj: THREE.Object3D | null) => {
      if (!obj) return

      obj.traverse((child) => {
        if ((child as THREE.Object3D & { isMesh?: boolean }).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.geometry?.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.dispose()
            })
          } else {
            mesh.material?.dispose()
          }
        }
      })

      this.scene.remove(obj)
    }

    // Clean up all objects using traverse
    disposeObject(this.object)
    disposeObject(this.selectedMesh)
    disposeObject(this.hoveredMesh)

    // Clean up remaining resources
    this.mesh = null
    this.object = null
    this.selectedMesh = null
    this.hoveredMesh = null
    this.selectedMaterial = null
    this.hoveredMaterial = null
    this.atlasTexture?.dispose()
    this.atlasTexture = null

    // Clean up texture cache
    this.textureCloneCache.forEach((texture) => {
      texture.dispose()
    })
    this.textureCloneCache.clear()

    this.maskCanvas = null
    this.maskCtx = null
  }

  // Pulse animation - only runs once on initial load
  pulseAllInscriptions() {
    if (!this.mesh || !this.hoveredMaterial) return

    const inscriptions = liverInscriptions.slice()
    const overlays: THREE.Mesh[] = []
    const config = SceneConfig.pulse

    // Use desktop animation for all devices
    let index = 0
    const maxConcurrentMeshes = 5 // Limit concurrent meshes

    const addNext = () => {
      if (index >= inscriptions.length) {
        return
      }

      // Limit concurrent meshes to prevent performance issues
      if (overlays.length >= maxConcurrentMeshes) {
        // Remove oldest overlay
        const oldestOverlay = overlays.shift()
        if (oldestOverlay) {
          ;(oldestOverlay.parent || this.scene).remove(oldestOverlay)
          if (Array.isArray(oldestOverlay.material)) {
            oldestOverlay.material.forEach((mat) => {
              mat.dispose()
            })
          } else {
            oldestOverlay.material.dispose()
          }
        }
      }

      // Create overlay for current inscription
      const material = this.hoveredMaterial?.clone()
      if (!material || !this.mesh?.geometry) return

      material.opacity = config.trailColor.startOpacity
      this.applyHighlightToMaterial(
        inscriptions[index].id,
        material,
        config.trailColor.highlightOpacity,
      )

      const mesh = new THREE.Mesh(this.mesh.geometry, material)
      mesh.position.copy(this.mesh.position)
      mesh.rotation.copy(this.mesh.rotation)
      mesh.scale.copy(this.mesh.scale)

      ;(this.mesh?.parent || this.scene).add(mesh)
      overlays.push(mesh)

      // Fade out this inscription after TRAIL_DURATION
      setTimeout(() => {
        gsap.to(material, {
          opacity: 0,
          duration: config.individualFadeDuration,
          ease: "power2.in",
          onComplete: () => {
            ;(mesh.parent || this.scene).remove(mesh)
            material.dispose()
          },
        })
      }, config.trailDuration)

      // Move to next inscription
      setTimeout(addNext, config.trailSpeed)
      index++
    }

    addNext()
  }
}
