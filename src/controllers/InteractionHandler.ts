import * as THREE from 'three'

export class InteractionHandler {
  private camera: THREE.Camera
  private renderer: THREE.WebGLRenderer
  private markers: any
  private labels: any
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private onMarkerHover: ((marker: any) => void) | null
  private onMarkerClick: ((marker: any) => void) | null
  private onBackgroundClick: (() => void) | null
  private isDragging: boolean
  private mouseDownPosition: THREE.Vector2
  private mouseDownTime: number
  private dragThreshold: number
  private clickTimeThreshold: number

  constructor(camera: THREE.Camera, renderer: THREE.WebGLRenderer, markers: any, labels: any = null) {
    this.camera = camera
    this.renderer = renderer
    this.markers = markers
    this.labels = labels
    
    // Raycasting setup
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    
    // Event handlers
    this.onMarkerHover = null
    this.onMarkerClick = null
    this.onBackgroundClick = null
    
    // Drag detection for proper panning
    this.isDragging = false
    this.mouseDownPosition = new THREE.Vector2()
    this.mouseDownTime = 0
    this.dragThreshold = 5 // pixels
    this.clickTimeThreshold = 300 // milliseconds
    
    // Bind methods for performance
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleClick = this.handleClick.bind(this)
    
    // Add event listeners
    this.addEventListeners()
  }

  // Add event listeners to the renderer
  addEventListeners() {
    const canvas = this.renderer.domElement
    canvas.addEventListener('mousemove', this.handleMouseMove, { passive: true })
    canvas.addEventListener('mousedown', this.handleMouseDown)
    canvas.addEventListener('mouseup', this.handleMouseUp)
    canvas.addEventListener('click', this.handleClick)
  }

  // Remove event listeners
  removeEventListeners() {
    const canvas = this.renderer.domElement
    canvas.removeEventListener('mousemove', this.handleMouseMove)
    canvas.removeEventListener('mousedown', this.handleMouseDown)
    canvas.removeEventListener('mouseup', this.handleMouseUp)
    canvas.removeEventListener('click', this.handleClick)
  }

