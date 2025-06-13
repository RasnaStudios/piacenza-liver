import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { globalAnimator, easingFunctions, lerpVector3 } from '../utils/animationUtils'

export class CameraController {
  private camera: THREE.Camera
  private controls: OrbitControls
  private lastManualPosition: THREE.Vector3
  private lastManualTarget: THREE.Vector3
  private isAnimating: boolean
  private currentAnimationId: number | null

  constructor(camera: THREE.Camera, controls: OrbitControls) {
    this.camera = camera
    this.controls = controls
    
    // Track user's manual positions
    this.lastManualPosition = new THREE.Vector3(0, 2, 3)
    this.lastManualTarget = new THREE.Vector3(0, 0, 0)
    
    // Animation state
    this.isAnimating = false
    this.currentAnimationId = null
    
    // Bind methods
    this.handleControlsChange = this.handleControlsChange.bind(this)
    this.handleControlsStart = this.handleControlsStart.bind(this)
    this.handleControlsEnd = this.handleControlsEnd.bind(this)
    
    // Listen for manual camera movements
    this.controls.addEventListener('change', this.handleControlsChange)
    this.controls.addEventListener('start', this.handleControlsStart)
    this.controls.addEventListener('end', this.handleControlsEnd)
  }

  // Handle when user starts manual control (interrupt animations)
  handleControlsStart() {
    if (this.isAnimating) {
      // User started manual control during animation - stop it immediately
      this.stopAnimation()
      console.log('Animation interrupted by user interaction')
    }
  }

  // Handle when user stops manual control
  handleControlsEnd() {
    // Update manual position when user finishes controlling
    if (!this.isAnimating) {
      this.lastManualPosition.copy(this.camera.position)
      this.lastManualTarget.copy(this.controls.target)
    }
  }

  // Track manual camera movements (only when not animating)
  handleControlsChange() {
    if (!this.isAnimating) {
      this.lastManualPosition.copy(this.camera.position)
      this.lastManualTarget.copy(this.controls.target)
    }
  }

  // Animate camera to focus on a specific position with panel-aware positioning and proper text orientation
  focusOn(targetPosition: THREE.Vector3, duration: number = 800, customCameraPosition: THREE.Vector3 | null = null, isPanelOpen: boolean = false) {
    // Stop any existing animation first
    this.stopAnimation()
    
    // Store current position before animating
    this.lastManualPosition.copy(this.camera.position)
    this.lastManualTarget.copy(this.controls.target)

    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    
    // Target is the inscription position - this centers it in the screen
    const endTarget = targetPosition.clone()
    
    // Use custom camera position if provided, otherwise calculate based on target
    let endPosition: THREE.Vector3
    if (customCameraPosition) {
      // Use the predefined camera position from the inscription data
      endPosition = customCameraPosition.clone()
    } else {
      // Fallback: position camera at a reasonable offset
      const offset = new THREE.Vector3(0, 0.5, 1.0)
      endPosition = endTarget.clone().add(offset)
    }

    // Reusable vectors for performance
    const tempCameraPos = new THREE.Vector3()
    const tempTargetPos = new THREE.Vector3()

    this.isAnimating = true

    this.currentAnimationId = globalAnimator.animate(
      'camera-focus',
      duration,
      (progress: number) => {
        // Check if animation was interrupted
        if (!this.isAnimating) {
          return // Stop updating if animation was cancelled
        }
        
        // Interpolate camera position
        lerpVector3(startPosition, endPosition, progress, tempCameraPos)
        this.camera.position.copy(tempCameraPos)
        
        // Interpolate camera target
        lerpVector3(startTarget, endTarget, progress, tempTargetPos)
        this.controls.target.copy(tempTargetPos)
        
        this.controls.update()
      },
      easingFunctions.easeInOutQuart, // Faster, snappier easing
      () => {
        this.isAnimating = false
        this.currentAnimationId = null
      }
    )

    return this.currentAnimationId
  }

