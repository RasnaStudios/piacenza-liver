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
    
    // Create liver material
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x8b6541,
      shininess: 30,
      transparent: false,
      opacity: 1.0
    })
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.userData = { type: 'liver' }
    
    // Add to scene
    this.scene.add(this.mesh)
    
    return this.mesh
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