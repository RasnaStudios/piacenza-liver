import * as THREE from 'three'

export class DeityMarkers {
  private scene: THREE.Scene
  private liverInscriptions: any[]
  private liverModel: any
  private markers: THREE.Mesh[] = []
  private hoveredMarker: THREE.Mesh | null = null
  private raycaster = new THREE.Raycaster()

  constructor(scene: THREE.Scene, liverInscriptions: any[], liverModel: any) {
    console.log('DeityMarkers constructor called with:', liverInscriptions.length, 'inscriptions')
    this.scene = scene
    this.liverInscriptions = liverInscriptions
    this.liverModel = liverModel
    this.markers = []
    this.hoveredMarker = null
    
    // Raycaster for surface positioning
    this.raycaster = new THREE.Raycaster()
    
    console.log('Creating markers...')
    this.createMarkers()
    console.log('DeityMarkers constructor completed - markers created but not positioned yet')
  }

  // Create colored area markers using the segmentation texture
  createMarkers() {
    console.log('Creating markers for', this.liverInscriptions.length, 'inscriptions')
    
    this.liverInscriptions.forEach((inscription, index) => {
      console.log(`Creating marker ${index + 1}/${this.liverInscriptions.length} for inscription ${inscription.id}`)
      const marker = this.createColoredAreaMarker(inscription)
      if (marker) {
        this.markers.push(marker)
        console.log(`Successfully created marker for inscription ${inscription.id}`)
      } else {
        console.error(`Failed to create marker for inscription ${inscription.id}`)
      }
    })
    
    console.log('Total markers created:', this.markers.length)
    
    // Don't position markers yet - wait for liver model to be ready
    // this.positionMarkersFromTexture()
    
    return this.markers
  }

