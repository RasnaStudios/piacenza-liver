import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'
import { SceneConfig } from '../config/SceneConfig'

export class CameraController {
  private camera: THREE.Camera
  private controls: OrbitControls
  private lastManualPosition: THREE.Vector3
  private lastManualTarget: THREE.Vector3
  private isAnimating: boolean
  private currentAnimationId: string | null
  private originalControlsEnabled: boolean
  private originalEnableDamping: boolean
  private controlsTemporarilyDisabled: boolean
  private static readonly MIN_OFFSET_EPSILON = 1e-4
  private currentTween: gsap.core.Tween | null = null

  constructor(camera: THREE.Camera, controls: OrbitControls) {
    this.camera = camera
    this.controls = controls
    
    // Track user's manual positions
    // Calculate intro end position and target using config
    const endPos = SceneConfig.camera.initial.clone().add(SceneConfig.animation.camera.positionOffset)
    const endTarget = SceneConfig.camera.target.clone().add(SceneConfig.animation.camera.targetOffset)
    this.lastManualPosition = endPos
    this.lastManualTarget = endTarget
    
    // Animation state
    this.isAnimating = false
    this.currentAnimationId = null
    this.originalControlsEnabled = controls.enabled
    this.originalEnableDamping = controls.enableDamping
    this.controlsTemporarilyDisabled = false
    
    // Bind methods
    this.handleControlsChange = this.handleControlsChange.bind(this)
    this.handleControlsStart = this.handleControlsStart.bind(this)
    this.handleControlsEnd = this.handleControlsEnd.bind(this)
    
    // Listen for manual camera movements
    this.controls.addEventListener('change', this.handleControlsChange)
    this.controls.addEventListener('start', this.handleControlsStart)
    this.controls.addEventListener('end', this.handleControlsEnd)
  }

  private ensureSafeEndPose(
    startPosition: THREE.Vector3,
    startTarget: THREE.Vector3,
    endPosition: THREE.Vector3,
    endTarget: THREE.Vector3
  ): { endPosition: THREE.Vector3; endTarget: THREE.Vector3 } {
    // Ensure numbers are finite
    const all = [endPosition.x, endPosition.y, endPosition.z, endTarget.x, endTarget.y, endTarget.z]
    for (const v of all) {
      if (!Number.isFinite(v)) {
        // Fallback to start pose to avoid corrupting controls
        return { endPosition: startPosition.clone(), endTarget: startTarget.clone() }
      }
    }
    // Ensure offset is not degenerate
    const endOffset = endPosition.clone().sub(endTarget)
    if (endOffset.lengthSq() < CameraController.MIN_OFFSET_EPSILON) {
      const startOffset = startPosition.clone().sub(startTarget)
      const safeDir = startOffset.lengthSq() > 0 ? startOffset.normalize() : new THREE.Vector3(0, 0, 1)
      const safeDist = Math.max(0.5, startOffset.length())
      const safeEndPos = endTarget.clone().add(safeDir.multiplyScalar(safeDist))
      return { endPosition: safeEndPos, endTarget }
    }
    return { endPosition, endTarget }
  }

  // Focus using positions stored in model-local space by transforming with the given model matrix
  focusOnTransformed(
    localCameraPosition: THREE.Vector3,
    localTargetPosition: THREE.Vector3,
    modelMatrix: THREE.Matrix4,
    duration: number = 800,
    onComplete?: () => void
  ) {
    const worldCameraPos = localCameraPosition.clone().applyMatrix4(modelMatrix)
    const worldTargetPos = localTargetPosition.clone().applyMatrix4(modelMatrix)
    return this.focusOn(worldTargetPos, duration, worldCameraPos, true, onComplete)
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
  focusOn(
    targetPosition: THREE.Vector3, 
    duration: number = 800, 
    customCameraPosition: THREE.Vector3 | null = null, 
    isPanelOpen: boolean = false,
    onComplete?: () => void
  ) {
    // Stop any existing animation first
    this.stopAnimation()
    
    // Store current position before animating
    this.lastManualPosition.copy(this.camera.position)
    this.lastManualTarget.copy(this.controls.target)
    
    // TODO: Use isPanelOpen for panel-aware camera positioning
    // Currently unused but reserved for future panel positioning logic
    void isPanelOpen

    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    
    // Target is the inscription position - this centers it in the screen
    let endTarget = targetPosition.clone()
    
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

    // Mobile-only: true screen-space pan LEFT (translate camera AND target together, no orbit)
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobile) {
        const persp = this.camera as any
        if (persp && (persp.isPerspectiveCamera === true)) {
          const forwardVec = endTarget.clone().sub(endPosition)
          const distance = forwardVec.length()
          const fov = THREE.MathUtils.degToRad(persp.fov)
          const halfWidth = Math.tan(fov * 0.5) * distance * persp.aspect
          const fraction = 0.4 // tune as needed; portion of half-screen width to pan
          const worldShift = halfWidth * fraction
          const forward = forwardVec.clone().normalize()
          const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize()
          const leftShift = right.multiplyScalar(-worldShift)
          // Pan both position and target equally to avoid rotation
          endPosition.add(leftShift)
          endTarget.add(leftShift)
        }
      }
    } catch (_e) {
      // ignore
    }

