// Run with pnpm exec tsx scripts/check-screensaver.ts.
import assert from "node:assert/strict"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { Screensaver } from "../src/camera/Screensaver"
import { SceneConfig } from "../src/config/SceneConfig"
import { liverInscriptions } from "../src/scene/LiverData"

let now = 0
let timer: (() => void) | undefined
let frame: (() => void) | undefined
let idleMs = 0
const listeners = new Map<string, EventListener>()
Object.defineProperty(globalThis, "performance", { value: { now: () => now } })
Object.assign(globalThis, {
  window: {
    location: { search: "?idle=5" },
    setTimeout: (callback: () => void, ms: number) => {
      timer = callback
      idleMs = ms
      return 1
    },
    clearTimeout: () => { timer = undefined },
    addEventListener: (type: string, callback: EventListener) => listeners.set(type, callback),
    removeEventListener: (type: string) => listeners.delete(type),
  },
  requestAnimationFrame: (callback: () => void) => { frame = callback; return 1 },
  cancelAnimationFrame: () => { frame = undefined },
})
const highlights: number[] = []
const model = new THREE.Object3D()
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
const controls = { target: new THREE.Vector3(), update: () => {} } as OrbitControls
let stops = 0
const saver = new Screensaver({
  camera, controls,
  getModel: () => model,
  restPose: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() },
  getPivot: () => new THREE.Vector3(),
  getFitDistance: () => 5,
  getPoints: () => [1, 2].map(id => ({ id, position: new THREE.Vector3(id, 2, 0), target: new THREE.Vector3(id, 0, 0) })),
  onStart: () => {}, onHighlight: id => highlights.push(id),
  onStop: () => { stops++ }, onFrame: () => {},
}, SceneConfig.screensaver)
assert.equal(idleMs, 5000)
timer?.()
assert(saver.isActive)
now = SceneConfig.screensaver.overview.durationSeconds * 1000
frame?.()
now += Math.max(SceneConfig.screensaver.tour.secondsPerPoint * 1000, SceneConfig.screensaver.transitionMs + SceneConfig.screensaver.tour.holdAfterTransitionMs)
frame?.()
assert.deepEqual(highlights, [0, 1, 2])
assert(Number.isFinite(camera.position.length()))
// After each transition the camera pose stays attached to the spinning model.
now += SceneConfig.screensaver.tour.transitionMs
frame?.()
assert(controls.target.distanceTo(new THREE.Vector3(2, 0, 0).applyMatrix4(model.matrixWorld)) < 1e-9)
const before = model.quaternion.clone()
now += 500
frame?.()
const angularStep = before.angleTo(model.quaternion)
assert(Math.abs(angularStep - Math.PI / SceneConfig.screensaver.spin.secondsPerRevolution) < 1e-9)
now += SceneConfig.screensaver.tour.holdAfterTransitionMs
frame?.()
assert.deepEqual(highlights, [0, 1, 2, 0])
const move = (x: number) => listeners.get("pointermove")?.({ type: "pointermove", clientX: x, clientY: 0, stopImmediatePropagation: () => {} } as unknown as PointerEvent)
move(0)
move(4)
assert(saver.isActive)
move(5)
assert(!saver.isActive)
assert.equal(stops, 1)
let consumedClick = false
listeners.get("click")?.({ type: "click", stopImmediatePropagation: () => { consumedClick = true } } as unknown as Event)
assert(consumedClick)
assert(timer)
for (const type of ["pointerdown", "wheel", "keydown", "touchstart"]) {
  timer?.()
  assert(saver.isActive)
  listeners.get(type)?.({ type, stopImmediatePropagation: () => {} } as unknown as Event)
  assert(!saver.isActive)
  assert(timer)
}
saver.dispose()
assert.equal(listeners.size, 0)
assert.equal(frame, undefined)
assert.equal(timer, undefined)
console.log("Screensaver tour, idle override, input threshold, stop and cleanup passed")

// Sample the real camera controller during entry to catch camera-up pole flips.
now = 0
const entryCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
entryCamera.position.copy(SceneConfig.camera.final.portrait)
const entryControls = new OrbitControls(entryCamera, null)
entryControls.target.copy(SceneConfig.model.position)
entryControls.update()
const entryModel = new THREE.Object3D()
entryModel.position.copy(SceneConfig.model.position)
entryModel.rotation.setFromVector3(SceneConfig.model.rotation)
const tourHighlights: number[] = []
const entrySaver = new Screensaver({
  camera: entryCamera, controls: entryControls,
  getModel: () => entryModel,
  restPose: { position: entryModel.position.clone(), quaternion: entryModel.quaternion.clone() },
  getPivot: () => new THREE.Vector3(), getFitDistance: () => 5,
  getPoints: () => liverInscriptions.map(point => ({
    id: point.id, target: point.cameraTarget.clone(),
    position: point.cameraPosition.clone().sub(point.cameraTarget).setLength(SceneConfig.inscriptions.cameraDistance).add(point.cameraTarget),
  })), onStart: () => {}, onHighlight: id => tourHighlights.push(id),
  onStop: () => {}, onFrame: () => {},
}, SceneConfig.screensaver)
entrySaver.start()
let previousRotation = entryCamera.quaternion.clone()
for (now = 0; now <= 1000000 && tourHighlights.length <= liverInscriptions.length + 1; now += 1000 / 60) {
  frame?.()
  assert(previousRotation.angleTo(entryCamera.quaternion) < 0.05, `Camera orientation jumped at ${now} ms`)
  previousRotation = entryCamera.quaternion.clone()
}
assert.deepEqual(tourHighlights, [0, ...liverInscriptions.map(point => point.id), 0])
entrySaver.dispose()
console.log("Entry and all 42 inscription transitions passed without orientation jumps")
