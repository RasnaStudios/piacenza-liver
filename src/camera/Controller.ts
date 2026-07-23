import { gsap } from "gsap"
import * as THREE from "three"
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { SceneConfig } from "../config/SceneConfig"
import type { LiverModel } from "../scene/LiverModel"

// Helper function to detect portrait orientation with improved detection
const isPortraitOrientation = () => {
  return window.innerHeight > window.innerWidth
}

// Helper function to get the final camera position based on orientation
const getFinalCameraPosition = () => {
  return isPortraitOrientation()
    ? SceneConfig.camera.final.portrait.clone()
    : SceneConfig.camera.final.landscape.clone()
}

export class CameraController {
  private camera: THREE.Camera
  private controls: OrbitControls
  private isAnimating: boolean
  private originalControlsEnabled: boolean
  private controlsTemporarilyDisabled: boolean
  private currentTween: gsap.core.Tween | null = null

  constructor(camera: THREE.Camera, controls: OrbitControls) {
    this.camera = camera
    this.controls = controls

    this.isAnimating = false
    this.originalControlsEnabled = controls.enabled
    this.controlsTemporarilyDisabled = false

    // Bind methods
    this.handleControlsStart = this.handleControlsStart.bind(this)

    this.controls.addEventListener("start", this.handleControlsStart)
  }

  private ensureSafeEndPose(
    startPosition: THREE.Vector3,
    startTarget: THREE.Vector3,
    endPosition: THREE.Vector3,
    endTarget: THREE.Vector3,
  ): { endPosition: THREE.Vector3; endTarget: THREE.Vector3 } {
    // Ensure numbers are finite
    const all = [
      endPosition.x,
      endPosition.y,
      endPosition.z,
      endTarget.x,
      endTarget.y,
      endTarget.z,
    ]
    for (const v of all) {
      if (!Number.isFinite(v)) {
        // Fallback to start pose to avoid corrupting controls
        return {
          endPosition: startPosition.clone(),
          endTarget: startTarget.clone(),
        }
      }
    }
    return { endPosition, endTarget }
  }

  // Handle when user starts manual control (interrupt animations)
  handleControlsStart() {
    if (this.isAnimating) {
      this.stopAnimation()
    }
  }

  // Animate camera to focus on a specific position with panel-aware positioning and proper text orientation
  focusOn(
    targetPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3,
    duration: number = 800,
    isPanelOpen: boolean = false,
    onComplete?: () => void,
    modelMatrix?: THREE.Matrix4,
  ) {
    // Stop any existing animation first
    this.stopAnimation()

    // TODO: Use isPanelOpen for panel-aware camera positioning
    // Currently unused but reserved for future panel positioning logic
    void isPanelOpen

    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()

    // Transform coordinates if model matrix is provided
    let endTarget = targetPosition.clone()
    let endPosition = cameraPosition.clone()

    if (modelMatrix) {
      endTarget = targetPosition.clone().applyMatrix4(modelMatrix)
      endPosition = cameraPosition.clone().applyMatrix4(modelMatrix)
    }

    // Sanitize the target/position to avoid degenerate offsets and non-finite values
    const safePose = this.ensureSafeEndPose(
      startPosition,
      startTarget,
      endPosition,
      endTarget,
    )
    endPosition = safePose.endPosition
    endTarget = safePose.endTarget

    // Temporarily disable controls to avoid fighting during animation
    this.originalControlsEnabled = this.controls.enabled
    this.controls.enabled = false
    this.controlsTemporarilyDisabled = true
    this.isAnimating = true

    // Simple animation - just animate position and target, let OrbitControls handle rotation
    const tween = gsap.to(
      { t: 0 },
      {
        t: 1,
        duration: duration / 1000,
        ease: "power2.inOut",
        onUpdate: () => {
          if (!this.isAnimating) return
          const t = (tween.targets()[0] as { t: number }).t

          // Simple lerp for position and target
          this.camera.position.lerpVectors(startPosition, endPosition, t)
          this.controls.target.lerpVectors(startTarget, endTarget, t)
          this.controls.update()
        },
        onComplete: () => {
          this.isAnimating = false
          if (this.controlsTemporarilyDisabled) {
            this.controls.enabled = this.originalControlsEnabled
            this.controlsTemporarilyDisabled = false
          }
          this.controls.update()
          if (onComplete) onComplete()
        },
      },
    )

    // Track animation state
    this.isAnimating = true
    this.currentTween = tween
    return "camera-focus-gsap"
  }

