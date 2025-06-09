import * as THREE from 'three'

export class DeityMarkers {
  constructor(scene, liverSections, liverModel) {
    this.scene = scene
    this.liverSections = liverSections
    this.liverModel = liverModel
    this.markers = []
    this.hoveredMarker = null
    
    // Raycaster for surface positioning
    this.raycaster = new THREE.Raycaster()
    
    this.createMarkers()
  }

  // Create simple text markers using plane geometry
  createMarkers() {
    this.liverSections.forEach((section) => {
      const marker = this.createTextPlane(section)
      if (marker) {
        this.markers.push(marker)
      }
    })
    
    // Position markers on liver surface
    this.positionMarkersOnSurface()
    
    return this.markers
  }

  // Create a text plane marker
  createTextPlane(section) {
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
    
    // Process text
    const text = this.processEtruscanText(section.name)
    
    // Draw text
    context.strokeText(text, canvas.width / 2, canvas.height / 2)
    context.fillText(text, canvas.width / 2, canvas.height / 2)
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(0.3, 0.08)
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    })
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)
    
    // Store section data
    mesh.userData = {
      type: 'deity-marker', // Important for interaction detection
      section: section,
      sectionId: section.id,
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
      const section = this.liverSections[index]
      
      // Determine if this inscription should be on the bottom
      const isUnderside = section.name === 'usils' || section.name === 'tivs'
      
      let rayOrigin, rayDirection
      
      if (isUnderside) {
        // For underside inscriptions - raycast from below to find bottom surface
        rayOrigin = section.position.clone()
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
          
          console.log(`Positioned ${section.name} on bottom surface at:`, surfacePoint)
        } else {
          // Fallback positioning below liver
          const basePosition = section.position.clone()
          basePosition.y = -0.25
          marker.position.copy(basePosition)
          marker.rotation.x = Math.PI
          
          marker.userData.isUnderside = true
          marker.userData.surfacePoint = basePosition
          
          console.log(`Fallback positioned ${section.name} below liver at:`, basePosition)
        }
      } else {
        // For top surface inscriptions
        rayOrigin = section.position.clone()
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
          marker.position.copy(section.position)
        }
      }
      
      console.log(`Positioned ${section.name} at:`, marker.position)
    })
  }

  // Map modern names to authentic Etruscan inscriptions (right-to-left)
  getEtruscanInscription(modernName) {
    const etruscanMap = {
      'tin/cil/en': '𐌍𐌄𐌋𐌉𐌂 / 𐌍𐌉𐌕', // reversed
      'tin/θvf': '𐌅𐌖𐌚 / 𐌍𐌉𐌕', // reversed
      'tins/θne': '𐌄𐌍𐌚 / 𐌔𐌍𐌉𐌕', // reversed
      'uni/mae': '𐌄𐌀𐌌 / 𐌉𐌍𐌖', // reversed
      'tec/vm': '𐌌𐌖 / 𐌂𐌄𐌕', // reversed
      'lvsl': '𐌋𐌔𐌖𐌋', // reversed
      'neθ': '𐌚𐌄𐌍', // reversed
      'caθ': '𐌚𐌀𐌂', // reversed
      'fuflu/ns': '𐌔𐌍 / 𐌖𐌋𐌅𐌖𐌅', // reversed
      'selva': '𐌀𐌅𐌋𐌄𐌔', // reversed
      'leθns': '𐌔𐌍𐌚𐌄𐌋', // reversed
      'tluscv': '𐌖𐌂𐌔𐌖𐌋𐌕', // reversed
      'cels': '𐌔𐌋𐌄𐌂', // reversed
      'cvlalp': '𐌐𐌋𐌀𐌋𐌖𐌂', // reversed
      'vetisl': '𐌋𐌔𐌉𐌕𐌄𐌅', // reversed
      'cilensl': '𐌋𐌔𐌍𐌄𐌋𐌉𐌂', // reversed
      'pul': '𐌋𐌖𐌐', // reversed
      'leθn': '𐌍𐌚𐌄𐌋', // reversed
      'la/sl': '𐌋𐌔 / 𐌀𐌋', // reversed
      'tins/θvf': '𐌅𐌖𐌚 / 𐌔𐌍𐌉𐌕', // reversed
      'θufl/θas': '𐌔𐌀𐌚 / 𐌋𐌅𐌖𐌚', // reversed
      'tinsθ/neθ': '𐌚𐌄𐌍 / 𐌚𐌔𐌍𐌉𐌕', // reversed
      'caθa': '𐌀𐌚𐌀𐌂', // reversed
      'fuf/lus': '𐌔𐌖𐌋 / 𐌋𐌅𐌖𐌅', // reversed
      'tvnθ': '𐌚𐌍𐌖𐌕', // reversed
      'marisl/laθ': '𐌚𐌀𐌋 / 𐌋𐌔𐌉𐌓𐌀𐌌', // reversed
      'leta': '𐌀𐌕𐌄𐌋', // reversed
      'neθ': '𐌚𐌄𐌍', // reversed
      'herc': '𐌂𐌓𐌄𐌇', // reversed
      'mar': '𐌓𐌀𐌌', // reversed
      'selva': '𐌀𐌅𐌋𐌄𐌔', // reversed
      'leθa': '𐌀𐌚𐌄𐌋', // reversed
      'tlusc': '𐌂𐌔𐌖𐌋𐌕', // reversed
      'lvsl/velϰ': '𐌒𐌋𐌄𐌅 / 𐌋𐌔𐌖𐌋', // reversed
      'satr/es': '𐌔𐌄 / 𐌓𐌕𐌀𐌔', // reversed
      'cilen': '𐌍𐌄𐌋𐌉𐌂', // reversed
      'leθam': '𐌌𐌀𐌚𐌄𐌋', // reversed
      'metlvmθ': '𐌚𐌌𐌖𐌋𐌕𐌄𐌌', // reversed
      'mar': '𐌓𐌀𐌌', // reversed
      'tlusc': '𐌂𐌔𐌖𐌋𐌕', // reversed
      'tivs': '𐌔𐌅𐌉𐌕', // reversed
      'usils': '𐌔𐌋𐌉𐌔𐌖' // reversed
    }
    
    return etruscanMap[modernName] || modernName
  }

  // Process Etruscan text
  processEtruscanText(text) {
    if (!text) return ''
    return this.getEtruscanInscription(text)
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
      const section = marker.userData.section
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.font = 'bold 32px "Noto Sans Old Italic", "Aegean", serif'
      context.fillStyle = '#ffd700' // Brighter gold
      context.strokeStyle = '#b8860b' // Darker gold outline
      context.lineWidth = 2
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.direction = 'rtl' // Right-to-left text direction
      
      const text = this.processEtruscanText(section.name)
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
      const section = marker.userData.section
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.font = 'bold 32px "Noto Sans Old Italic", "Aegean", serif'
      context.fillStyle = '#d4af37' // Normal gold
      context.strokeStyle = '#8b6541' // Normal outline
      context.lineWidth = 2
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.direction = 'rtl' // Right-to-left text direction
      
      const text = this.processEtruscanText(section.name)
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

  // Get section from marker
  getSectionFromMarker(marker) {
    return marker?.userData?.section
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
      this.scene.remove(marker)
    })
    
    this.markers = []
  }
} 