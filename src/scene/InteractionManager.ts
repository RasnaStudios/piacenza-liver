import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface InteractionCallbacks {
  onInscriptionClick: (inscriptionId: number, clickedUV: THREE.Vector2) => void
  onBackgroundClick: () => void
  onMarkerHover: (section: any) => void
  onInteractionStart: () => void
  onInteractionEnd: () => void
}

export class InteractionManager {
  private renderer: THREE.WebGLRenderer
  private camera: THREE.Camera
  private controls: OrbitControls
  private liverModel: any
  private liverInscriptions: any[]
  private callbacks: InteractionCallbacks
  
  private isPanningOrRotating = false
  private mouseDownPosition: { x: number, y: number } | null = null
  private mouseMovedDuringClick = false
  
  // Model rotation state
  private isRotatingModel = false
  private isShiftPressed = false
  private lastMousePosition = { x: 0, y: 0 }
  
  private boundHandleMouseMove: (event: MouseEvent) => void
  private boundHandleClick: (event: MouseEvent) => void
  private boundHandleMouseDown: (event: MouseEvent) => void
  private boundHandleMouseUp: (event: MouseEvent) => void
  private boundHandleKeyDown: (event: KeyboardEvent) => void
  private boundHandleKeyUp: (event: KeyboardEvent) => void
  private boundHandleControlsStart: () => void
  private boundHandleControlsEnd: () => void

  constructor(
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    controls: OrbitControls,
    liverModel: any,
    liverInscriptions: any[],
    callbacks: InteractionCallbacks
  ) {
    this.renderer = renderer
    this.camera = camera
    this.controls = controls
    this.liverModel = liverModel
    this.liverInscriptions = liverInscriptions
    this.callbacks = callbacks
    
    this.boundHandleMouseMove = this.handleMouseMove.bind(this)
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleMouseDown = this.handleMouseDown.bind(this)
    this.boundHandleMouseUp = this.handleMouseUp.bind(this)
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleKeyUp = this.handleKeyUp.bind(this)
    this.boundHandleControlsStart = this.handleControlsStart.bind(this)
    this.boundHandleControlsEnd = this.handleControlsEnd.bind(this)
    
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.renderer.domElement.addEventListener('mousemove', this.boundHandleMouseMove)
    this.renderer.domElement.addEventListener('click', this.boundHandleClick)
    this.renderer.domElement.addEventListener('mousedown', this.boundHandleMouseDown)
    this.renderer.domElement.addEventListener('mouseup', this.boundHandleMouseUp)
    
    // Keyboard events for Shift detection
    window.addEventListener('keydown', this.boundHandleKeyDown)
    window.addEventListener('keyup', this.boundHandleKeyUp)
    
    this.controls.addEventListener('start', this.boundHandleControlsStart)
    this.controls.addEventListener('end', this.boundHandleControlsEnd)
    
    console.log('🎮 Model Rotation Controls Active:')
    console.log('  Hold SHIFT + drag mouse to rotate the liver model')
    console.log('  R key: Log current rotation values')
  }

  private handleMouseDown(event: MouseEvent) {
    this.mouseDownPosition = { x: event.clientX, y: event.clientY }
    this.mouseMovedDuringClick = false
    this.lastMousePosition = { x: event.clientX, y: event.clientY }
    
    // Check if Shift is pressed for model rotation
    if (this.isShiftPressed) {
      this.isRotatingModel = true
      this.controls.enabled = false // Disable camera controls
      event.preventDefault()
    }
  }
  
