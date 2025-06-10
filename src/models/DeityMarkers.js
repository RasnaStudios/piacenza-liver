import * as THREE from 'three'

export class DeityMarkers {
  constructor(scene, liverInscriptions, liverModel) {
    this.scene = scene
    this.liverInscriptions = liverInscriptions
    this.liverModel = liverModel
    this.markers = []
    this.hoveredMarker = null
    
    // Raycaster for surface positioning
    this.raycaster = new THREE.Raycaster()
    
    this.createMarkers()
  }

  // Create simple text markers using plane geometry
  createMarkers() {
    this.liverInscriptions.forEach((inscription) => {
      const marker = this.createTextPlane(inscription)
      if (marker) {
        this.markers.push(marker)
      }
    })
    
    // Position markers on liver surface
    this.positionMarkersOnSurface()
    
    return this.markers
  }

  // Create a text plane marker
  createTextPlane(inscription) {
    // Create canvas for text texture
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    // Canvas size
    canvas.width = 256
    canvas.height = 64
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // Style the text with authentic Etruscan font
    context.font = 'bold 32px "Noto Sans Old Italic", "Aegean", serif'
    context.fillStyle = '#d4af37' // Golden color
    context.strokeStyle = '#8b6541' // Darker outline
    context.lineWidth = 2
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.direction = 'rtl' // Right-to-left text direction
    
    // Use the Etruscan text directly from the inscription
    const text = inscription.etruscanText
    
    // Draw text
    context.strokeText(text, canvas.width / 2, canvas.height / 2)
    context.fillText(text, canvas.width / 2, canvas.height / 2)
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(0.3, 0.08)
    
    // Create material with enhanced lighting response
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      // Add subtle emission for glow effect under spotlight
      emissive: 0x332211,
      emissiveIntensity: 0.1
    })
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)
    
    // Store inscription data
    mesh.userData = {
      type: 'deity-marker', // Important for interaction detection
      inscription: inscription,
      sectionId: inscription.id,
      originalOpacity: 0.9,
      surfaceNormal: null,
      surfacePoint: null,
      isUnderside: false,
      isHovered: false,
      canvas: canvas,
      context: context,
      texture: texture
    }

    this.scene.add(mesh)
    return mesh
  }

  // Position text planes on liver surface
  positionMarkersOnSurface() {
    if (!this.liverModel || !this.liverModel.getMesh()) {
      console.log("No liver model available for positioning")
      return
    }

    const liverMesh = this.liverModel.getMesh()
    
    this.markers.forEach((marker, index) => {
      const inscription = this.liverInscriptions[index]
      
      // Determine if this inscription should be on the bottom (retro group)
      const isUnderside = inscription.groupId === 'retro'
      
      let rayOrigin, rayDirection
      
      if (isUnderside) {
        // For underside inscriptions - raycast from below to find bottom surface
        rayOrigin = inscription.position.clone()
        rayOrigin.y = -2 // Start from below the liver
        rayDirection = new THREE.Vector3(0, 1, 0) // Raycast upward
        
        this.raycaster.set(rayOrigin, rayDirection)
        const intersects = this.raycaster.intersectObject(liverMesh)
        
        if (intersects.length > 0) {
          const intersection = intersects[0] // Bottom surface
          const surfacePoint = intersection.point.clone()
          const surfaceNormal = intersection.face.normal.clone()
          
          // Position further below surface (so text is visible)
          surfacePoint.add(surfaceNormal.multiplyScalar(0.02))
          marker.position.copy(surfacePoint)
          
          // Orient to face outward from bottom surface (downward)
          marker.lookAt(surfacePoint.clone().add(surfaceNormal))
          
          marker.userData.surfaceNormal = surfaceNormal
          marker.userData.surfacePoint = surfacePoint
          marker.userData.isUnderside = true
          
          console.log(`Positioned ${inscription.etruscanText} on bottom surface at:`, surfacePoint)
        } else {
          // Fallback positioning below liver
          const basePosition = inscription.position.clone()
          basePosition.y = -0.25
          marker.position.copy(basePosition)
          marker.rotation.x = Math.PI
          
          marker.userData.isUnderside = true
          marker.userData.surfacePoint = basePosition
          
          console.log(`Fallback positioned ${inscription.etruscanText} below liver at:`, basePosition)
        }
      } else {
        // For top surface inscriptions
        rayOrigin = inscription.position.clone()
        rayOrigin.y += 2
        rayDirection = new THREE.Vector3(0, -1, 0)
        
        this.raycaster.set(rayOrigin, rayDirection)
        const intersects = this.raycaster.intersectObject(liverMesh)
        
        if (intersects.length > 0) {
          const intersection = intersects[0] // Top surface
          const surfacePoint = intersection.point.clone()
          const surfaceNormal = intersection.face.normal.clone()
          
          // Position slightly above surface
          surfacePoint.add(surfaceNormal.multiplyScalar(0.01))
          marker.position.copy(surfacePoint)
          
          // Orient to face outward from surface
          marker.lookAt(surfacePoint.clone().add(surfaceNormal))
          
          marker.userData.surfaceNormal = surfaceNormal
          marker.userData.surfacePoint = surfacePoint
          marker.userData.isUnderside = false
        } else {
          // Fallback positioning
          marker.position.copy(inscription.position)
        }
      }
      
      console.log(`Positioned ${inscription.etruscanText} at:`, marker.position)
    })
  }

  // Update marker visibility
  updateVisibility(camera) {
    this.markers.forEach(marker => {
      // Keep consistent size - no distance scaling
      marker.scale.setScalar(1.0)
      
      // Ensure marker is visible
      marker.visible = true
    })
  }

  // Get markers for raycasting
  getMarkersForRaycasting() {
    return this.markers
  }

  // Handle marker hover
  onMarkerHover(marker) {
    if (this.hoveredMarker === marker) return
    
    this.resetHoverState()
    this.hoveredMarker = marker
    this.applyHoverEffect(marker)
  }

  // Apply hover effect
  applyHoverEffect(marker) {
    if (marker && marker.material) {
      marker.userData.isHovered = true
      
      // Redraw text with brighter color
      const context = marker.userData.context
      const canvas = marker.userData.canvas
      const inscription = marker.userData.inscription
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.font = 'bold 32px "Noto Sans Old Italic", "Aegean", serif'
      context.fillStyle = '#ffd700' // Brighter gold
      context.strokeStyle = '#b8860b' // Darker gold outline
      context.lineWidth = 2
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.direction = 'rtl' // Right-to-left text direction
      
      const text = inscription.etruscanText
      context.strokeText(text, canvas.width / 2, canvas.height / 2)
      context.fillText(text, canvas.width / 2, canvas.height / 2)
      
      marker.userData.texture.needsUpdate = true
    }
  }

  // Reset hover state
  resetHoverState() {
    if (this.hoveredMarker && this.hoveredMarker.material) {
      const marker = this.hoveredMarker
      marker.userData.isHovered = false
      
      // Redraw text with normal color
      const context = marker.userData.context
      const canvas = marker.userData.canvas
      const inscription = marker.userData.inscription
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.font = 'bold 32px "Noto Sans Old Italic", "Aegean", serif'
      context.fillStyle = '#d4af37' // Normal gold
      context.strokeStyle = '#8b6541' // Normal outline
      context.lineWidth = 2
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.direction = 'rtl' // Right-to-left text direction
      
      const text = inscription.etruscanText
      context.strokeText(text, canvas.width / 2, canvas.height / 2)
      context.fillText(text, canvas.width / 2, canvas.height / 2)
      
      marker.userData.texture.needsUpdate = true
    }
    this.hoveredMarker = null
  }

  // Get marker by section ID
  getMarkerBySection(sectionId) {
    return this.markers.find(marker => marker.userData.sectionId === sectionId)
  }

  // Get inscription from marker
  getSectionFromMarker(marker) {
    return marker?.userData?.inscription
  }

  // Get marker from intersection
  getMarkerFromIntersection(intersection) {
    return intersection.object
  }

  // Dispose of all resources
  dispose() {
    this.resetHoverState()
    
    this.markers.forEach(marker => {
      if (marker.geometry) marker.geometry.dispose()
      if (marker.material) {
        if (marker.material.map) marker.material.map.dispose()
        marker.material.dispose()
      }
      if (marker.parent) marker.parent.remove(marker)
    })
    
    this.markers = []
  }
} 