  // Create a colored area marker that samples from segmentation texture
  createColoredAreaMarker(inscription: any) {
    // Create a simple point geometry that will be positioned on the liver surface
    const geometry = new THREE.SphereGeometry(0.02, 8, 8) // Small sphere for positioning
    
    // Get color based on inscription group
    const groupColors: { [key: string]: string } = {
      'sky': '#87CEEB',
      'water': '#008B8B', 
      'earth': '#8B4513',
      'pars_familiaris': '#DC143C',
      'gall_bladder': '#2E8B57',
      'central_section': '#FFD700',
      'pars_hostilis': '#8A2BE2',
      'retro': '#808080'
    }
    
    const baseColor = groupColors[inscription.groupId] || '#FFFFFF'
    
    // Create material - invisible by default, only visible on hover
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(baseColor),
      transparent: true,
      opacity: 0.0, // Completely invisible by default
      side: THREE.DoubleSide,
      depthTest: true
    })
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)
    
    // Store inscription data
    mesh.userData = {
      type: 'deity-marker',
      inscription: inscription,
      sectionId: inscription.id,
      originalOpacity: 0.0,
      baseColor: baseColor,
      isHovered: false
    }

    this.scene.add(mesh)
    return mesh
  }

  // Position markers using UV coordinates from texture
  positionMarkersFromTexture() {
    if (!this.liverModel) {
      console.error('No liver model available for positioning')
      return
    }
    
    const liverMesh = this.liverModel.getMesh()
    if (!liverMesh) {
      console.error('No liver mesh available for positioning')
      return
    }
    
    console.log('Liver mesh found:', liverMesh.name, 'geometry:', liverMesh.geometry)
    console.log('Liver mesh has UVs:', !!liverMesh.geometry.attributes.uv)
    console.log('Liver mesh has positions:', !!liverMesh.geometry.attributes.position)
    console.log('Liver mesh has indices:', !!liverMesh.geometry.index)
    
    const inscriptionPositions = this.liverModel.getInscriptionPositions()
    console.log('Inscription positions from segmentation map:', inscriptionPositions.size, 'positions')
    
    // Debug: log all UV positions
    console.log('All UV positions from segmentation map:')
    inscriptionPositions.forEach((uv: THREE.Vector2, id: number) => {
      console.log(`  ID ${id}: UV (${uv.x.toFixed(3)}, ${uv.y.toFixed(3)})`)
    })
    
    this.markers.forEach(marker => {
      const inscriptionId = marker.userData.sectionId
      const uvPosition = inscriptionPositions.get(inscriptionId)
      
      console.log(`Processing marker ${inscriptionId}, UV position:`, uvPosition)
      
      if (uvPosition) {
        // Convert UV coordinates to world position on the liver surface
        const worldPosition = this.uvToWorldPosition(liverMesh, uvPosition)
        console.log(`UV-to-world conversion for marker ${inscriptionId}:`, worldPosition)
        
        if (worldPosition) {
          marker.position.copy(worldPosition)
          
          // Make marker visible but transparent
          marker.visible = true
          
          console.log(`Successfully positioned marker ${inscriptionId} at:`, worldPosition)
        } else {
          console.error(`Failed to convert UV to world position for marker ${inscriptionId}`)
          // Don't use fallback - only use segmentation map positioning
          marker.visible = false
          console.log(`Hiding marker ${inscriptionId} - no valid position from segmentation map`)
        }
      } else {
        console.error(`No UV position found for marker ${inscriptionId}`)
        // Don't use fallback - only use segmentation map positioning
        marker.visible = false
        console.log(`Hiding marker ${inscriptionId} - no UV position in segmentation map`)
      }
    })
    
    // Log summary of positioning results
    const positionedMarkers = this.markers.filter(marker => marker.visible)
    const hiddenMarkers = this.markers.filter(marker => !marker.visible)
    
    console.log(`Marker positioning summary: ${positionedMarkers.length} positioned, ${hiddenMarkers.length} hidden`)
    if (hiddenMarkers.length > 0) {
      console.log('Hidden markers:', hiddenMarkers.map(m => m.userData.sectionId))
    }
    
    console.log('Marker positioning completed using segmentation map only')
  }

  // Update marker visibility
  updateVisibility(camera: THREE.Camera) {
    this.markers.forEach(marker => {
      // Keep consistent size - no distance scaling
      marker.scale.setScalar(1.0)
      
      // Ensure marker is visible (but still transparent unless hovered)
      marker.visible = true
    })
  }

  // Get markers for raycasting
  getMarkersForRaycasting() {
    return this.markers
  }

  // Handle marker hover
  onMarkerHover(marker: THREE.Mesh) {
    if (this.hoveredMarker === marker) return
    
    this.resetHoverState()
    this.hoveredMarker = marker
    this.applyHoverEffect(marker)
  }

  // Apply hover effect - show colored area and inscription number
  applyHoverEffect(marker: THREE.Mesh) {
    if (marker && marker.material) {
      marker.userData.isHovered = true
      
      // Show the marker prominently
      const material = marker.material as THREE.MeshBasicMaterial
      material.opacity = 0.9
      
      // Scale up the marker for better visibility
      marker.scale.setScalar(2.0)
      
      // Create number label if it doesn't exist
      if (!marker.userData.numberLabel) {
        this.createNumberLabel(marker)
      }
      
      // Show the number label
      if (marker.userData.numberLabel) {
        marker.userData.numberLabel.visible = true
      }
    }
  }

  // Create a number label for the inscription
  createNumberLabel(marker: THREE.Mesh) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    canvas.width = 128
    canvas.height = 128
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // Style the number
    context.font = 'bold 48px Arial'
    context.fillStyle = '#FFFFFF'
    context.strokeStyle = '#000000'
    context.lineWidth = 3
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    const number = marker.userData.inscription.id.toString()
    
    // Draw number with outline
    context.strokeText(number, canvas.width / 2, canvas.height / 2)
    context.fillText(number, canvas.width / 2, canvas.height / 2)
    
    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    
    const labelGeometry = new THREE.PlaneGeometry(0.1, 0.1)
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthTest: false
    })
    
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial)
    
    // Position slightly above the marker
    labelMesh.position.copy(marker.position)
    labelMesh.position.y += 0.05
    labelMesh.rotation.copy(marker.rotation)
    
    // Store reference and add to scene
    marker.userData.numberLabel = labelMesh
    labelMesh.visible = false // Hidden by default
    this.scene.add(labelMesh)
  }

  // Reset hover state
  resetHoverState() {
    if (this.hoveredMarker && this.hoveredMarker.material) {
      const marker = this.hoveredMarker
      marker.userData.isHovered = false
      
      // Return to default visibility
      const material = marker.material as THREE.MeshBasicMaterial
      material.opacity = 0.0
      
      // Return to normal size
      marker.scale.setScalar(1.0)
      
      // Hide the number label
      if (marker.userData.numberLabel) {
        marker.userData.numberLabel.visible = false
      }
    }
    
    this.hoveredMarker = null
  }

  // Get marker by section ID
  getMarkerBySection(sectionId: number) {
    return this.markers.find(marker => marker.userData.sectionId === sectionId) || null
  }

  // Get inscription from marker
  getSectionFromMarker(marker: THREE.Mesh | null) {
    return marker?.userData?.inscription
  }

  // Get marker from intersection
  getMarkerFromIntersection(intersection: THREE.Intersection) {
    return intersection.object
  }

  // Dispose of all resources
  dispose() {
    this.resetHoverState()
    
    this.markers.forEach(marker => {
      // Dispose number label if it exists
      if (marker.userData.numberLabel) {
        if (marker.userData.numberLabel.geometry) marker.userData.numberLabel.geometry.dispose()
        if (marker.userData.numberLabel.material) {
          if (marker.userData.numberLabel.material.map) marker.userData.numberLabel.material.map.dispose()
          marker.userData.numberLabel.material.dispose()
        }
        this.scene.remove(marker.userData.numberLabel)
      }
      
      // Dispose marker
      if (marker.geometry) marker.geometry.dispose()
      if (marker.material) {
        const material = marker.material as THREE.MeshBasicMaterial
        material.dispose()
      }
      if (marker.parent) marker.parent.remove(marker)
    })
    
    this.markers = []
  }

  // Get surface normal at UV coordinates
  private getSurfaceNormalAtUV(mesh: THREE.Mesh, uv: THREE.Vector2): THREE.Vector3 | null {
    const geometry = mesh.geometry
    if (!geometry || !geometry.attributes.position || !geometry.attributes.uv || !geometry.attributes.normal) {
      return null
    }
    
    const positions = geometry.attributes.position.array as Float32Array
    const uvs = geometry.attributes.uv.array as Float32Array
    const normals = geometry.attributes.normal.array as Float32Array
    const indices = geometry.index?.array
    
    if (indices) {
      // Indexed geometry - check each triangle
      for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i]
        const i2 = indices[i + 1] 
        const i3 = indices[i + 2]
        
        // Get UV coordinates for this triangle
        const uv1 = new THREE.Vector2(uvs[i1 * 2], uvs[i1 * 2 + 1])
        const uv2 = new THREE.Vector2(uvs[i2 * 2], uvs[i2 * 2 + 1])
        const uv3 = new THREE.Vector2(uvs[i3 * 2], uvs[i3 * 2 + 1])
        
        // Check if our UV point is inside this triangle
        const baryCoords = this.getBarycentricCoordinates(uv, uv1, uv2, uv3)
        
        if (baryCoords && this.isInsideTriangle(baryCoords)) {
          // Interpolate normal using barycentric coordinates
          const normal1 = new THREE.Vector3(normals[i1 * 3], normals[i1 * 3 + 1], normals[i1 * 3 + 2])
          const normal2 = new THREE.Vector3(normals[i2 * 3], normals[i2 * 3 + 1], normals[i2 * 3 + 2])
          const normal3 = new THREE.Vector3(normals[i3 * 3], normals[i3 * 3 + 1], normals[i3 * 3 + 2])
          
          const interpolatedNormal = normal1.clone().multiplyScalar(baryCoords.x)
            .add(normal2.clone().multiplyScalar(baryCoords.y))
            .add(normal3.clone().multiplyScalar(baryCoords.z))
            .normalize()
          
          // Transform to world space
          interpolatedNormal.applyMatrix4(mesh.matrixWorld)
          
          return interpolatedNormal
        }
      }
    }
    
    return null
  }

  // Calculate barycentric coordinates for a point in a triangle
  private getBarycentricCoordinates(
    point: THREE.Vector2, 
    a: THREE.Vector2, 
    b: THREE.Vector2, 
    c: THREE.Vector2
  ): THREE.Vector3 | null {
    const v0 = c.clone().sub(a)
    const v1 = b.clone().sub(a)
    const v2 = point.clone().sub(a)
    
    const dot00 = v0.dot(v0)
    const dot01 = v0.dot(v1)
    const dot02 = v0.dot(v2)
    const dot11 = v1.dot(v1)
    const dot12 = v1.dot(v2)
    
    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
    
    if (!isFinite(invDenom)) return null
    
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom
    const w = 1 - u - v
    
    return new THREE.Vector3(w, v, u) // Note: order is swapped to match triangle vertices
  }

  // Check if barycentric coordinates indicate point is inside triangle
  private isInsideTriangle(baryCoords: THREE.Vector3): boolean {
    return baryCoords.x >= 0 && baryCoords.y >= 0 && baryCoords.z >= 0 &&
           Math.abs(baryCoords.x + baryCoords.y + baryCoords.z - 1) < 0.001
  }

  // Convert UV coordinates to world position on mesh surface
  private uvToWorldPosition(mesh: THREE.Mesh, uv: THREE.Vector2): THREE.Vector3 | null {
    const geometry = mesh.geometry
    if (!geometry || !geometry.attributes.position || !geometry.attributes.uv) {
      console.error('Missing geometry attributes for UV-to-world conversion')
      return null
    }
    
    const positions = geometry.attributes.position.array as Float32Array
    const uvs = geometry.attributes.uv.array as Float32Array
    const indices = geometry.index?.array
    
    console.log(`UV-to-world conversion: positions=${positions.length}, uvs=${uvs.length}, indices=${indices?.length || 'none'}`)
    console.log(`Looking for UV: (${uv.x.toFixed(3)}, ${uv.y.toFixed(3)})`)
    
    let bestMatch: {
      distance: number,
      worldPosition: THREE.Vector3
    } | null = null
    
    if (indices) {
      console.log(`Processing ${indices.length / 3} triangles...`)
      let trianglesChecked = 0
      let minDistance = Infinity
      
      // Indexed geometry - check each triangle
      for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i]
        const i2 = indices[i + 1] 
        const i3 = indices[i + 2]
        
        // Get UV coordinates for this triangle
        const uv1 = new THREE.Vector2(uvs[i1 * 2], uvs[i1 * 2 + 1])
        const uv2 = new THREE.Vector2(uvs[i2 * 2], uvs[i2 * 2 + 1])
        const uv3 = new THREE.Vector2(uvs[i3 * 2], uvs[i3 * 2 + 1])
        
        // Check if our UV point is inside this triangle
        const baryCoords = this.getBarycentricCoordinates(uv, uv1, uv2, uv3)
        
        if (baryCoords && this.isInsideTriangle(baryCoords)) {
          // Point is inside triangle - calculate exact world position using barycentric interpolation
          const pos1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2])
          const pos2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2])
          const pos3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2])
          
          // Interpolate world position using barycentric coordinates
          const worldPos = pos1.clone().multiplyScalar(baryCoords.x)
            .add(pos2.clone().multiplyScalar(baryCoords.y))
            .add(pos3.clone().multiplyScalar(baryCoords.z))
          
          // Transform to world space
          worldPos.applyMatrix4(mesh.matrixWorld)
          
          console.log(`Found exact match in triangle ${i/3}: worldPos=`, worldPos)
          return worldPos
        } else {
          // Point is outside triangle - calculate distance to triangle center
          const triangleCenterUV = uv1.clone().add(uv2).add(uv3).multiplyScalar(1/3)
          const distance = uv.distanceTo(triangleCenterUV)
          
          if (distance < minDistance) {
            minDistance = distance
          }
          
          if (!bestMatch || distance < bestMatch.distance) {
            // Calculate triangle center in world space
            const pos1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2])
            const pos2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2])
            const pos3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2])
            
            const worldPos = pos1.clone().add(pos2).add(pos3).multiplyScalar(1/3)
            worldPos.applyMatrix4(mesh.matrixWorld)
            
            bestMatch = { distance, worldPosition: worldPos }
          }
        }
        
        trianglesChecked++
        if (trianglesChecked % 1000 === 0) {
          console.log(`Checked ${trianglesChecked} triangles, min distance so far: ${minDistance.toFixed(4)}`)
        }
      }
      
      console.log(`Finished checking ${trianglesChecked} triangles. Minimum distance found: ${minDistance.toFixed(4)}`)
      
      if (bestMatch) {
        console.log(`Using best match with distance ${bestMatch.distance.toFixed(4)}: worldPos=`, bestMatch.worldPosition)
      } else {
        console.error('No triangles found - this should not happen')
      }
    } else {
      // Non-indexed geometry - process vertices directly
      console.log(`Processing non-indexed geometry with ${positions.length / 3} vertices...`)
      let minDistance = Infinity
      let closestVertex = 0
      
      // Find the closest vertex by UV distance
      for (let i = 0; i < positions.length / 3; i++) {
        const vertexUV = new THREE.Vector2(uvs[i * 2], uvs[i * 2 + 1])
        const distance = uv.distanceTo(vertexUV)
        
        if (distance < minDistance) {
          minDistance = distance
          closestVertex = i
        }
      }
      
      console.log(`Closest vertex found at index ${closestVertex} with distance ${minDistance.toFixed(4)}`)
      
      if (minDistance < Infinity) {
        // Get the world position of the closest vertex
        const vertexPos = new THREE.Vector3(
          positions[closestVertex * 3],
          positions[closestVertex * 3 + 1],
          positions[closestVertex * 3 + 2]
        )
        
        // Transform to world space
        vertexPos.applyMatrix4(mesh.matrixWorld)
        
        console.log(`Using closest vertex position:`, vertexPos)
        return vertexPos
      } else {
        console.error('No vertices found - this should not happen')
      }
    }
    
    return bestMatch?.worldPosition || null
  }

  // Public method to position markers when liver model is ready
  positionMarkersWhenReady() {
    console.log('Attempting to position markers...')
    if (!this.liverModel) {
      console.error('No liver model available for positioning')
      return
    }
    
    const liverMesh = this.liverModel.getMesh()
    if (!liverMesh) {
      console.error('No liver mesh available for positioning - will retry later')
      // Retry after a short delay
      setTimeout(() => {
        this.positionMarkersWhenReady()
      }, 100)
      return
    }
    
    console.log('Liver mesh is ready, positioning markers...')
    this.positionMarkersFromTexture()
  }
} 