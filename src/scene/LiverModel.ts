import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { isMobile } from 'react-device-detect'
import { LiverShaderUniforms } from '../shaders/LiverInscriptionShader'
import { SceneConfig } from '../config/SceneConfig'

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
  
  private shaderUniforms!: LiverShaderUniforms
  private maskTexture: THREE.Texture | null = null
  private inscriptionPositions: Map<number, THREE.Vector2> = new Map()
  private onModelReady?: () => void
  private textureData: Uint8Array | null = null

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
    
    this.shaderUniforms = {
      time: { value: 0.0 },
      diffuseTexture: { value: null },
      normalTexture: { value: null },
      maskTexture: { value: null },
      hoveredInscription: { value: 0 }
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
      // Load segmentation map for interactions
      const segmentationTexture = await this.loadSegmentationMap()
      this.maskTexture = segmentationTexture
      this.shaderUniforms.maskTexture.value = segmentationTexture

      // Load glTF model with PBR materials
      const gltfLoader = new GLTFLoader(this.loadingManager)
      // Ensure external textures (when using .gltf) resolve from this folder
      gltfLoader.setResourcePath('/liver-model-gltf/')

      // Load using the shared LoadingManager so all subresources contribute to progress
      const loadWithProgress = (url: string) => gltfLoader.loadAsync(url)

      // Load .gltf (JSON + bin + external textures)
      const gltf = await loadWithProgress('/liver-model-gltf/Fegato_Text.gltf')
      const object = gltf.scene

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // USE NATIVE glTF MATERIAL + Add inscription emissive with onBeforeCompile
          const originalMaterial = child.material as THREE.MeshStandardMaterial
          console.log('✅ Using native glTF material with inscriptions:', originalMaterial)
          
          // Clear existing emissive first
          if (originalMaterial.emissiveMap) {
            originalMaterial.emissiveMap = null
          }
          originalMaterial.emissive.setHex(0x000000)
          originalMaterial.emissiveIntensity = 0
          
          // Add inscription system with onBeforeCompile (fixed approach)
          originalMaterial.onBeforeCompile = (shader) => {
            // Add our uniforms for inscriptions
            shader.uniforms.maskTexture = this.shaderUniforms.maskTexture
            shader.uniforms.hoveredInscription = this.shaderUniforms.hoveredInscription
            shader.uniforms.time = this.shaderUniforms.time
            
            // Add uniform declarations to fragment shader
            shader.fragmentShader = `
              uniform sampler2D maskTexture;
              uniform int hoveredInscription;
              uniform float time;
              ${shader.fragmentShader}
            `
            
            // Inject inscription logic before final color output (safe approach)
            shader.fragmentShader = shader.fragmentShader.replace(
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
              `
                // Custom inscription emissive
                vec2 maskUv = vec2(vUv.x, 1.0 - vUv.y);
                vec4 maskColor = texture2D(maskTexture, maskUv);
                float grayValue = maskColor.r;
                int inscriptionId = int(grayValue * 255.0 + 0.5);
                
                vec3 finalEmissive = vec3(0.0);
                if (inscriptionId > 0 && inscriptionId <= 42 && inscriptionId == hoveredInscription) {
                  // Simple emissive glow for hovered inscription
                  float pulse = sin(time * 4.0) * 0.2 + 0.8;
                  finalEmissive = vec3(0.3, 0.15, 0.0) * pulse; // Orange glow
                }
                
                gl_FragColor = vec4( outgoingLight + finalEmissive, diffuseColor.a );
              `
            )
          }
          
          originalMaterial.needsUpdate = true
          
          // Configure shadows and metadata
          child.castShadow = !isMobile
          child.receiveShadow = !isMobile
          child.userData = { type: 'liver' }
          
          if (!this.mesh) {
            this.mesh = child
          }
        }
      })

      // Apply initial configuration
      object.scale.setScalar(SceneConfig.model.scale)
      object.position.copy(SceneConfig.model.position)
      object.rotation.setFromVector3(SceneConfig.model.rotation)

      this.scene.add(object)
      this.object = object

      
      this.animateInitialRotation()
      
      
      // Finalize progress at 100% before signaling readiness
      this.reportProgress(100)
      if (this.onModelReady) {
        this.onModelReady()
      }
      
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

  getObject() {
    return this.object
  }

  updateShaderUniforms(time: number) {
    this.shaderUniforms.time.value = time
  }

  setHoveredInscription(inscriptionId: number) {
    this.shaderUniforms.hoveredInscription.value = inscriptionId
  }

  getInscriptionAtUV(u: number, v: number): number {
    if (!this.textureData || !this.maskTexture) {
      console.log('❌ No textureData or maskTexture:', {
        textureData: !!this.textureData,
        maskTexture: !!this.maskTexture
      })
      return 0
    }

    const width = this.maskTexture.image.width
    const height = this.maskTexture.image.height
    
    const x = Math.floor(u * width)
    const y = Math.floor(v * height)
    
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return 0
    }
    
    const index = (y * width + x) * 4
    const inscriptionId = this.textureData[index]
    
    return inscriptionId
  }

  getMaskTexture() {
    return this.maskTexture
  }

  getInscriptionPosition(inscriptionId: number): THREE.Vector2 | null {
    return this.inscriptionPositions.get(inscriptionId) || null
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
    
    // Check if material is ready
    const material = this.mesh.material as THREE.MeshStandardMaterial
    if (material.onBeforeCompile && !material.userData.shaderReady) return false
    
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
    if (this.shaderUniforms.diffuseTexture.value) {
      this.shaderUniforms.diffuseTexture.value.dispose()
    }
    if (this.shaderUniforms.normalTexture.value) {
      this.shaderUniforms.normalTexture.value.dispose()
    }
    if (this.shaderUniforms.maskTexture.value) {
      this.shaderUniforms.maskTexture.value.dispose()
    }
    if (this.maskTexture) {
      this.maskTexture.dispose()
    }
    
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
    this.maskTexture = null
    this.inscriptionPositions.clear()
  }

  private loadSegmentationMap(): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader(this.loadingManager)
      
      if (isMobile) {
        textureLoader.setCrossOrigin('anonymous')
      }
      
      textureLoader.load(
        '/liver-model-gltf/segmentation.png',
        (texture) => {
          texture.magFilter = THREE.NearestFilter
          texture.minFilter = THREE.NearestFilter
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.flipY = false
          texture.needsUpdate = true
          
          if (texture.image.complete) {
            this.extractInscriptionPositionsFromTexture(texture)
            resolve(texture)
          } else {
            texture.image.onload = () => {
              this.extractInscriptionPositionsFromTexture(texture)
              resolve(texture)
            }
            texture.image.onerror = (error: Event) => {
              reject(error)
            }
          }
        },
        // Progress handled through LoadingManager
        undefined,
        (error) => {
          reject(error)
        }
      )
    })
  }

  private extractInscriptionPositionsFromTexture(texture: THREE.Texture) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    
    canvas.width = texture.image.width
    canvas.height = texture.image.height
    
    ctx.drawImage(texture.image, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    this.textureData = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i += 4) {
      this.textureData[i] = data[i]
    }
    
    this.inscriptionPositions = new Map()
    
    const sampleStep = 4
    const uniqueValues = new Set<number>()
    
    for (let i = 0; i < data.length; i += sampleStep * 4) {
      const r = data[i]
      uniqueValues.add(r)
    }
    
    
    // Process inscriptions 1-42 (current segmentation map range)
    for (let inscriptionId = 1; inscriptionId <= 42; inscriptionId++) {
      let found = false
      let totalX = 0
      let totalY = 0
      let pixelCount = 0
      
      for (let y = 0; y < canvas.height; y += sampleStep) {
        for (let x = 0; x < canvas.width; x += sampleStep) {
          const index = (y * canvas.width + x) * 4
          const r = data[index]
          
          if (r === inscriptionId) {
            found = true
            totalX += x
            totalY += y
            pixelCount++
          }
        }
      }
      
      if (found && pixelCount > 0) {
        const centerU = totalX / pixelCount / canvas.width
        const centerV = 1 - (totalY / pixelCount / canvas.height)
        this.inscriptionPositions.set(inscriptionId, new THREE.Vector2(centerU, centerV))
      }
    }
  }
} 