  // Update mouse coordinates from event
  updateMouseCoordinates(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  // Handle mouse down (start of potential drag)
  handleMouseDown(event: MouseEvent) {
    this.updateMouseCoordinates(event)
    this.mouseDownPosition.copy(this.mouse)
    this.mouseDownTime = performance.now()
    this.isDragging = false
  }

  // Handle mouse up (end of potential drag)
  handleMouseUp(event: MouseEvent) {
    this.updateMouseCoordinates(event)
    
    // Calculate if this was a drag gesture
    const distance = this.mouse.distanceTo(this.mouseDownPosition) * 
                    Math.max(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight) / 2
    const timeElapsed = performance.now() - this.mouseDownTime
    
    if (distance > this.dragThreshold || timeElapsed > this.clickTimeThreshold) {
      this.isDragging = true
    }
  }

  // Perform raycasting and get intersected objects
  getIntersectedObjects() {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    // Combine markers and labels for raycasting
    const objects = []
    
    if (this.markers) {
      objects.push(...this.markers.getMarkersForRaycasting())
    }
    
    if (this.labels) {
      objects.push(...this.labels.getLabelsForRaycasting())
    }
    
    const intersects = this.raycaster.intersectObjects(objects)
    
    if (intersects.length > 0) {
      const intersection = intersects[0]
      const object = intersection.object
      
      // Check if it's a marker or label
      if (object.userData.type === 'deity-marker') {
        return { type: 'marker', object: this.markers.getMarkerFromIntersection(intersection) }
      } else if (object.userData.type === 'deity-label') {
        return { type: 'label', object: this.labels.getLabelFromIntersection(intersection) }
      }
    }
    
    return null
  }

  // Perform raycasting against liver mesh for texture atlas interaction
  getLiverIntersection(liverMesh) {
    if (!liverMesh) return null
    
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObject(liverMesh)
    
    if (intersects.length > 0) {
      const intersection = intersects[0]
      return {
        point: intersection.point,
        uv: intersection.uv,
        face: intersection.face,
        object: intersection.object
      }
    }
    
    return null
  }

  // Handle mouse movement (only hover effects, no drag interference)
  handleMouseMove(event) {
    this.updateMouseCoordinates(event)
    
    // Only process hover effects if we're not in the middle of a drag
    if (!this.isDragging) {
      const intersected = this.getIntersectedObjects()
      
      // Update cursor style only when not dragging
      if (intersected) {
        this.renderer.domElement.style.cursor = 'pointer'
      } else {
        this.renderer.domElement.style.cursor = 'grab'
      }
      
      // Handle marker/label hover
      this.processHoverInteraction(intersected)
    } else {
      // During drag, ensure cursor shows dragging state
      this.renderer.domElement.style.cursor = 'grabbing'
      
      // Reset hover states during drag
      this.resetAllHoverStates()
    }
  }

  // Process hover interactions
  processHoverInteraction(intersected) {
    if (intersected) {
      if (intersected.type === 'marker') {
        // Handle marker hover
        this.markers.onMarkerHover(intersected.object)
        
        // Also reset label hover state
        if (this.labels) {
          this.labels.onLabelHover(null)
        }
        
        // Call external hover handler
        if (this.onMarkerHover) {
          const section = this.markers.getSectionFromMarker(intersected.object)
          this.onMarkerHover(section)
        }
      } else if (intersected.type === 'label') {
        // Handle label hover
        this.labels.onLabelHover(intersected.object)
        
        // Also reset marker hover state
        this.markers.onMarkerHover(null)
        
        // Call external hover handler
        if (this.onMarkerHover) {
          const section = this.labels.getSectionFromLabel(intersected.object)
          this.onMarkerHover(section)
        }
      }
    } else {
      // Reset both marker and label hover states
      this.resetAllHoverStates()
      
      // Call external hover handler with null
      if (this.onMarkerHover) {
        this.onMarkerHover(null)
      }
    }
  }

  // Reset all hover states
  resetAllHoverStates() {
    this.markers.onMarkerHover(null)
    if (this.labels) {
      this.labels.onLabelHover(null)
    }
  }

  // Handle click events (only if not dragging)
  handleClick(event) {
    // Ignore clicks that were part of a drag gesture
    if (this.isDragging) {
      this.isDragging = false // Reset drag state
      return
    }
    
    this.updateMouseCoordinates(event)
    const intersected = this.getIntersectedObjects()
    
    if (intersected) {
      // Marker or label clicked
      let section
      if (intersected.type === 'marker') {
        section = this.markers.getSectionFromMarker(intersected.object)
      } else if (intersected.type === 'label') {
        section = this.labels.getSectionFromLabel(intersected.object)
      }
      
      if (this.onMarkerClick && section) {
        this.onMarkerClick(section)
      }
    } else {
      // Background clicked
      if (this.onBackgroundClick) {
        this.onBackgroundClick()
      }
    }
    
    // Reset drag state
    this.isDragging = false
  }

  // Set callback for marker hover events
  setMarkerHoverCallback(callback) {
    this.onMarkerHover = callback
  }

  // Set callback for marker click events
  setMarkerClickCallback(callback) {
    this.onMarkerClick = callback
  }

  // Set callback for background click events
  setBackgroundClickCallback(callback) {
    this.onBackgroundClick = callback
  }

  // Update markers reference (if markers change)
  updateMarkers(markers) {
    this.markers = markers
  }

  // Update labels reference (if labels change)
  updateLabels(labels) {
    this.labels = labels
  }

  // Enable/disable interactions
  setEnabled(enabled) {
    if (enabled) {
      this.addEventListeners()
    } else {
      this.removeEventListeners()
    }
  }

  // Get current mouse position in normalized device coordinates
  getMousePosition() {
    return this.mouse.clone()
  }

  // Get raycaster for custom raycasting
  getRaycaster() {
    return this.raycaster
  }

  // Manual raycast against specific objects
  raycastAgainst(objects) {
    return this.raycaster.intersectObjects(objects)
  }

  // Cleanup
  dispose() {
    this.removeEventListeners()
    this.onMarkerHover = null
    this.onMarkerClick = null
    this.onBackgroundClick = null
  }
} 