  private handleMouseUp(_event: MouseEvent) {
    if (this.isRotatingModel) {
      this.isRotatingModel = false
      this.controls.enabled = true // Re-enable camera controls
    }
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      this.isShiftPressed = true
    } else if (event.code === 'KeyR') {
      this.logCurrentRotation()
    }
  }
  
  private handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      this.isShiftPressed = false
      if (this.isRotatingModel) {
        this.isRotatingModel = false
        this.controls.enabled = true
      }
    }
  }
  
  private logCurrentRotation() {
    const liverObject = this.liverModel.getObject()
    if (liverObject) {
      const r = liverObject.rotation
      console.log('📍 Current Liver Model Rotation:')
      console.log(`  object.rotation.set(${r.x.toFixed(3)}, ${r.y.toFixed(3)}, ${r.z.toFixed(3)})`)
      console.log(`  Degrees: X=${(r.x * 180/Math.PI).toFixed(1)}° Y=${(r.y * 180/Math.PI).toFixed(1)}° Z=${(r.z * 180/Math.PI).toFixed(1)}°`)
    }
  }

  private handleMouseMove(event: MouseEvent) {
    // Handle model rotation when Shift+drag is active
    if (this.isRotatingModel && this.isShiftPressed) {
      const deltaX = event.clientX - this.lastMousePosition.x
      const deltaY = event.clientY - this.lastMousePosition.y
      
      const liverObject = this.liverModel.getObject()
      if (liverObject) {
        // Rotation sensitivity
        const rotationSpeed = 0.01
        
        // Apply rotation: horizontal movement = Y rotation, vertical movement = X rotation
        liverObject.rotation.y += deltaX * rotationSpeed
        liverObject.rotation.x += deltaY * rotationSpeed
      }
      
      this.lastMousePosition = { x: event.clientX, y: event.clientY }
      return // Skip normal hover detection when rotating model
    }
    
    if (this.mouseDownPosition) {
      const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x)
      const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y)
      const moveThreshold = 5
      
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        this.mouseMovedDuringClick = true
      }
    }
    
    const liverMesh = this.liverModel.getMesh()
    if (!liverMesh || !this.liverModel.getMaskTexture()) {
      return
    }
    
    const rect = this.renderer.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    
    const intersects = raycaster.intersectObjects([liverMesh])
    
    if (intersects.length > 0) {
      const intersection = intersects[0]
      const uv = intersection.uv
      
      if (uv) {
        const inscriptionId = this.liverModel.getInscriptionAtUV(uv.x, uv.y)
        
        if (inscriptionId > 0 && inscriptionId <= 42) {
          this.liverModel.setHoveredInscription(inscriptionId)
          
          const inscription = this.liverInscriptions.find(ins => ins.id === inscriptionId)
          if (inscription) {
            this.callbacks.onMarkerHover(inscription)
            this.renderer.domElement.style.cursor = 'pointer'
          }
        } else {
          this.liverModel.setHoveredInscription(0)
          this.callbacks.onMarkerHover(null)
          this.renderer.domElement.style.cursor = 'grab'
        }
      } else {
        this.liverModel.setHoveredInscription(0)
        this.callbacks.onMarkerHover(null)
        this.renderer.domElement.style.cursor = 'grab'
      }
    } else {
      this.liverModel.setHoveredInscription(0)
      this.callbacks.onMarkerHover(null)
      this.renderer.domElement.style.cursor = 'grab'
    }
  }

  private handleControlsStart() {
    this.isPanningOrRotating = true
    this.callbacks.onInteractionStart()
  }

  private handleControlsEnd() {
    this.isPanningOrRotating = false
    this.callbacks.onInteractionEnd()
  }

  private handleClick(event: MouseEvent) {
    if (this.isPanningOrRotating) {
      return
    }
    
    if (this.mouseMovedDuringClick) {
      this.mouseDownPosition = null
      this.mouseMovedDuringClick = false
      return
    }
    
    this.mouseDownPosition = null
    this.mouseMovedDuringClick = false
    
    const rect = this.renderer.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    
    const liverMesh = this.liverModel.getMesh()
    if (liverMesh) {
      const intersects = raycaster.intersectObjects([liverMesh])
      
      if (intersects.length > 0) {
        const intersection = intersects[0]
        const uv = intersection.uv
        
        if (uv) {
          const inscriptionId = this.liverModel.getInscriptionAtUV(uv.x, uv.y)
          
          if (inscriptionId > 0 && inscriptionId <= 42) {
            const inscription = this.liverInscriptions.find(ins => ins.id === inscriptionId)
            if (inscription) {
              this.callbacks.onInscriptionClick(inscriptionId, uv)
            }
          }
        }
      } else {
        this.callbacks.onBackgroundClick()
      }
    } else {
      this.callbacks.onBackgroundClick()
    }
  }

  public isCurrentlyPanningOrRotating(): boolean {
    return this.isPanningOrRotating
  }

  public dispose() {
    this.renderer.domElement.removeEventListener('mousemove', this.boundHandleMouseMove)
    this.renderer.domElement.removeEventListener('click', this.boundHandleClick)
    this.renderer.domElement.removeEventListener('mousedown', this.boundHandleMouseDown)
    this.renderer.domElement.removeEventListener('mouseup', this.boundHandleMouseUp)
    
    window.removeEventListener('keydown', this.boundHandleKeyDown)
    window.removeEventListener('keyup', this.boundHandleKeyUp)
    
    this.controls.removeEventListener('start', this.boundHandleControlsStart)
    this.controls.removeEventListener('end', this.boundHandleControlsEnd)
  }
} 