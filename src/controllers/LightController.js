import * as THREE from 'three'

export class LightController {
  constructor(camera, renderer, scene) {
    this.camera = camera
    this.renderer = renderer
    this.scene = scene
    this.isActive = false
    this.isMoving = false
    
    // Create movable light
    this.light = new THREE.SpotLight(0xffffff, 2)
    this.light.position.set(2, 4, 2)
    this.light.castShadow = true
    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048
    this.light.shadow.camera.near = 0.5
    this.light.shadow.camera.far = 500
    this.light.angle = Math.PI / 6
    this.light.penumbra = 0.3
    this.scene.add(this.light)
    
    // Light helper (optional visual indicator)
    this.lightHelper = new THREE.SpotLightHelper(this.light)
    this.lightHelper.visible = false
    this.scene.add(this.lightHelper)
    
    // Mouse tracking
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    
    // Create invisible plane for light positioning
    const planeGeometry = new THREE.PlaneGeometry(20, 20)
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0, 
      side: THREE.DoubleSide 
    })
    this.lightPlane = new THREE.Mesh(planeGeometry, planeMaterial)
    this.lightPlane.position.set(0, 2, 0)
    this.lightPlane.rotation.x = -Math.PI / 2
    this.scene.add(this.lightPlane)
    
    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    
    // Add event listeners
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove)
    this.renderer.domElement.addEventListener('mousedown', this.handleMouseDown)
    this.renderer.domElement.addEventListener('mouseup', this.handleMouseUp)
  }
  
  handleKeyDown(event) {
    // Option key on Mac (Alt key on PC)
    if (event.altKey && !this.isActive) {
      this.isActive = true
      this.lightHelper.visible = true
      this.renderer.domElement.style.cursor = 'crosshair'
    }
  }
  
  handleKeyUp(event) {
    if (!event.altKey && this.isActive) {
      this.isActive = false
      this.isMoving = false
      this.lightHelper.visible = false
      this.renderer.domElement.style.cursor = ''
    }
  }
  
  handleMouseDown(event) {
    if (this.isActive) {
      this.isMoving = true
      event.preventDefault()
      event.stopPropagation()
    }
  }
  
  handleMouseUp(event) {
    if (this.isActive) {
      this.isMoving = false
    }
  }
  
  handleMouseMove(event) {
    if (this.isActive && this.isMoving) {
      event.preventDefault()
      event.stopPropagation()
      
      // Calculate mouse position
      const rect = this.renderer.domElement.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      // Raycast to the light plane
      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObject(this.lightPlane)
      
      if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point
        // Keep light elevated above the intersection point
        this.light.position.set(
          intersectionPoint.x,
          intersectionPoint.y + 2,
          intersectionPoint.z
        )
        this.lightHelper.update()
      }
    }
  }
  
  getLight() {
    return this.light
  }
  
  dispose() {
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.renderer.domElement.removeEventListener('mousemove', this.handleMouseMove)
    this.renderer.domElement.removeEventListener('mousedown', this.handleMouseDown)
    this.renderer.domElement.removeEventListener('mouseup', this.handleMouseUp)
    
    // Clean up Three.js objects
    this.scene.remove(this.light)
    this.scene.remove(this.lightHelper)
    this.scene.remove(this.lightPlane)
    
    if (this.light.dispose) this.light.dispose()
    if (this.lightHelper.dispose) this.lightHelper.dispose()
    if (this.lightPlane.geometry) this.lightPlane.geometry.dispose()
    if (this.lightPlane.material) this.lightPlane.material.dispose()
  }
} 