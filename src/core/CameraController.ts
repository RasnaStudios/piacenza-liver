import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { globalAnimator, easingFunctions, lerpVector3 } from './Animation'

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

  // Helper method to calculate a roll-safe camera position
  private calculateRollSafePosition(
    startPosition: THREE.Vector3, 
    startTarget: THREE.Vector3, 
    endPosition: THREE.Vector3, 
    endTarget: THREE.Vector3
  ): THREE.Vector3 {
    // Calculate the viewing directions
    const startDirection = startPosition.clone().sub(startTarget).normalize()
    const endDirection = endPosition.clone().sub(endTarget).normalize()
    
    // Calculate the angle between the directions
    const angle = startDirection.angleTo(endDirection)
    
    // If the angle is small, use the original end position
    if (angle < Math.PI / 4) { // Less than 45 degrees
      return endPosition
    }
    
    // For larger angles, use spherical interpolation to prevent roll
    if (angle > Math.PI / 2) { // More than 90 degrees
      console.log(`Large angle detected (${(angle * 180 / Math.PI).toFixed(1)}°), using conservative interpolation`)
      
      // Use a more conservative approach - blend the directions
      const blendFactor = 0.6 // 60% toward target direction
      const blendedDirection = startDirection.clone()
        .multiplyScalar(1 - blendFactor)
        .add(endDirection.clone().multiplyScalar(blendFactor))
        .normalize()
      
      // Calculate the distance from target to maintain
      const distance = endPosition.distanceTo(endTarget)
      
      // Return position that uses blended direction
      return endTarget.clone().add(blendedDirection.multiplyScalar(distance))
    }
    
    // For medium angles, use spherical interpolation
    const t = 0.5 // Use halfway point for medium angles
    const sinAngle = Math.sin(angle)
    const sinT = Math.sin(t * angle)
    const sinOneMinusT = Math.sin((1 - t) * angle)
    
    // Spherical interpolation formula
    const interpolatedDirection = startDirection.clone()
      .multiplyScalar(sinOneMinusT / sinAngle)
      .add(endDirection.clone().multiplyScalar(sinT / sinAngle))
      .normalize()
    
    // Calculate the distance from target to maintain
    const distance = endPosition.distanceTo(endTarget)
    
    // Return position that uses interpolated direction
    return endTarget.clone().add(interpolatedDirection.multiplyScalar(distance))
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

    // Check for potential excessive roll and adjust if necessary
    const startDirection = startPosition.clone().sub(startTarget).normalize()
    const endDirection = endPosition.clone().sub(endTarget).normalize()
    const rollAngle = startDirection.angleTo(endDirection)
    
    // If the roll angle would be too large, use a more conservative approach
    if (rollAngle > Math.PI / 2) { // More than 90 degrees
      console.log(`Large roll detected (${(rollAngle * 180 / Math.PI).toFixed(1)}°), using conservative approach`)
      
      // Instead of direct interpolation, use a two-step approach:
      // 1. First move to a position that maintains current orientation
      // 2. Then gradually adjust to the final position
      
      // Calculate a conservative end position that's closer to current orientation
      const conservativeDirection = startDirection.clone()
        .multiplyScalar(0.3) // Keep 30% of current direction
        .add(endDirection.clone().multiplyScalar(0.7)) // Add 70% of target direction
        .normalize()
      
      const conservativeEndPosition = endTarget.clone().add(conservativeDirection.multiplyScalar(endPosition.distanceTo(endTarget)))
      endPosition = conservativeEndPosition
    }

    // Use the roll-safe position calculation
    endPosition = this.calculateRollSafePosition(startPosition, startTarget, endPosition, endTarget)

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
        
        // Ensure camera maintains consistent up direction to prevent roll
        // Use lookAt with a fixed up vector (0, 1, 0) to eliminate roll
        this.camera.lookAt(tempTargetPos)
        
        // Force the camera's up vector to be (0, 1, 0) to prevent roll
        this.camera.up.set(0, 1, 0)
        
        this.controls.update()
      },
      easingFunctions.easeInOutBalanced, // Balanced ease in/out with same speed
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
        
        // Ensure camera maintains consistent up direction to prevent roll
        this.camera.lookAt(tempTargetPos)
        this.camera.up.set(0, 1, 0)
        
        this.controls.update()
      },
      easingFunctions.easeInOutBalanced, // Balanced ease in/out with same speed
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
        
        // Ensure camera maintains consistent up direction to prevent roll
        this.camera.lookAt(tempTargetPos)
        this.camera.up.set(0, 1, 0)
        
        this.controls.update()
      },
      easingFunctions.easeInOutBalanced, // Balanced ease in/out with same speed
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
        
        // Ensure camera maintains consistent up direction to prevent roll
        this.camera.lookAt(tempTargetPos)
        this.camera.up.set(0, 1, 0)
        
        this.controls.update()
      },
      easingFunctions.easeInOutBalanced, // Balanced ease in/out with same speed
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