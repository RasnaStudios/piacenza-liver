import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import { 
  liverInscriptionVertexShader, 
  liverInscriptionFragmentShader, 
  type LiverShaderUniforms 
} from '../shaders/liverInscriptionShader'

export class LiverModel {
  private scene: THREE.Scene
  private mesh: THREE.Mesh | null = null
  private object: THREE.Object3D | null = null
  private onProgress?: (progress: number) => void
  
  // New properties for inscription system
  private shaderUniforms!: LiverShaderUniforms
  private maskTexture: THREE.Texture | null = null
  private inscriptionPositions: Map<number, THREE.Vector2> = new Map()
  private hoveredInscription: number = 0
  private onModelReady?: () => void
  private textureData: Uint8Array | null = null // Cache for texture data

  constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
    this.scene = scene
    this.onProgress = onProgress
    
    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      console.error('WebGL not supported on this device')
      throw new Error('WebGL not supported')
    }
    
    // Initialize shader uniforms
    this.shaderUniforms = {
      time: { value: 0.0 },
      diffuseTexture: { value: null },
      maskTexture: { value: null },
      hoveredInscription: { value: 0 }
    }
    
    this.loadLiverModel()
  }

  // Check WebGL support
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  // Load the OBJ model with PBR textures
  async loadLiverModel() {
    try {
      // Report initial progress
      this.onProgress?.(10)

      // Check if we're on mobile and adjust loading strategy
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Load all textures in parallel with mobile-specific settings
      const textureLoader = new THREE.TextureLoader()
      
      // For mobile, use lower quality settings to improve performance
      if (isMobile) {
        textureLoader.setCrossOrigin('anonymous')
      }
      
      const texturePromises = [
        textureLoader.loadAsync('/liver-model/Pbr/texture_diffuse.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_normal.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_metallic.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_roughness.png')
      ]
      
      // Add timeout for mobile devices
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Texture loading timeout')), isMobile ? 30000 : 60000)
      })
      
      const textures = await Promise.race([
        Promise.all(texturePromises),
        timeoutPromise
      ]) as THREE.Texture[]

      this.onProgress?.(40) // Textures loaded

      const [diffuseTexture, normalTexture, metallicTexture, roughnessTexture] = textures

      // Configure texture settings for better quality and mobile compatibility
      textures.forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.flipY = true
        texture.generateMipmaps = true
        
        // Use lower quality filters on mobile for better performance
        if (isMobile) {
          texture.minFilter = THREE.LinearMipmapNearestFilter
          texture.magFilter = THREE.NearestFilter
        } else {
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
        }
      })

      // Load the segmentation map texture with timeout
      this.maskTexture = await Promise.race([
        this.loadSegmentationMap(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Segmentation map timeout')), 15000))
      ]) as THREE.Texture

      this.onProgress?.(60) // Textures configured

      // Set up shader uniforms
      this.shaderUniforms.diffuseTexture.value = diffuseTexture
      this.shaderUniforms.maskTexture.value = this.maskTexture

      // Create custom shader material with mobile optimizations
      const material = new THREE.ShaderMaterial({
        uniforms: this.shaderUniforms,
        vertexShader: liverInscriptionVertexShader,
        fragmentShader: liverInscriptionFragmentShader,
        side: THREE.FrontSide,
        transparent: false,
        // Mobile-specific optimizations
        precision: isMobile ? 'mediump' : 'highp'
      })

      this.onProgress?.(75) // Material created

      // Load the OBJ model with timeout
      const objLoader = new OBJLoader()
      const object = await Promise.race([
        objLoader.loadAsync('/liver-model/Pbr/base.obj'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('OBJ loading timeout')), 30000))
      ]) as THREE.Object3D
      
      this.onProgress?.(90) // Model loaded

      // Apply material to all meshes in the loaded object
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material
          child.castShadow = !isMobile // Disable shadows on mobile for performance
          child.receiveShadow = !isMobile
          child.userData = { type: 'liver' }
          
          // Store reference to the main mesh
          if (!this.mesh) {
            this.mesh = child
          }
        }
      })

      // Scale and position the model appropriately
      object.scale.setScalar(1.0)
      object.position.set(0, 0, 0)
      object.rotation.set(0, 0, 0)

      // Add to scene
      this.scene.add(object)
      this.object = object

      this.onProgress?.(95) // Setup complete
      
      // Start smooth rotation animation (90° to the left)
      this.animateInitialRotation()
      
      // Complete loading after a short delay
      setTimeout(() => {
        this.onProgress?.(100)
        
        // Notify that the model is ready
        if (this.onModelReady) {
          this.onModelReady()
        }
      }, isMobile ? 1000 : 500) // Longer delay on mobile
      
    } catch (error) {
      console.error('Error loading liver model:', error)
      // Don't create fallback - if loading fails, it should fail properly
      throw error
    }
  }

  // Get current position
  getPosition() {
    const target = this.object || this.mesh
    return target ? target.position.clone() : new THREE.Vector3()
  }

  // Set position instantly (no animation)
  setPosition(position: THREE.Vector3) {
    const target = this.object || this.mesh
    if (target) {
      target.position.copy(position)
    }
  }

  // Update material properties
  updateMaterial(properties: any) {
    const target = this.object || this.mesh
    if (target) {
      target.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          Object.assign(child.material, properties)
        }
      })
    }
  }

  // Get the mesh for raycasting
  getMesh() {
    return this.mesh
  }

  // Get the entire object (for complex models with multiple meshes)
  getObject() {
    return this.object || this.mesh
  }

  // New methods for inscription system
  
  // Update shader uniforms (call this in your render loop)
  updateShaderUniforms(time: number) {
    if (this.shaderUniforms) {
      this.shaderUniforms.time.value = time
    }
  }

  // Set hovered inscription for shader highlighting
  setHoveredInscription(inscriptionId: number) {
    console.log(`🔥 Setting hovered inscription: ${inscriptionId}`)
    this.hoveredInscription = inscriptionId
    if (this.shaderUniforms) {
      this.shaderUniforms.hoveredInscription.value = inscriptionId
      console.log(`🔥 Shader uniform updated: hoveredInscription = ${this.shaderUniforms.hoveredInscription.value}`)
    } else {
      console.warn('🔥 No shader uniforms available')
    }
  }

  // Get inscription ID at UV coordinates (for mouse interaction)
  getInscriptionAtUV(u: number, v: number): number {
    if (!this.maskTexture || !this.textureData) {
      return 0
    }
    
    const image = this.maskTexture.image as HTMLImageElement
    const width = image.width
    const height = image.height
    
    // Calculate pixel coordinates from UV (flip V to match shader)
    const x = Math.floor(u * width)
    const y = Math.floor((1 - v) * height)
    
    // Clamp coordinates to valid range
    const clampedX = Math.max(0, Math.min(x, width - 1))
    const clampedY = Math.max(0, Math.min(y, height - 1))
    
    // Calculate index in the cached data array
    const index = (clampedY * width + clampedX) * 4
    
    // Get pixel value from cached data
    return this.textureData[index]
  }

  // Get mask texture for external access
  getMaskTexture() {
    return this.maskTexture
  }

  // Get inscription positions for markers
  getInscriptionPositions(): Map<number, THREE.Vector2> {
    return this.inscriptionPositions || new Map()
  }

  // Set callback for when model is ready
  setOnModelReady(callback: () => void) {
    this.onModelReady = callback
  }

  // Smooth initial rotation and zoom animation (90° left + zoom in)
  animateInitialRotation() {
    const target = this.object || this.mesh
    if (!target) return

    // Animation parameters
    const startRotation = target.rotation.y
    const endRotation = startRotation - Math.PI / 2 // 90° left (negative Y rotation)
    const startScale = 0.3 // Start small/far
    const endScale = 1.0 // End at normal size
    const duration = 2500 // 2.5 seconds for more dramatic effect
    const startTime = Date.now()

    // Set initial state
    target.scale.setScalar(startScale)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Use easing function for smooth animation
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      
      const easedProgress = easeInOutCubic(progress)
      
      // Animate rotation (left turn)
      target.rotation.y = startRotation + (endRotation - startRotation) * easedProgress
      
      // Animate scale (zoom in effect)
      const currentScale = startScale + (endScale - startScale) * easedProgress
      target.scale.setScalar(currentScale)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        console.log('Initial rotation and zoom animation completed')
      }
    }

    animate()
  }

  // Cleanup
  dispose() {
    // Dispose of textures
    if (this.shaderUniforms.diffuseTexture.value) {
      this.shaderUniforms.diffuseTexture.value.dispose()
    }
    if (this.shaderUniforms.maskTexture.value) {
      this.shaderUniforms.maskTexture.value.dispose()
    }
    if (this.maskTexture) {
      this.maskTexture.dispose()
    }
    
    // Dispose of materials
    if (this.mesh && this.mesh.material) {
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(material => material.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }
    
    // Dispose of geometries
    if (this.mesh && this.mesh.geometry) {
      this.mesh.geometry.dispose()
    }
    
    // Remove from scene
    if (this.object) {
      this.scene.remove(this.object)
    }
    if (this.mesh && this.mesh !== this.object) {
      this.scene.remove(this.mesh)
    }
    
    // Clear references
    this.mesh = null
    this.object = null
    this.maskTexture = null
    this.inscriptionPositions.clear()
    
    console.log('LiverModel disposed')
  }

  // Load the existing segmentation map texture
  private loadSegmentationMap(): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader()
      
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Set cross-origin for mobile
      if (isMobile) {
        textureLoader.setCrossOrigin('anonymous')
      }
      
      textureLoader.load(
        '/liver-model/Pbr/segmentation.png',
        (texture) => {
          // Set texture filtering to prevent interpolation
          texture.magFilter = THREE.NearestFilter
          texture.minFilter = THREE.NearestFilter
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.flipY = false
          texture.needsUpdate = true
          
          // Ensure texture is fully loaded before proceeding
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
        undefined,
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Extract inscription positions from the segmentation map texture
  private extractInscriptionPositionsFromTexture(texture: THREE.Texture) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    
    canvas.width = texture.image.width
    canvas.height = texture.image.height
    
    // Draw the texture image to canvas
    ctx.drawImage(texture.image, 0, 0)
    
    // Get image data to analyze pixel values
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Cache the texture data for faster UV sampling
    this.textureData = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i += 4) {
      this.textureData[i] = data[i] // Red channel (grayscale)
    }
    
    this.inscriptionPositions = new Map()
    
    // First, let's see what pixel values exist in the image (using only red channel)
    const uniqueValues = new Set<number>()
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      uniqueValues.add(r)
    }
    
    // Scan the image for each inscription ID (1-40)
    for (let inscriptionId = 1; inscriptionId <= 40; inscriptionId++) {
      let found = false
      let totalX = 0
      let totalY = 0
      let pixelCount = 0
      
      // Scan all pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4
          const r = data[index]
          
          // Use only red channel as grayscale value
          if (r === inscriptionId) {
            found = true
            totalX += x
            totalY += y
            pixelCount++
          }
        }
      }
      
      if (found && pixelCount > 0) {
        // Calculate center position in UV coordinates (flip V for Three.js)
        const centerU = totalX / pixelCount / canvas.width
        const centerV = 1 - (totalY / pixelCount / canvas.height)
        this.inscriptionPositions.set(inscriptionId, new THREE.Vector2(centerU, centerV))
        console.log(`Found inscription ${inscriptionId} at UV: (${centerU.toFixed(3)}, ${centerV.toFixed(3)}) with ${pixelCount} pixels`)
      } else {
        console.warn(`No pixels found for inscription ${inscriptionId}`)
      }
    }
    
    console.log('Extracted inscription positions:', this.inscriptionPositions.size, 'positions')
  }
} 