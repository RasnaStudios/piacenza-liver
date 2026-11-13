import * as THREE from "three"
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { SceneConfig } from "../config/SceneConfig"

export type ScreensaverConfig = (typeof SceneConfig)["screensaver"]

export interface ScreensaverPoint {
  id: number
  // Model-space camera pose that frames the point
  position: THREE.Vector3
  target: THREE.Vector3
}

export interface ScreensaverHost {
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  getModel: () => THREE.Object3D | null
  // Model pose the object spins from
  restPose: { position: THREE.Vector3; quaternion: THREE.Quaternion }
  // Model-space point the spin axis passes through
  getPivot: () => THREE.Vector3
  // Camera distance at which the whole object fits on screen
  getFitDistance: () => number
  getPoints: () => ScreensaverPoint[]
  onStart: () => void
  // Highlight a point while the camera visits it, 0 to clear
  onHighlight: (id: number, fadeMs: number) => void
  onStop: () => void
  onFrame: () => void
}

type Shot = { kind: "overview" } | { kind: "point"; point: ScreensaverPoint }

interface CameraPose {
  camera: THREE.Vector3
  target: THREE.Vector3
  up: THREE.Vector3
}

const ACTIVITY_EVENTS = [
  "click",
  "pointerdown",
  "pointermove",
  "wheel",
  "keydown",
  "touchstart",
] as const

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

const smoothstep = (x: number) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

const wave = (u: number, cycles: number) =>
  (1 - Math.cos(2 * Math.PI * cycles * clamp01(u))) / 2

const createCameraPose = (): CameraPose => ({
  camera: new THREE.Vector3(),
  target: new THREE.Vector3(),
  up: new THREE.Vector3(0, 1, 0),
})

export class Screensaver {
  private host: ScreensaverHost
  private config: ScreensaverConfig
  private idleMs: number
  private active = false
  private idleTimer: number | null = null
  private frameId: number | null = null
  private suppressClickUntil = 0
  private lastPointer: { x: number; y: number } | null = null

  private axis = new THREE.Vector3()
  private axisBasis = new THREE.Quaternion()
  private spin = new THREE.Quaternion()
  private spinQuaternion = new THREE.Quaternion()
  private spinPosition = new THREE.Vector3()
  private pivotWorld = new THREE.Vector3()
  private offset = new THREE.Vector3()
  private fromDirection = new THREE.Vector3()
  private toDirection = new THREE.Vector3()
  private cameraArc = new THREE.Quaternion()
  private blendedArc = new THREE.Quaternion()
  private viewMatrix = new THREE.Matrix4()
  private fromOrientation = new THREE.Quaternion()
  private toOrientation = new THREE.Quaternion()

