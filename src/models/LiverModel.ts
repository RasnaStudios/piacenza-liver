import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

export class LiverModel {
  private scene: THREE.Scene
  private mesh: THREE.Mesh | null = null
  private object: THREE.Object3D | null = null
  private onProgress?: (progress: number) => void

  constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
    this.scene = scene
    this.onProgress = onProgress
    
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

      this.onProgress?.(60) // Textures configured

      // Create PBR material with bronze properties
      const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        normalMap: normalTexture,
        metalnessMap: metallicTexture,
        roughnessMap: roughnessTexture,
        
        // Fine-tune bronze material properties
        metalness: 0.8, // High metalness for bronze
        roughness: 0.4, // Moderate roughness for aged bronze
        normalScale: new THREE.Vector2(1.0, 1.0), // Normal map intensity
        
        // Enhanced bronze color tinting
        color: new THREE.Color(0x8b6f47), // Warm bronze color
        
        // Enable shadows
        transparent: false,
        opacity: 1.0,
      })

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
          
          console.log('Applied PBR material to mesh:', child.name || 'unnamed')
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
    const target = this.object || this.mesh
    if (target) {
      // Dispose geometry and materials
      target.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose()
          }
          if (child.material) {
            // Handle both single materials and material arrays
            if (Array.isArray(child.material)) {
              child.material.forEach((material: any) => {
                if (material.map) material.map.dispose()
                if (material.normalMap) material.normalMap.dispose()
                if (material.metalnessMap) material.metalnessMap.dispose()
                if (material.roughnessMap) material.roughnessMap.dispose()
                material.dispose()
              })
            } else {
              const material = child.material as any
              if (material.map) material.map.dispose()
              if (material.normalMap) material.normalMap.dispose()
              if (material.metalnessMap) material.metalnessMap.dispose()
              if (material.roughnessMap) material.roughnessMap.dispose()
              material.dispose()
            }
          }
        }
      })
      
      // Remove from scene
      this.scene.remove(target)
      this.mesh = null
      this.object = null
    }
  }
} 