  // Reset camera and model to default positions
  resetToDefault(
    liverModel: LiverModel | null,
    duration = 1000,
    onComplete?: () => void,
  ) {
    this.stopAnimation()

    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()

    const endPosition = getFinalCameraPosition()
    const endTarget =
      liverModel?.getLiverCenter().clone() || new THREE.Vector3(0, 0, 0)

    let modelAnimation: ((t: number) => void) | null = null

    if (liverModel) {
      const liverObject = liverModel.getObject()
      if (liverObject) {
        const startModelPosition = {
          x: liverObject.position.x,
          y: liverObject.position.y,
          z: liverObject.position.z,
        }
        const endModelPosition = SceneConfig.model.position
        const startModelQuaternion = liverObject.quaternion.clone()
        const endModelQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            SceneConfig.model.rotation.x,
            SceneConfig.model.rotation.y,
            SceneConfig.model.rotation.z,
          ),
        )

        modelAnimation = (t: number) => {
          if (liverObject) {
            liverObject.position.x =
              startModelPosition.x +
              (endModelPosition.x - startModelPosition.x) * t
            liverObject.position.y =
              startModelPosition.y +
              (endModelPosition.y - startModelPosition.y) * t
            liverObject.position.z =
              startModelPosition.z +
              (endModelPosition.z - startModelPosition.z) * t
            liverObject.quaternion.slerpQuaternions(
              startModelQuaternion,
              endModelQuaternion,
              t,
            )
          }
        }
      }
    }

    this.isAnimating = true
    const tween = gsap.to(
      { t: 0 },
      {
        t: 1,
        duration: duration / 1000,
        ease: "power1.inOut",
        onUpdate: () => {
          if (this.currentTween !== tween || !this.isAnimating) return
          const t = (tween.targets()[0] as { t: number }).t

          const tempCameraPos = new THREE.Vector3().lerpVectors(
            startPosition,
            endPosition,
            t,
          )
          const tempTargetPos = new THREE.Vector3().lerpVectors(
            startTarget,
            endTarget,
            t,
          )
          this.camera.position.copy(tempCameraPos)
          this.controls.target.copy(tempTargetPos)
          this.camera.up.set(0, 1, 0)
          this.camera.lookAt(tempTargetPos)
          this.controls.update()

          if (modelAnimation) {
            modelAnimation(t)
          }
        },
        onComplete: () => {
          if (this.currentTween !== tween) return
          this.isAnimating = false
          this.currentTween = null
          if (onComplete) onComplete()
        },
      },
    )
    this.currentTween = tween
    return "camera-reset-gsap"
  }

  pullBack(targetDistance: number, duration = 600, onComplete?: () => void) {
    this.stopAnimation()

    const startPosition = this.camera.position.clone()
    const target = this.controls.target.clone()

    const direction = new THREE.Vector3()
      .subVectors(startPosition, target)
      .normalize()

    const endPosition = target
      .clone()
      .add(direction.multiplyScalar(targetDistance))

    this.isAnimating = true
    const tween = gsap.to(
      { t: 0 },
      {
        t: 1,
        duration: duration / 1000,
        ease: "power2.out",
        onUpdate: () => {
          if (this.currentTween !== tween || !this.isAnimating) return
          const t = (tween.targets()[0] as { t: number }).t

          const tempCameraPos = new THREE.Vector3().lerpVectors(
            startPosition,
            endPosition,
            t,
          )
          this.camera.position.copy(tempCameraPos)
          this.camera.lookAt(target)
          this.controls.update()
        },
        onComplete: () => {
          if (this.currentTween !== tween) return
          this.isAnimating = false
          this.currentTween = null
          if (onComplete) onComplete()
        },
      },
    )
    this.currentTween = tween
    return "camera-pullback-gsap"
  }

  // Stop current camera animation immediately
  stopAnimation() {
    if (this.currentTween) {
      this.currentTween.kill()
      this.currentTween = null
    }
    this.isAnimating = false

    // Always restore controls state if we temporarily disabled them
    if (this.controlsTemporarilyDisabled) {
      this.controls.enabled = this.originalControlsEnabled
      this.controlsTemporarilyDisabled = false
    }

    // Ensure controls are properly updated after stopping
    this.controls.update()
  }

  // Cleanup
  dispose() {
    this.controls.removeEventListener("start", this.handleControlsStart)
    this.stopAnimation()
  }
}
