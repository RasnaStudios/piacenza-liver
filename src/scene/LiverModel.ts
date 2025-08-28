import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import objUrl from '../assets/liver-model/Fegato.obj'
import baseColorUrl from '../assets/liver-model/Fegato_baseColor.jpg'
import normalUrl from '../assets/liver-model/Fegato_normal.jpg'
import ormUrl from '../assets/liver-model/Fegato_occlusionRoughnessMetallic.jpg'
import maskUrl from '../assets/segmentation.png'
import atlasPngUrl from '../assets/segmentation_atlas.png'
import atlasMeta from '../assets/segmentation_atlas.json'
import { SceneConfig } from '../config/SceneConfig'
import { liverInscriptions, liverGroups } from './LiverData'

export class LiverModel {
  private scene: THREE.Scene
  private mesh: THREE.Mesh | null = null
  private object: THREE.Object3D | null = null
  private onProgress?: (progress: number) => void
  private loadingManager: THREE.LoadingManager
  private lastProgress: number = 0
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
  private atlasTweak: {
    flipX: boolean
    flipY: boolean
    repeatScaleX: number
    repeatScaleY: number
    offsetX: number
    offsetY: number
    idOffset: number
    idMap: Record<number, number>
  } = { 
    flipX: false, 
    flipY: true, 
    repeatScaleX: 1, 
    repeatScaleY: 1, 
    offsetX: 0, 
    offsetY: 0, 
    idOffset: 0, 
    idMap: {
      // Row 0 (1-8) should map to Row 4 (33-40)
      1: 33, 2: 34, 3: 35, 4: 36, 5: 37, 6: 38, 7: 39, 8: 40,
      // Row 1 (9-16) should map to Row 3 (25-32)  
      9: 25, 10: 26, 11: 27, 12: 28, 13: 29, 14: 30, 15: 31, 16: 32,
      // Row 3 (25-32) should map to Row 1 (9-16)
      25: 9, 26: 10, 27: 11, 28: 12, 29: 13, 30: 14, 31: 15, 32: 16,
      // Row 4 (33-40) should map to Row 0 (1-8)
      33: 1, 34: 2, 35: 3, 36: 4, 37: 5, 38: 6, 39: 7, 40: 8
    }
  }

  private currentHoveredId: number = 0
  private currentSelectedId: number = 0

  private getHighlightColor(id: number): THREE.Color {
    const ins = liverInscriptions.find((i) => i.id === id)
    if (ins) {
      const group = (liverGroups as any)[ins.groupId]
      if (group?.color) {
        return new THREE.Color(group.color)
      }
    }
    return new THREE.Color(0xffc107)
  }


  constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
    this.scene = scene
    this.onProgress = onProgress
    // Centralized loading manager for accurate progress reporting
    this.loadingManager = new THREE.LoadingManager()
    this.loadingManager.onStart = () => {
      this.reportProgress(0)
    }
    this.loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      // Unified progress across ALL resources (gltf, bin, textures, segmentation)
      const percent = itemsTotal > 0 ? Math.min(95, Math.round((itemsLoaded / itemsTotal) * 95)) : 0
      this.reportProgress(percent)
    }
    this.loadingManager.onLoad = () => {
      // Manager finished loading all tracked resources
      if (this.lastProgress < 95) this.reportProgress(95)
    }
    
    if (!this.checkWebGLSupport()) {
      console.error('WebGL not supported on this device')
      throw new Error('WebGL not supported')
    }

    this.loadLiverModel()
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  private async loadLiverModel() {
    try {
      // Load PBR textures available in /public/liver-model
      const textureLoader = new THREE.TextureLoader(this.loadingManager)
      const [baseColor, normalTex, ormTex, maskTex, atlasTex] = await Promise.all([
        textureLoader.loadAsync(baseColorUrl),
        textureLoader.loadAsync(normalUrl),
        textureLoader.loadAsync(ormUrl),
        textureLoader.loadAsync(maskUrl),
        textureLoader.loadAsync(atlasPngUrl),
      ])

      // Configure segmentation mask texture
      Object.assign(maskTex, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        generateMipmaps: false,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        flipY: false,
        needsUpdate: true
      })
      
      // Configure PBR textures
      ;[baseColor, normalTex, ormTex].forEach(tex => {
        Object.assign(tex, {
          wrapS: THREE.ClampToEdgeWrapping,
          wrapT: THREE.ClampToEdgeWrapping,
          colorSpace: THREE.LinearSRGBColorSpace,
          flipY: baseColor.flipY,
          needsUpdate: true
        })
      })

      // Configure atlas texture for smooth highlights
      Object.assign(atlasTex, {
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        flipY: false,
        colorSpace: THREE.NoColorSpace,
        needsUpdate: true
      })
      this.atlasTexture = atlasTex

      // Parse atlas meta
      this.atlasCols = (atlasMeta as any).cols || 1
      this.atlasRows = (atlasMeta as any).rows || 1
      const labelsObj = (atlasMeta as any).labels || {}
      this.labelToTile = {}
      Object.keys(labelsObj).forEach(k => {
        const n = Number(k)
        this.labelToTile[n] = { row: labelsObj[k].row, col: labelsObj[k].col }
      })

      // Prepare offscreen canvas for mask sampling
      const img = maskTex.image as HTMLImageElement
      if (img?.width && img?.height) {
        this.maskCanvas = document.createElement('canvas')
        this.maskCanvas.width = this.maskWidth = img.width
        this.maskCanvas.height = this.maskHeight = img.height
        this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true })
        this.maskCtx?.drawImage(img, 0, 0, img.width, img.height)
      }

      // Configure texture properties
      this.configureTexture(baseColor, { flipY: true })
      this.configureTexture(normalTex, { flipY: true })
      this.configureTexture(ormTex, { flipY: true })

      // Create base material with PBR settings
      const baseMaterial = new THREE.MeshStandardMaterial({
        // Texture maps
        map: baseColor,
        normalMap: normalTex,
        aoMap: ormTex,
        roughnessMap: ormTex,
        metalnessMap: ormTex,
        
        // Rendering properties
        side: THREE.FrontSide,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        
        // Material properties
        metalness: 1.0,
        roughness: 1.0,
        aoMapIntensity: 1.0,
        flatShading: true // Smooth shading helps hide mesh topology
      })
      
      baseMaterial.shadowSide = THREE.FrontSide

      // Create separate materials for selected and hovered states
      this.selectedMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffc107),
        transparent: true,
        opacity: 0.0,
        alphaMap: this.atlasTexture,
        depthWrite: false,
        alphaTest: 0.0,
        blending: THREE.AdditiveBlending,
        depthTest: true
      })
      
      this.hoveredMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffc107),
        transparent: true,
        opacity: 0.0,
        alphaMap: this.atlasTexture,
        depthWrite: false,
        alphaTest: 0.0,
        blending: THREE.AdditiveBlending,
        depthTest: true
      })

      // Load OBJ geometry
      const objLoader = new OBJLoader(this.loadingManager)
      const object = await objLoader.loadAsync(objUrl)

      object.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as THREE.Mesh
          const geom = mesh.geometry as THREE.BufferGeometry
          
          // Compute vertex normals to smooth out grid artifacts from OBJ model
          geom.computeVertexNormals()
          
          mesh.material = baseMaterial
          this.mesh = mesh
          
          // Ensure uv2 exists so aoMap can work; duplicate uv if missing

          // Create and add selected overlay mesh
          if (!this.selectedMesh && this.selectedMaterial) {
            const selectedMesh = new THREE.Mesh(geom, this.selectedMaterial)
            selectedMesh.position.copy(mesh.position)
            selectedMesh.rotation.copy(mesh.rotation)
            selectedMesh.scale.copy(mesh.scale)
            selectedMesh.renderOrder = (mesh.renderOrder || 0) + 1
            if (mesh.parent) {
              mesh.parent.add(selectedMesh)
            } else {
              this.scene.add(selectedMesh)
            }
            this.selectedMesh = selectedMesh
          }
          
          // Create and add hovered overlay mesh
          if (!this.hoveredMesh && this.hoveredMaterial) {
            const hoveredMesh = new THREE.Mesh(geom, this.hoveredMaterial)
            hoveredMesh.position.copy(mesh.position)
            hoveredMesh.rotation.copy(mesh.rotation)
            hoveredMesh.scale.copy(mesh.scale)
            hoveredMesh.renderOrder = (mesh.renderOrder || 0) + 2
            if (mesh.parent) {
              mesh.parent.add(hoveredMesh)
            } else {
              this.scene.add(hoveredMesh)
            }
            this.hoveredMesh = hoveredMesh
          }
        }
      })

      // Apply transforms
      object.scale.setScalar(SceneConfig.model.scale)
      object.position.copy(SceneConfig.model.position)
      object.rotation.setFromVector3(SceneConfig.model.rotation)

      this.object = object
      this.scene.add(object)

      const self = this
      ;(window as any).liverAtlas = {
        set: (t: any) => self.setAtlasTweak(t),
        get: () => self.getAtlasTweak(),
      }

      // Complete load
      this.reportProgress(100)
      if (this.onModelReady) this.onModelReady()
      
    } catch (error) {
      console.error('Error loading liver model:', error)
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
    // Clear hover state when selecting to prevent overlap
    if (inscriptionId > 0) {
      this.currentHoveredId = 0
      this.updateHoveredHighlight()
    }
    this.updateSelectedHighlight()
  }

  private updateSelectedHighlight() {
    if (!this.atlasTexture || !this.selectedMaterial) return

    if (!this.currentSelectedId) {
      this.selectedMaterial.opacity = 0.0
      this.selectedMaterial.needsUpdate = true
      return
    }

    this.applyHighlightToMaterial(this.currentSelectedId, this.selectedMaterial, 0.4)
  }

  private updateHoveredHighlight() {
    if (!this.atlasTexture || !this.hoveredMaterial) return

    // Don't show hovered highlight if hovering over selected inscription to avoid overlap
    if (!this.currentHoveredId || this.currentHoveredId === this.currentSelectedId) {
      this.hoveredMaterial.opacity = 0.0
      this.hoveredMaterial.needsUpdate = true
      return
    }

    // Only show hovered highlight for different inscriptions
    this.applyHighlightToMaterial(this.currentHoveredId, this.hoveredMaterial, 0.3)
  }

  private applyHighlightToMaterial(inscriptionId: number, material: THREE.MeshStandardMaterial, opacity: number) {
    // Remap incoming id if configured
    const map = this.atlasTweak.idMap || {}
    let labelId = (map as any)[inscriptionId] ?? inscriptionId
    labelId = Math.round(labelId + (this.atlasTweak.idOffset || 0))

    if (!labelId || !this.labelToTile[labelId]) {
      material.opacity = 0.0
      material.needsUpdate = true
      return
    }

    const tile = this.labelToTile[labelId]
    const baseU = 1 / Math.max(1, this.atlasCols)
    const baseV = 1 / Math.max(1, this.atlasRows)
    const { flipX, flipY, repeatScaleX, repeatScaleY, offsetX, offsetY } = this.atlasTweak
    const uRep = (flipX ? -1 : 1) * baseU * (repeatScaleX || 1)
    const vRep = (flipY ? -1 : 1) * baseV * (repeatScaleY || 1)
    const offX = (flipX ? (tile.col + 1) * baseU : tile.col * baseU) + offsetX
    const offY = (flipY ? 1 - (tile.row + 1) * baseV : tile.row * baseV) + offsetY
    
    // Create a clone of the atlas texture for this material
    const textureClone = this.atlasTexture!.clone()
    textureClone.repeat.set(uRep, vRep)
    textureClone.offset.set(offX, offY)
    textureClone.needsUpdate = true
    
    material.alphaMap = textureClone
    material.color.copy(this.getHighlightColor(labelId))
    material.opacity = opacity
    material.needsUpdate = true
  }


  getInscriptionAtUV(_u: number, _v: number): number {
    if (!this.maskCtx || !this.maskCanvas || this.maskWidth === 0 || this.maskHeight === 0) return 0
    // Clamp uv to [0,1]
    const u = Math.min(1, Math.max(0, _u))
    const v = Math.min(1, Math.max(0, _v))
    // Canvas origin is top-left; OBJ UV v=0 is bottom => use (1 - v)
    const x = Math.min(this.maskWidth - 1, Math.max(0, Math.floor(u * this.maskWidth)))
    const y = Math.min(this.maskHeight - 1, Math.max(0, Math.floor((1 - v) * this.maskHeight)))
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

  private configureTexture(texture: THREE.Texture, options: { flipY?: boolean } = {}) {
    texture.anisotropy = 4  // Reduce anisotropy to minimize artifacts
    texture.minFilter = THREE.LinearFilter  // Use simpler filtering
    texture.magFilter = THREE.LinearFilter
    texture.wrapS = THREE.RepeatWrapping  // Try repeat wrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.generateMipmaps = false  // Disable mipmaps to avoid compression artifacts
    texture.flipY = options.flipY ?? false
    texture.needsUpdate = true
  }

  dispose() {
    // Clean up mesh and geometry
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry?.dispose()
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(mat => mat.dispose())
      } else {
        this.mesh.material?.dispose()
      }
      this.mesh = null
    }

    // Clean up object
    if (this.object) {
      this.scene.remove(this.object)
      this.object = null
    }

    // Clean up highlight meshes
    if (this.selectedMesh) {
      this.scene.remove(this.selectedMesh)
      this.selectedMesh = null
    }
    if (this.hoveredMesh) {
      this.scene.remove(this.hoveredMesh)
      this.hoveredMesh = null
    }

    // Clean up materials and textures
    this.selectedMaterial?.dispose()
    this.selectedMaterial = null
    this.hoveredMaterial?.dispose()
    this.hoveredMaterial = null
    this.atlasTexture?.dispose()
    this.atlasTexture = null

    // Clean up canvas resources
    this.maskCanvas = null
    this.maskCtx = null
  }
}