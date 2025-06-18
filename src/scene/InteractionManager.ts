import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface InteractionCallbacks {
  onInscriptionClick: (inscriptionId: number) => void
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
  
  private boundHandleMouseMove: (event: MouseEvent) => void
  private boundHandleClick: (event: MouseEvent) => void
  private boundHandleMouseDown: (event: MouseEvent) => void
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
    this.boundHandleControlsStart = this.handleControlsStart.bind(this)
    this.boundHandleControlsEnd = this.handleControlsEnd.bind(this)
    
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.renderer.domElement.addEventListener('mousemove', this.boundHandleMouseMove, { passive: true })
    this.renderer.domElement.addEventListener('click', this.boundHandleClick)
    this.renderer.domElement.addEventListener('mousedown', this.boundHandleMouseDown)
    
    this.controls.addEventListener('start', this.boundHandleControlsStart)
    this.controls.addEventListener('end', this.boundHandleControlsEnd)
  }

  private handleMouseDown(event: MouseEvent) {
    this.mouseDownPosition = { x: event.clientX, y: event.clientY }
    this.mouseMovedDuringClick = false
  }

  private handleMouseMove(event: MouseEvent) {
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
        
        if (inscriptionId > 0 && inscriptionId <= 40) {
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
          
          if (inscriptionId > 0 && inscriptionId <= 40) {
            const inscription = this.liverInscriptions.find(ins => ins.id === inscriptionId)
            if (inscription) {
              this.callbacks.onInscriptionClick(inscriptionId)
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
    this.controls.removeEventListener('start', this.boundHandleControlsStart)
    this.controls.removeEventListener('end', this.boundHandleControlsEnd)
  }
} 