  // Return to user's last manual position
  returnToManualPosition(duration = 1000) {
    // Stop any existing animation first
    this.stopAnimation()
    
    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    
    const endPosition = this.lastManualPosition.clone()
    const endTarget = this.lastManualTarget.clone()

    // Reusable vectors for performance
    const tempCameraPos = new THREE.Vector3()
    const tempTargetPos = new THREE.Vector3()

    this.isAnimating = true

    this.currentAnimationId = globalAnimator.animate(
      'camera-return',
      duration,
      (progress) => {
        // Check if animation was interrupted
        if (!this.isAnimating) {
          return // Stop updating if animation was cancelled
        }
        
        // Interpolate camera position
        lerpVector3(startPosition, endPosition, progress, tempCameraPos)
        this.camera.position.copy(tempCameraPos)
        
        // Interpolate camera target
        lerpVector3(startTarget, endTarget, progress, tempTargetPos)
        this.controls.target.copy(tempTargetPos)
        
        this.controls.update()
      },
      easingFunctions.easeOutCubic,
      () => {
        this.isAnimating = false
        this.currentAnimationId = null
      }
    )

    return this.currentAnimationId
  }

  // Center liver in full screen (when panel closes)
  centerLiver(duration = 600) {
    // Stop any existing animation first
    this.stopAnimation()
    
    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    
    // Position liver at center of screen
    const endTarget = new THREE.Vector3(0, 0, 0)
    // Keep camera at a good viewing distance but center the target
    const cameraDirection = startPosition.clone().normalize()
    const distance = Math.max(1.5, startPosition.length())
    const endPosition = cameraDirection.multiplyScalar(distance)

    // Reusable vectors for performance
    const tempCameraPos = new THREE.Vector3()
    const tempTargetPos = new THREE.Vector3()

    this.isAnimating = true

    this.currentAnimationId = globalAnimator.animate(
      'camera-center',
      duration,
      (progress) => {
        // Check if animation was interrupted
        if (!this.isAnimating) {
          return // Stop updating if animation was cancelled
        }
        
        // Interpolate camera position
        lerpVector3(startPosition, endPosition, progress, tempCameraPos)
        this.camera.position.copy(tempCameraPos)
        
        // Interpolate camera target
        lerpVector3(startTarget, endTarget, progress, tempTargetPos)
        this.controls.target.copy(tempTargetPos)
        
        this.controls.update()
      },
      easingFunctions.easeInOutQuart,
      () => {
        this.isAnimating = false
        this.currentAnimationId = null
      }
    )

    return this.currentAnimationId
  }

  // Reset to default position
  resetToDefault(duration = 1000) {
    // Stop any existing animation first
    this.stopAnimation()
    
    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    
    const endPosition = new THREE.Vector3(0, 2, 3)
    const endTarget = new THREE.Vector3(0, 0, 0)

    // Update manual position to default
    this.lastManualPosition.copy(endPosition)
    this.lastManualTarget.copy(endTarget)

    // Reusable vectors for performance
    const tempCameraPos = new THREE.Vector3()
    const tempTargetPos = new THREE.Vector3()

    this.isAnimating = true

    this.currentAnimationId = globalAnimator.animate(
      'camera-reset',
      duration,
      (progress) => {
        // Check if animation was interrupted
        if (!this.isAnimating) {
          return // Stop updating if animation was cancelled
        }
        
        // Interpolate camera position
        lerpVector3(startPosition, endPosition, progress, tempCameraPos)
        this.camera.position.copy(tempCameraPos)
        
        // Interpolate camera target
        lerpVector3(startTarget, endTarget, progress, tempTargetPos)
        this.controls.target.copy(tempTargetPos)
        
        this.controls.update()
      },
      easingFunctions.easeOutCubic,
      () => {
        this.isAnimating = false
        this.currentAnimationId = null
      }
    )

    return this.currentAnimationId
  }

  // Stop current camera animation immediately
  stopAnimation() {
    if (this.isAnimating && this.currentAnimationId) {
      globalAnimator.stop(this.currentAnimationId)
      this.isAnimating = false
      this.currentAnimationId = null
      
      // Ensure controls are properly updated after stopping
      this.controls.update()
    }
  }

  // Check if camera is currently animating
  isCurrentlyAnimating() {
    return this.isAnimating
  }

  // Get current manual position
  getManualPosition() {
    return {
      position: this.lastManualPosition.clone(),
      target: this.lastManualTarget.clone()
    }
  }

  // Set manual position (useful for initialization)
  setManualPosition(position, target) {
    this.lastManualPosition.copy(position)
    this.lastManualTarget.copy(target)
  }

  // Cleanup
  dispose() {
    this.controls.removeEventListener('change', this.handleControlsChange)
    this.controls.removeEventListener('start', this.handleControlsStart)
    this.controls.removeEventListener('end', this.handleControlsEnd)
    this.stopAnimation()
  }
} 