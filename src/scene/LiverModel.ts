import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { isMobile } from 'react-device-detect'
import { SceneConfig } from '../config/SceneConfig'
// Removed inscription->emissive mapping; keep inscription data usage out to avoid lint warnings

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
  private shaderUniforms!: {
    diffuseTexture: { value: THREE.Texture | null }
    normalTexture: { value: THREE.Texture | null }
    maskTexture: { value: THREE.Texture | null }
    ormTexture: { value: THREE.Texture | null }
    time: { value: number }
    hoveredInscription: { value: number }
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
    
    // Init shader uniforms
    this.shaderUniforms = {
      diffuseTexture: { value: null },
      normalTexture: { value: null },
      maskTexture: { value: null },
      ormTexture: { value: null },
      time: { value: 0 },
      hoveredInscription: { value: 0 },
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

      const [baseColor, normalTex, maskTex, ormTex] = await Promise.all([
        textureLoader.loadAsync('/liver-model/Fegato_baseColor.png'),
        textureLoader.loadAsync('/liver-model/Fegato_normal.png'),
        textureLoader.loadAsync('/liver-model-gltf/segmentation.png'),
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
      // Force segmentation to no flip (most baked masks are un-flipped)
      maskTex.flipY = false
      maskTex.needsUpdate = true
      baseColor.wrapS = baseColor.wrapT = THREE.ClampToEdgeWrapping
      normalTex.wrapS = normalTex.wrapT = THREE.ClampToEdgeWrapping
      maskTex.wrapS = maskTex.wrapT = THREE.ClampToEdgeWrapping
      ormTex.wrapS = ormTex.wrapT = THREE.ClampToEdgeWrapping
      maskTex.magFilter = THREE.NearestFilter
      maskTex.minFilter = THREE.NearestFilter
      baseColor.needsUpdate = true
      normalTex.needsUpdate = true
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

      // Use standard PBR material with full PBR maps (baseColor, normal, ORM)
      const material = new THREE.MeshStandardMaterial({
        map: baseColor,
        normalMap: normalTex,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.FrontSide,
      })
      material.normalScale = new THREE.Vector2(1, 1)
      material.aoMap = ormTex
      material.roughnessMap = ormTex
      material.metalnessMap = ormTex
      material.aoMapIntensity = 1.0
      material.transparent = false
      material.depthWrite = true
      material.color = new THREE.Color(0xffffff)
      material.needsUpdate = true

      // Inject hover glow fill using onBeforeCompile, sampling the segmentation mask
      // and blending a group-colored glow over the hovered region.
      const { generateInscriptionColorFunction } = await import('../shaders/generateShader')
      const colorFunc = generateInscriptionColorFunction()

      material.onBeforeCompile = (shader) => {
        // Expose shader to instance for runtime uniform updates
        ;(material as any).userData = (material as any).userData || {}
        ;(material as any).userData.shader = shader

        // Add custom uniforms
        shader.uniforms.maskTexture = { value: maskTex }
        shader.uniforms.hoveredInscription = { value: this.shaderUniforms.hoveredInscription.value }
        shader.uniforms.time = { value: this.shaderUniforms.time.value }
        shader.uniforms.maskDebug = { value: 4 } // Show segmentation map as solid colors

        // Inject function + uniforms into fragment shader
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>\n` +
            `uniform sampler2D maskTexture;\n` +
            `uniform int hoveredInscription;\n` +
            `uniform float time;\n` +
            `uniform int maskDebug;\n` +
            `${colorFunc}\n`
        )

        // Inject right before final output through the standard include hook
        const hook = '#include <output_fragment>'
        const injection =
          `\n` +
          `#ifdef USE_UV\n` +
          `  vec2 glowUv = vUv;\n` +
          `  float grayValue = texture2D( maskTexture, glowUv ).r;\n` +
          `  int insId = int(grayValue * 255.0 + 0.5);\n` +
          `  if (maskDebug == 1) {\n` +
          `    outgoingLight = vec3(grayValue);\n` +
          `  } else if (maskDebug == 2) {\n` +
          `    if (insId > 0 && insId <= 42 && insId == hoveredInscription) { outgoingLight = vec3(1.0); }\n` +
          `  } else if (maskDebug == 3) {\n` +
          `    if (insId > 0 && insId <= 42 && insId == hoveredInscription) { outgoingLight = getInscriptionColor(insId); }\n` +
          `  } else if (maskDebug == 4) {\n` +
          `    if (insId > 0 && insId <= 42) { outgoingLight = getInscriptionColor(insId); } else { outgoingLight = vec3(0.0); }\n` +
          `  }\n` +
          `  if (insId > 0 && insId <= 42 && insId == hoveredInscription) {\n` +
          `    vec3 groupColor = getInscriptionColor(insId);\n` +
          `    float pulse = sin(time * 4.0) * 0.25 + 0.75;\n` +
          `    float intensity = 0.35 * pulse;\n` +
          `    outgoingLight = mix(outgoingLight, groupColor * 1.5, intensity);\n` +
          `  }\n` +
          `#endif\n` +
          hook

        shader.fragmentShader = shader.fragmentShader.replace(hook, injection)
      }

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

  updateMaterial(properties: any) {
    if (this.mesh && this.mesh.material) {
      Object.assign(this.mesh.material, properties)
    }
  }

  getMesh() {
    return this.mesh
  }

  // Force-use the segmentation image as the diffuse map for visual verification
  // Call with true to show the raw mask image, false to restore the PBR baseColor
  setShowSegmentationAsDiffuse(show: boolean) {
    const mesh = this.mesh
    if (!mesh) return
    const mat = mesh.material as THREE.MeshStandardMaterial
    const diffuse = this.shaderUniforms.diffuseTexture.value as THREE.Texture | null
    const mask = this.shaderUniforms.maskTexture.value as THREE.Texture | null
    if (!mat) return
    if (show && mask) {
      mat.map = mask
      mat.color.set(0xffffff)
      mat.needsUpdate = true
    } else if (!show && diffuse) {
      mat.map = diffuse
      mat.color.set(0xffffff)
      mat.needsUpdate = true
    }
  }

  getObject() {
    return this.object
  }

  updateShaderUniforms(time: number) {
    this.shaderUniforms.time.value = time
    // Push to material shader if available
    const mat = this.mesh?.material as THREE.MeshStandardMaterial | undefined
    const shader = (mat as any)?.userData?.shader
    if (shader && shader.uniforms && shader.uniforms.time) {
      shader.uniforms.time.value = time
    }
  }
  setHoveredInscription(inscriptionId: number) {
    this.shaderUniforms.hoveredInscription.value = inscriptionId
    const mat = this.mesh?.material as THREE.MeshStandardMaterial | undefined
    const shader = (mat as any)?.userData?.shader
    if (shader && shader.uniforms && shader.uniforms.hoveredInscription) {
      shader.uniforms.hoveredInscription.value = inscriptionId
      // Keep maskDebug unchanged (we default to 4 for full segmentation color view)
    }
  }

  // Enable/disable shader mask debug visualization (0=off,1=mask grayscale,2=hovered white,3=hovered group color)
  setMaskDebugMode(mode: 0 | 1 | 2 | 3) {
    const mat = this.mesh?.material as THREE.MeshStandardMaterial | undefined
    const shader = (mat as any)?.userData?.shader
    if (shader && shader.uniforms && shader.uniforms.maskDebug) {
      shader.uniforms.maskDebug.value = mode
    }
  }

  // Simple full-model hover effect: toggle emissive without relying on mask/inscriptions
  setModelHovered(active: boolean) {
    const mat = this.mesh?.material as THREE.MeshStandardMaterial | undefined
    if (!mat) return
    if (active) {
      // Soft white emissive for a subtle glow
      mat.emissive.set(0xffffff)
      mat.emissiveIntensity = 0.35
    } else {
      // Reset to no emissive
      mat.emissive.set(0x000000)
      mat.emissiveIntensity = 1.0
    }
    mat.needsUpdate = true
  }


  getInscriptionAtUV(_u: number, _v: number): number {
    if (!this.maskCtx || !this.maskCanvas || this.maskWidth === 0 || this.maskHeight === 0) return 0
    // Clamp uv to [0,1]
    const u = Math.min(1, Math.max(0, _u))
    const v = Math.min(1, Math.max(0, _v))
    // Texture has flipY = true; canvas origin is top-left => use (1 - v)
    const x = Math.min(this.maskWidth - 1, Math.max(0, Math.floor(u * this.maskWidth)))
    const y = Math.min(this.maskHeight - 1, Math.max(0, Math.floor((1 - v) * this.maskHeight)))
    const data = this.maskCtx.getImageData(x, y, 1, 1).data
    const id = data[0] // red channel encodes id 0..255
    return id
  }

  getMaskTexture() {
    return this.shaderUniforms?.maskTexture?.value
  }

  getInscriptionPosition(_inscriptionId: number): THREE.Vector2 | null {
    return null
  }

  getModelMatrix(): THREE.Matrix4 {
    return this.object?.matrix || new THREE.Matrix4()
  }

  setOnModelReady(callback: () => void) {
    this.onModelReady = callback
  }

  animateInitialRotation() {
    const target = this.object || this.mesh
    if (!target) return

    const config = SceneConfig.animation.model.scaleAnimation
    const startTime = Date.now()

    target.scale.setScalar(config.startScale)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / config.duration, 1)
      // Only scale the model - no movement
      const currentScale = config.startScale + (config.endScale - config.startScale) * progress
      target.scale.setScalar(currentScale)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  isModelVisible(): boolean {
    if (!this.object || !this.mesh) return false
    
    // Check if object is in scene
    if (!this.scene.children.includes(this.object)) return false
    
    // Check if mesh has geometry and material
    if (!this.mesh.geometry || !this.mesh.material) return false
    
    // No custom shader path in OBJ-only mode
    
    return true
  }

  ensureModelVisible(): void {
    if (!this.isModelVisible() && this.object) {
      console.warn('Model not visible, attempting recovery...')
      
      // Re-add to scene if missing
      if (!this.scene.children.includes(this.object)) {
        this.scene.add(this.object)
      }
      
      // Force material update
      if (this.mesh && this.mesh.material) {
        const material = this.mesh.material as THREE.MeshStandardMaterial
        material.needsUpdate = true
      }
    }
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