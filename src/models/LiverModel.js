import * as THREE from 'three'

export class LiverModel {
  constructor(scene) {
    this.scene = scene
    this.mesh = null
    
    this.createLiver()
  }

  // Create the liver geometry and mesh
  createLiver() {
    // Create liver-shaped geometry
    const geometry = this.createLiverGeometry()
    
    // Create aged bronze material with oxidation patches
    const material = this.createAgedBronzeMaterial()
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.userData = { type: 'liver' }
    
    // Add to scene
    this.scene.add(this.mesh)
    
    return this.mesh
  }

  // Create aged bronze material with oxidation effects
  createAgedBronzeMaterial() {
    // Create base bronze texture with oxidation patches
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Fill with base bronze color
    ctx.fillStyle = '#654321' // Darker bronze base
    ctx.fillRect(0, 0, 512, 512)
    
    // Add oxidation patches (green patina)
    this.addOxidationPatches(ctx, canvas.width, canvas.height)
    
    // Add darker weathered areas
    this.addWeatheredAreas(ctx, canvas.width, canvas.height)
    
    // Add subtle bronze highlights
    this.addBronzeHighlights(ctx, canvas.width, canvas.height)
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    
    // Create aged bronze material with reduced reflectivity
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0x5d4037, // Darker bronze base color
      shininess: 8, // Much less reflective (was 60)
      specular: 0x3d2f1f, // Dark brown specular (was golden)
      transparent: false,
      opacity: 1.0
    })
    
    return material
  }

  // Add green oxidation patches (patina)
  addOxidationPatches(ctx, width, height) {
    const patchCount = 25 + Math.random() * 15 // 25-40 patches
    
    for (let i = 0; i < patchCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 15 + Math.random() * 30
      
      // Create gradient for organic oxidation look
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      
      // Various green patina colors
      const patinas = [
        'rgba(58, 100, 65, 0.7)',   // Dark green
        'rgba(78, 120, 85, 0.6)',   // Medium green
        'rgba(95, 140, 105, 0.5)',  // Light green
        'rgba(88, 108, 75, 0.8)',   // Olive green
        'rgba(65, 90, 70, 0.9)'     // Dark olive
      ]
      
      const patinaColor = patinas[Math.floor(Math.random() * patinas.length)]
      
      gradient.addColorStop(0, patinaColor)
      gradient.addColorStop(0.7, patinaColor.replace(/[\d.]+\)$/, '0.3)'))
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Add darker weathered areas
  addWeatheredAreas(ctx, width, height) {
    const weatherCount = 15 + Math.random() * 10 // 15-25 areas
    
    for (let i = 0; i < weatherCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 20 + Math.random() * 40
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(30, 20, 15, 0.6)')
      gradient.addColorStop(0.8, 'rgba(30, 20, 15, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Add subtle bronze highlights in less weathered areas
  addBronzeHighlights(ctx, width, height) {
    const highlightCount = 8 + Math.random() * 6 // 8-14 highlights
    
    for (let i = 0; i < highlightCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 10 + Math.random() * 20
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(139, 101, 65, 0.4)') // Original bronze color
      gradient.addColorStop(0.6, 'rgba(139, 101, 65, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Create optimized liver-shaped geometry
  createLiverGeometry() {
    const geometry = new THREE.SphereGeometry(1, 32, 16)
    const positions = geometry.attributes.position.array
    
    // Optimize: single loop for all vertex modifications
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      
      // Transform to liver shape
      positions[i + 1] = y * 0.3 // Flatten vertically
      positions[i] = x * (1 + z * 0.3) // Make asymmetric
      positions[i + 2] = z * 1.2 // Elongate
    }
    
    // Update geometry
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    return geometry
  }

  // Get current position
  getPosition() {
    return this.mesh ? this.mesh.position.clone() : new THREE.Vector3()
  }

  // Set position instantly (no animation)
  setPosition(position) {
    if (this.mesh) {
      this.mesh.position.copy(position)
    }
  }

  // Update material properties
  updateMaterial(properties) {
    if (this.mesh && this.mesh.material) {
      Object.assign(this.mesh.material, properties)
    }
  }

  // Get the mesh for raycasting
  getMesh() {
    return this.mesh
  }

  // Cleanup
  dispose() {
    if (this.mesh) {
      // Dispose geometry and material
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose()
      }
      if (this.mesh.material) {
        this.mesh.material.dispose()
      }
      
      // Remove from scene
      this.scene.remove(this.mesh)
      this.mesh = null
    }
  }
} 