    // Sanitize the target/position to avoid degenerate offsets and non-finite values
    const safePose = this.ensureSafeEndPose(startPosition, startTarget, endPosition, endTarget)
    endPosition = safePose.endPosition
    endTarget = safePose.endTarget

    // Reusable vectors and rotation helpers
    const tempCameraPos = new THREE.Vector3()
    const tempTargetPos = new THREE.Vector3()
    // We avoid quaternion slerp to keep motion softer; rely on lookAt with eased target

    // Temporarily disable controls to avoid fighting during animation
    this.originalControlsEnabled = this.controls.enabled
    this.originalEnableDamping = this.controls.enableDamping
    this.controls.enabled = false
    this.controls.enableDamping = false
    this.controlsTemporarilyDisabled = true
    this.isAnimating = true

    // Use GSAP for robust tweening of both position and target
    const tween = gsap.to({ t: 0 }, {
      t: 1,
      duration: duration / 1000,
      ease: 'sine.inOut',
      onUpdate: () => {
        try {
          // Ignore updates from stale tweens
          if (this.currentTween !== tween || !this.isAnimating) return
          const t = (tween as any).targets()[0].t as number
          tempCameraPos.lerpVectors(startPosition, endPosition, t)
          tempTargetPos.lerpVectors(startTarget, endTarget, t)
          const offset = tempCameraPos.clone().sub(tempTargetPos)
          if (offset.lengthSq() < CameraController.MIN_OFFSET_EPSILON) {
            const startOffset = startPosition.clone().sub(startTarget)
            const safeDir = startOffset.lengthSq() > 0 ? startOffset.normalize() : new THREE.Vector3(0, 0, 1)
            const safeDist = Math.max(0.5, startOffset.length())
            tempCameraPos.copy(tempTargetPos).add(safeDir.multiplyScalar(safeDist))
          }
          this.camera.position.copy(tempCameraPos)
          this.controls.target.copy(tempTargetPos)
          this.camera.up.set(0, 1, 0)
          this.camera.lookAt(tempTargetPos)
          this.camera.updateMatrixWorld(true)
          this.controls.update()
        } catch (_e) {
          this.stopAnimation()
          tween.kill()
        }
      },
      onComplete: () => {
        if (this.currentTween !== tween) return
        this.isAnimating = false
        this.currentAnimationId = null
        if (this.controlsTemporarilyDisabled) {
          this.controls.enabled = this.originalControlsEnabled
          this.controls.enableDamping = this.originalEnableDamping
          this.controlsTemporarilyDisabled = false
        }
        this.controls.target.copy(endTarget)
        this.camera.up.set(0, 1, 0)
        this.camera.lookAt(endTarget)
        this.controls.update()
        if (onComplete) onComplete()
      }
    })

    // Track animation state
    this.isAnimating = true
    this.currentTween = tween
    return 'camera-focus-gsap'
  }

  // Reset to default position
  resetToDefault(duration = 1000) {
    // Stop any existing animation first
    this.stopAnimation()

    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()

    // Reset to intro end position using config
    const endPosition = SceneConfig.camera.initial.clone().add(SceneConfig.animation.camera.positionOffset)
    const endTarget = SceneConfig.camera.target.clone().add(SceneConfig.animation.camera.targetOffset)

    // Update manual position to default
    this.lastManualPosition.copy(endPosition)
    this.lastManualTarget.copy(endTarget)

    this.isAnimating = true
    const tween = gsap.to({ t: 0 }, {
      t: 1,
      duration: duration / 1000,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (this.currentTween !== tween || !this.isAnimating) return
        const t = (tween as any).targets()[0].t as number
        const tempCameraPos = new THREE.Vector3().lerpVectors(startPosition, endPosition, t)
        const tempTargetPos = new THREE.Vector3().lerpVectors(startTarget, endTarget, t)
        this.camera.position.copy(tempCameraPos)
        this.controls.target.copy(tempTargetPos)
        this.camera.up.set(0, 1, 0)
        this.camera.lookAt(tempTargetPos)
        this.controls.update()
      },
      onComplete: () => {
        if (this.currentTween !== tween) return
        this.isAnimating = false
        this.currentTween = null
      }
    })
    this.currentTween = tween
    this.currentAnimationId = 'camera-reset-gsap'
    return 'camera-reset-gsap'
  }


  // Stop current camera animation immediately
  stopAnimation() {
    if (this.currentTween) {
      this.currentTween.kill()
      this.currentTween = null
    }
    this.isAnimating = false
    this.currentAnimationId = null

    // Always restore controls state if we temporarily disabled them
    if (this.controlsTemporarilyDisabled) {
      this.controls.enabled = this.originalControlsEnabled
      this.controls.enableDamping = this.originalEnableDamping
      this.controlsTemporarilyDisabled = false
    }

    // Ensure controls are properly updated after stopping
    this.controls.update()
  }


  // Cleanup
  dispose() {
    this.controls.removeEventListener('change', this.handleControlsChange)
    this.controls.removeEventListener('start', this.handleControlsStart)
    this.controls.removeEventListener('end', this.handleControlsEnd)
    this.stopAnimation()
  }
} 