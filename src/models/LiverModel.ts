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
  private shaderUniforms: LiverShaderUniforms
  private maskTexture: THREE.Texture | null = null
  private inscriptionPositions: Map<number, THREE.Vector2> = new Map()
  private hoveredInscription: number = 0
  private onModelReady?: () => void

  constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
    this.scene = scene
    this.onProgress = onProgress
    
    // Initialize shader uniforms
    this.shaderUniforms = {
      time: { value: 0.0 },
      diffuseTexture: { value: null },
      maskTexture: { value: null },
      hoveredInscription: { value: 0 }
    }
    
    this.loadLiverModel()
  }

  // Load the OBJ model with PBR textures
  async loadLiverModel() {
    try {
      // Report initial progress
      this.onProgress?.(10)

      // Load all textures in parallel
      const textureLoader = new THREE.TextureLoader()
      const textures = await Promise.all([
        textureLoader.loadAsync('/liver-model/Pbr/texture_diffuse.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_normal.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_metallic.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_roughness.png')
      ])
      
      console.log('Textures loaded:', textures.map(t => ({ width: t.image.width, height: t.image.height })))

      this.onProgress?.(40) // Textures loaded

      const [diffuseTexture, normalTexture, metallicTexture, roughnessTexture] = textures

      // Configure texture settings for better quality
      textures.forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.flipY = true // Try standard Y-flip for OBJ textures
        texture.generateMipmaps = true
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
      })

      // Load the segmentation map texture
      this.maskTexture = await this.loadSegmentationMap()
      // inscriptionPositions is populated by loadSegmentationMap()

      this.onProgress?.(60) // Textures configured

      // Set up shader uniforms
      this.shaderUniforms.diffuseTexture.value = diffuseTexture
      this.shaderUniforms.maskTexture.value = this.maskTexture

      // Create custom shader material instead of MeshStandardMaterial
      const material = new THREE.ShaderMaterial({
        uniforms: this.shaderUniforms,
        vertexShader: liverInscriptionVertexShader,
        fragmentShader: liverInscriptionFragmentShader,
        side: THREE.FrontSide,
        transparent: false,
      })
      
      console.log('🔥 Shader material created:', material)
      console.log('🔥 Shader uniforms:', this.shaderUniforms)
      console.log('🔥 Vertex shader length:', liverInscriptionVertexShader.length)
      console.log('🔥 Fragment shader length:', liverInscriptionFragmentShader.length)

      this.onProgress?.(75) // Material created

      // Load the OBJ model
      const objLoader = new OBJLoader()
      const object = await objLoader.loadAsync('/liver-model/Pbr/base.obj')
      
      this.onProgress?.(90) // Model loaded
      
      console.log('OBJ loaded, traversing children...')
      console.log('Object children count:', object.children.length)

      // Apply material to all meshes in the loaded object
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material
          child.castShadow = true
          child.receiveShadow = true
          child.userData = { type: 'liver' }
          
          // Store reference to the main mesh
          if (!this.mesh) {
            this.mesh = child
          }
          
          console.log('Applied inscription shader material to mesh:', child.name || 'unnamed')
        }
      })

      // Scale and position the model appropriately
      object.scale.setScalar(1.0) // Adjust scale as needed
      object.position.set(0, 0, 0)
      object.rotation.set(0, 0, 0)

      // Add to scene
      this.scene.add(object)
      this.object = object // Store reference to the entire object

      console.log('PBR Liver model loaded successfully')
      
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
      }, 500)
      
    } catch (error) {
      console.error('Error loading liver model:', error)
      
      // Fallback: create a simple geometry if model loading fails
      this.createFallbackLiver()
    }
  }

  // Fallback method if OBJ loading fails
  createFallbackLiver() {
    console.log('Using fallback liver geometry')
    
    // Create simple liver-shaped geometry
    const geometry = new THREE.SphereGeometry(1, 32, 16)
    const positions = geometry.attributes.position.array
    
    // Transform to liver shape
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      
      positions[i + 1] = y * 0.3 // Flatten vertically
      positions[i] = x * (1 + z * 0.3) // Make asymmetric
      positions[i + 2] = z * 1.2 // Elongate
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    // Create simple bronze material
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      metalness: 0.8,
      roughness: 0.4
    })
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.userData = { type: 'liver' }
    
    // Add to scene
    this.scene.add(this.mesh)
    this.object = this.mesh
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
    if (!this.maskTexture) return 0
    
    // Create a temporary canvas to sample the texture
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    
    canvas.width = this.maskTexture.image.width
    canvas.height = this.maskTexture.image.height
    
    // Draw the texture to canvas
    ctx.drawImage(this.maskTexture.image, 0, 0)
    
    // Sample the pixel at the UV coordinates (flip V to match shader)
    const x = Math.floor(u * canvas.width)
    const y = Math.floor((1 - v) * canvas.height) // Flip V to match shader
    
    // Clamp coordinates to valid range
    const clampedX = Math.max(0, Math.min(x, canvas.width - 1))
    const clampedY = Math.max(0, Math.min(y, canvas.height - 1))
    
    // Get pixel data
    const imageData = ctx.getImageData(clampedX, clampedY, 1, 1)
    const pixelValue = imageData.data[0] // Red channel (grayscale)
    
    console.log(`Sampled UV (${u.toFixed(3)}, ${v.toFixed(3)}) -> pixel (${clampedX}, ${clampedY}) -> value ${pixelValue}`)
    
    return pixelValue
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
    console.log('Starting to load segmentation map...')
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader()
      textureLoader.load(
        '/liver-model/Pbr/segmentation.png',
        (texture) => {
          console.log('Segmentation map loaded successfully:', texture.image.width, 'x', texture.image.height)
          console.log('Segmentation map image type:', texture.image.constructor.name)
          console.log('Segmentation map has data:', !!texture.image.data)
          
          // Set texture filtering to prevent interpolation
          texture.magFilter = THREE.NearestFilter
          texture.minFilter = THREE.NearestFilter
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.flipY = false
          texture.needsUpdate = true
          
          // Extract inscription positions from the segmentation map
          this.extractInscriptionPositionsFromTexture(texture)
          
          console.log('Loaded segmentation map texture:', texture.image.width, 'x', texture.image.height)
          resolve(texture)
        },
        (progress) => {
          console.log('Loading segmentation map progress:', progress)
        },
        (error) => {
          console.error('Failed to load segmentation map:', error)
          reject(error)
        }
      )
    })
  }

  // Extract inscription positions from the segmentation map texture
  private extractInscriptionPositionsFromTexture(texture: THREE.Texture) {
    console.log('Extracting inscription positions from texture...')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }
    
    canvas.width = texture.image.width
    canvas.height = texture.image.height
    console.log('Canvas size:', canvas.width, 'x', canvas.height)
    
    // Draw the texture image to canvas
    ctx.drawImage(texture.image, 0, 0)
    
    // Get image data to analyze pixel values
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    console.log('Image data size:', data.length, 'pixels')
    
    this.inscriptionPositions = new Map()
    
    // First, let's see what pixel values exist in the image (using only red channel)
    const uniqueValues = new Set<number>()
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      uniqueValues.add(r)
    }
    console.log('Unique red channel values found:', Array.from(uniqueValues).sort((a, b) => a - b))
    
    // Also check a few sample pixels to see the actual data
    console.log('Sample pixels from segmentation map (red channel only):')
    for (let y = 0; y < Math.min(10, canvas.height); y += 2) {
      for (let x = 0; x < Math.min(10, canvas.width); x += 2) {
        const index = (y * canvas.width + x) * 4
        const r = data[index]
        console.log(`  Pixel (${x}, ${y}): Red=${r}`)
      }
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