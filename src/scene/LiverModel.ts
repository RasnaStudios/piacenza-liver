import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { isMobile } from 'react-device-detect'
import { SceneConfig } from '../config/SceneConfig'
import vertSource from '../shaders/liver-inscription.vert?raw'
import fragTemplate from '../shaders/liver-inscription.frag.template?raw'
import { generateInscriptionColorFunction } from '../shaders/generateShader'

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

  // Offscreen canvas for CPU-side sampling of the segmentation mask
  private maskCanvas: HTMLCanvasElement | null = null
  private maskCtx: CanvasRenderingContext2D | null = null
  private maskWidth = 0
  private maskHeight = 0
  
  private onModelReady?: () => void
  private shaderUniforms!: Record<string, THREE.IUniform>


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
    
    // Init shader uniforms
    this.shaderUniforms = {
      diffuseTexture: { value: null },
      normalTexture: { value: null },
      maskTexture: { value: null },
      ormTexture: { value: null },
      time: { value: 0 },
      hoveredInscription: { value: 0 },
      selectedInscription: { value: 0 },
      uvMode: { value: 1 }, // flip V for mask in shader; maskTex.flipY=false, OBJ UVs expect V flip
      normalScale: { value: 1.0 },
      flipNormalY: { value: 1.0 },
      useNormal: { value: 1 },
      ambientStrength: { value: 0.25 },
      lightDirectionWorld: { value: new THREE.Vector3(0, -1, -0.5).normalize() },
      useORM: { value: 1 },
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

  async loadLiverModel() {
    try {
      // Load PBR textures available in /public/liver-model
      const textureLoader = new THREE.TextureLoader(this.loadingManager)

      const cacheBust = typeof window !== 'undefined' ? `?v=${(window as any).__BUILD_HASH__ || Date.now()}` : ''
      const [baseColor, normalTex, maskTex, ormTex] = await Promise.all([
        textureLoader.loadAsync('/liver-model/Fegato_baseColor.png'),
        textureLoader.loadAsync('/liver-model/Fegato_normal.png'),
        textureLoader.loadAsync(`/segmentation.png${cacheBust}`),
        textureLoader.loadAsync('/liver-model/Fegato_occlusionRoughnessMetallic.png'),
      ])

      // Configure texture properties
      // Segmentation MUST be sampled as nearest without mipmaps to avoid ID bleeding

      // Prevent ID bleeding from interpolation/mipmaps on the segmentation texture
      maskTex.minFilter = THREE.NearestFilter
      maskTex.magFilter = THREE.NearestFilter
      maskTex.generateMipmaps = false
      maskTex.wrapS = THREE.ClampToEdgeWrapping
      maskTex.wrapT = THREE.ClampToEdgeWrapping
      // Segmentation loaded from /public root; keep flipY=false to match CPU sampling path
      maskTex.flipY = false
      maskTex.needsUpdate = true
      baseColor.wrapS = baseColor.wrapT = THREE.ClampToEdgeWrapping
      normalTex.wrapS = normalTex.wrapT = THREE.ClampToEdgeWrapping
      maskTex.wrapS = maskTex.wrapT = THREE.ClampToEdgeWrapping
      ormTex.wrapS = ormTex.wrapT = THREE.ClampToEdgeWrapping
      maskTex.magFilter = THREE.NearestFilter
      maskTex.minFilter = THREE.NearestFilter
      // Ensure no automatic GPU sRGB decode; we handle conversion in shader
      baseColor.colorSpace = THREE.LinearSRGBColorSpace
      normalTex.colorSpace = THREE.LinearSRGBColorSpace
      ormTex.colorSpace = THREE.LinearSRGBColorSpace
      baseColor.needsUpdate = true
      normalTex.flipY = baseColor.flipY
      normalTex.needsUpdate = true
      // Align ORM orientation with base/normal
      ormTex.flipY = baseColor.flipY
      ormTex.needsUpdate = true

      // Assign uniforms
      this.shaderUniforms.diffuseTexture.value = baseColor
      this.shaderUniforms.normalTexture.value = normalTex
      this.shaderUniforms.maskTexture.value = maskTex
      this.shaderUniforms.ormTexture.value = ormTex

      // Prepare offscreen canvas for mask sampling (for raycast picking)
      const img: HTMLImageElement | undefined = maskTex.image as any
      if (img && img.width && img.height) {
        this.maskCanvas = document.createElement('canvas')
        this.maskCanvas.width = img.width
        this.maskCanvas.height = img.height
        this.maskWidth = img.width
        this.maskHeight = img.height
        this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D | null
        if (this.maskCtx) {
          this.maskCtx.drawImage(img, 0, 0, img.width, img.height)
        }
      }

      // Build ShaderMaterial from templates
      const colorFunc = generateInscriptionColorFunction()
      const fragmentShader = fragTemplate.replace('{{INSCRIPTION_COLOR_FUNCTION}}', colorFunc)

      const material = new THREE.ShaderMaterial({
        uniforms: this.shaderUniforms,
        vertexShader: vertSource,
        fragmentShader,
        lights: false,
        transparent: false,
        depthWrite: true,
        side: THREE.FrontSide,
      })
      // Enable derivatives (dFdx/dFdy) for WebGL1; safe no-op in WebGL2
      ;(material as any).extensions = { ...(material as any).extensions, derivatives: true }

      // Load OBJ geometry
      const objLoader = new OBJLoader(this.loadingManager)
      const object = await objLoader.loadAsync('/liver-model/Fegato.obj')

      object.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.material = material
          const geom = mesh.geometry as THREE.BufferGeometry
          // Ensure uv2 exists so aoMap can work; duplicate uv if missing
          const uv = geom.getAttribute('uv') as THREE.BufferAttribute
          if (uv && !geom.getAttribute('uv2')) {
            geom.setAttribute('uv2', new THREE.BufferAttribute(uv.array, 2))
          }
          // Ensure aoMap works (requires uv2)
          mesh.castShadow = !isMobile
          mesh.receiveShadow = !isMobile
          mesh.userData = { type: 'liver' }
          if (!this.mesh) this.mesh = mesh
        }
      })

      // Apply transforms
      object.scale.setScalar(SceneConfig.model.scale)
      object.position.copy(SceneConfig.model.position)
      object.rotation.setFromVector3(SceneConfig.model.rotation)

      this.scene.add(object)
      this.object = object

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

  updateShaderUniforms(time: number) {
    this.shaderUniforms.time.value = time
  }
  setNormalScale(scale: number) {
    this.shaderUniforms.normalScale.value = scale
  }
  setUseNormal(enabled: boolean) {
    this.shaderUniforms.useNormal.value = enabled ? 1.0 : 0.0
  }
  setFlipNormalY(sign: 1.0 | -1.0) {
    this.shaderUniforms.flipNormalY.value = sign
  }
  setAmbientStrength(strength: number) {
    this.shaderUniforms.ambientStrength.value = Math.max(0, strength)
  }
  setLightDirectionWorld(dir: THREE.Vector3) {
    const v = dir.clone().normalize()
    this.shaderUniforms.lightDirectionWorld.value.copy(v)
  }
  setUseORM(enabled: boolean) {
    this.shaderUniforms.useORM.value = enabled ? 1.0 : 0.0
  }
  setHoveredInscription(inscriptionId: number) {
    this.shaderUniforms.hoveredInscription.value = inscriptionId
  }

  setSelectedInscription(inscriptionId: number) {
    this.shaderUniforms.selectedInscription.value = inscriptionId
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

  getMaskTexture() {
    return this.shaderUniforms?.maskTexture?.value
  }

  getModelMatrix(): THREE.Matrix4 {
    return this.object?.matrix || new THREE.Matrix4()
  }

  setOnModelReady(callback: () => void) {
    this.onModelReady = callback
  }

  dispose() {
    if (this.shaderUniforms?.diffuseTexture?.value) this.shaderUniforms.diffuseTexture.value.dispose()
    if (this.shaderUniforms?.normalTexture?.value) this.shaderUniforms.normalTexture.value.dispose()
    if (this.shaderUniforms?.maskTexture?.value) this.shaderUniforms.maskTexture.value.dispose()
    
    if (this.mesh && this.mesh.material) {
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(material => material.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }
    
    if (this.mesh && this.mesh.geometry) {
      this.mesh.geometry.dispose()
    }
    
    if (this.object) {
      this.scene.remove(this.object)
    }
    if (this.mesh && this.mesh !== this.object) {
      this.scene.remove(this.mesh)
    }
    
    this.mesh = null
    this.object = null
    
  }
  
} 