  private startedAt = 0
  private enterModel = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
  }
  private enterCamera = createCameraPose()
  private shots: Shot[] = []
  private shotIndex = 0
  private shotStartedAt = 0
  private transitionMs = 0
  private previous: { shot: Shot; startedAt: number } | null = null
  private fromPose = createCameraPose()
  private toPose = createCameraPose()

  constructor(host: ScreensaverHost, config: ScreensaverConfig) {
    this.host = host
    this.config = config
    this.axis.fromArray(config.spin.axis).normalize()
    this.axisBasis.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.axis)
    const override = Number(
      new URLSearchParams(window.location.search).get("idle"),
    )
    this.idleMs =
      (Number.isFinite(override) && override > 0
        ? override
        : config.idleSeconds) * 1000
    this.handleActivity = this.handleActivity.bind(this)
    this.frame = this.frame.bind(this)
    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, this.handleActivity, {
        capture: true,
        passive: true,
      })
    }
    this.armIdleTimer()
  }

  get isActive() {
    return this.active
  }

  start() {
    const model = this.host.getModel()
    if (this.active || !model) return
    this.clearIdleTimer()
    this.active = true
    this.host.onStart()

    const { camera, controls } = this.host
    this.enterModel.position.copy(model.position)
    this.enterModel.quaternion.copy(model.quaternion)
    this.enterCamera.camera.copy(camera.position)
    this.enterCamera.target.copy(controls.target)
    this.enterCamera.up.copy(camera.up)
    this.shots = [
      { kind: "overview" },
      ...this.host
        .getPoints()
        .map((point) => ({ kind: "point" as const, point })),
    ]
    this.startedAt = performance.now()
    this.previous = null
    this.beginShot(0, this.startedAt)
    this.frameId = requestAnimationFrame(this.frame)
  }

  stop() {
    if (!this.active) return
    this.active = false
    this.cancelFrame()
    this.host.onStop()
    this.armIdleTimer()
  }

  dispose() {
    this.active = false
    this.cancelFrame()
    this.clearIdleTimer()
    for (const type of ACTIVITY_EVENTS) {
      window.removeEventListener(type, this.handleActivity, { capture: true })
    }
  }

  private handleActivity(event: Event) {
    // Consume the wake-up gesture so it cannot interrupt reset or open a panel.
    if (event.type === "click") {
      if (performance.now() < this.suppressClickUntil)
        event.stopImmediatePropagation()
      return
    }
    if (event.type === "pointermove") {
      const { clientX, clientY } = event as PointerEvent
      const last = this.lastPointer
      if (!last) this.lastPointer = { x: clientX, y: clientY }
      if (
        !last ||
        Math.hypot(clientX - last.x, clientY - last.y) <=
          this.config.pointerMoveThresholdPx
      )
        return
    }
    if (event.type === "pointermove") {
      const { clientX, clientY } = event as PointerEvent
      this.lastPointer = { x: clientX, y: clientY }
    }
    if (this.active) {
      event.stopImmediatePropagation()
      this.suppressClickUntil = performance.now() + this.config.wakeInputGuardMs
      this.stop()
      return
    }
    this.armIdleTimer()
  }

  private armIdleTimer() {
    this.clearIdleTimer()
    if (!this.config.enabled) return
    this.idleTimer = window.setTimeout(() => this.start(), this.idleMs)
  }

  private clearIdleTimer() {
    if (this.idleTimer != null) window.clearTimeout(this.idleTimer)
    this.idleTimer = null
  }

  private cancelFrame() {
    if (this.frameId != null) cancelAnimationFrame(this.frameId)
    this.frameId = null
  }

  private shotDuration(shot: Shot) {
    const { overview, tour } = this.config
    return (
      (shot.kind === "overview"
        ? overview.durationSeconds
        : Math.max(
            tour.secondsPerPoint,
            (this.transitionMs + tour.holdAfterTransitionMs) / 1000,
          )) * 1000
    )
  }

  private beginShot(index: number, now: number) {
    this.shotIndex = index
    this.shotStartedAt = now
    const shot = this.shots[index]
    const previous = this.previous?.shot
    this.transitionMs = this.config.transitionMs
    if (previous?.kind === "point" && shot.kind === "point") {
      const angle = this.fromDirection
        .subVectors(previous.point.position, previous.point.target)
        .angleTo(
          this.toDirection.subVectors(shot.point.position, shot.point.target),
        )
      // Allow extra travel time for large direction changes, especially the back.
      this.transitionMs = Math.max(
        this.config.tour.transitionMs,
        (THREE.MathUtils.radToDeg(angle) /
          this.config.tour.maxDegreesPerSecond) *
          1000,
      )
    }
    this.host.onHighlight(
      shot.kind === "point" ? shot.point.id : 0,
      this.config.tour.highlightFadeMs,
    )
  }

  private frame() {
    if (!this.active) return
    const model = this.host.getModel()
    if (!model) {
      this.stop()
      return
    }
    const now = performance.now()

    let shot = this.shots[this.shotIndex]
    if (now - this.shotStartedAt >= this.shotDuration(shot)) {
      const next = this.shotIndex + 1
      if (next >= this.shots.length && !this.config.loop) {
        this.stop()
        return
      }
      this.previous = { shot, startedAt: this.shotStartedAt }
      this.beginShot(next % this.shots.length, now)
      shot = this.shots[this.shotIndex]
    }

    this.applyModelPose(model, now)

    const shotElapsed = now - this.shotStartedAt
    this.shotPose(shot, shotElapsed, model, this.toPose)
    if (this.previous) {
      this.shotPose(
        this.previous.shot,
        now - this.previous.startedAt,
        model,
        this.fromPose,
      )
    } else {
      this.fromPose.camera.copy(this.enterCamera.camera)
      this.fromPose.target.copy(this.enterCamera.target)
      this.fromPose.up.copy(this.enterCamera.up)
    }
    const blend = smoothstep(
      shotElapsed / (this.previous ? this.transitionMs : this.config.enterMs),
    )
    const { camera, controls } = this.host
    controls.target.lerpVectors(this.fromPose.target, this.toPose.target, blend)
    // Turn around the interpolated target instead of cutting through the model.
    this.fromDirection.subVectors(this.fromPose.camera, this.fromPose.target)
    this.toDirection.subVectors(this.toPose.camera, this.toPose.target)
    const distance = THREE.MathUtils.lerp(
      this.fromDirection.length(),
      this.toDirection.length(),
      blend,
    )
    this.fromDirection.normalize()
    this.toDirection.normalize()
    this.cameraArc.setFromUnitVectors(this.fromDirection, this.toDirection)
    this.blendedArc.identity().slerp(this.cameraArc, blend)
    camera.position
      .copy(this.fromDirection)
      .applyQuaternion(this.blendedArc)
      .multiplyScalar(distance)
      .add(controls.target)
    // Blend orientation as well as position so near-vertical views cannot flip.
    this.fromOrientation.setFromRotationMatrix(
      this.viewMatrix.lookAt(
        this.fromPose.camera,
        this.fromPose.target,
        this.fromPose.up,
      ),
    )
    this.toOrientation.setFromRotationMatrix(
      this.viewMatrix.lookAt(
        this.toPose.camera,
        this.toPose.target,
        this.toPose.up,
      ),
    )
    this.fromOrientation.slerp(this.toOrientation, blend)
    camera.up.set(0, 1, 0).applyQuaternion(this.fromOrientation)
    controls.update()
    this.host.onFrame()
    this.frameId = requestAnimationFrame(this.frame)
  }

  // Constant angular speed after a smooth ramp up from rest
  private spinAngle(elapsedMs: number) {
    const { secondsPerRevolution, direction, rampUpMs } = this.config.spin
    const speed = (2 * Math.PI * direction) / (secondsPerRevolution * 1000)
    const ramp = Math.max(1, rampUpMs)
    return elapsedMs < ramp
      ? (speed * elapsedMs * elapsedMs) / (2 * ramp)
      : speed * (elapsedMs - ramp / 2)
  }

  private applyModelPose(model: THREE.Object3D, now: number) {
    const { restPose } = this.host
    const pivot = this.host.getPivot().multiplyScalar(model.scale.x)
    this.spin.setFromAxisAngle(this.axis, this.spinAngle(now - this.startedAt))
    this.spinQuaternion.copy(restPose.quaternion).multiply(this.spin)
    this.pivotWorld
      .copy(pivot)
      .applyQuaternion(restPose.quaternion)
      .add(restPose.position)
    this.spinPosition
      .copy(this.pivotWorld)
      .sub(this.offset.copy(pivot).applyQuaternion(this.spinQuaternion))

    const blend = smoothstep((now - this.startedAt) / this.config.enterMs)
    model.position.lerpVectors(
      this.enterModel.position,
      this.spinPosition,
      blend,
    )
    model.quaternion.slerpQuaternions(
      this.enterModel.quaternion,
      this.spinQuaternion,
      blend,
    )
    model.updateMatrixWorld(true)
  }

  private shotPose(
    shot: Shot,
    elapsedMs: number,
    model: THREE.Object3D,
    out: CameraPose,
  ) {
    if (shot.kind === "point") {
      out.camera.copy(shot.point.position).applyMatrix4(model.matrixWorld)
      out.target.copy(shot.point.target).applyMatrix4(model.matrixWorld)
      // Use the inscription surface as the orientation reference, including the back.
      const facing = this.offset
        .subVectors(shot.point.position, shot.point.target)
        .dot(this.axis)
      out.up
        .set(0, 0, facing >= 0 ? -1 : 1)
        .transformDirection(model.matrixWorld)
      return
    }
    const { overview } = this.config
    const u = elapsedMs / (overview.durationSeconds * 1000)
    const tilt = THREE.MathUtils.degToRad(
      overview.tiltDeg.min +
        (overview.tiltDeg.max - overview.tiltDeg.min) *
          wave(u, overview.tiltCycles),
    )
    const azimuth = THREE.MathUtils.degToRad(overview.tiltAzimuthDeg)
    const distance =
      this.host.getFitDistance() *
      (overview.distance.far -
        (overview.distance.far - overview.distance.near) *
          wave(u, overview.zoomCycles))
    this.offset
      .set(
        Math.sin(tilt) * Math.cos(azimuth),
        Math.sin(tilt) * Math.sin(azimuth),
        Math.cos(tilt),
      )
      .applyQuaternion(this.axisBasis)
      .applyQuaternion(this.host.restPose.quaternion)
      .multiplyScalar(distance)
    out.up.set(0, 1, 0)
    out.target.copy(this.pivotWorld)
    out.camera.copy(this.pivotWorld).add(this.offset)
  }
}
