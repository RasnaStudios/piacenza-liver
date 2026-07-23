import * as THREE from "three"
import { SceneConfig } from "../config/SceneConfig"

export function getIntroPose() {
  const aspect = window.innerWidth / window.innerHeight
  const minAspect = 1
  const maxAspect = 2.4
  const clamped = Math.min(Math.max(aspect, minAspect), maxAspect)
  const t = (clamped - minAspect) / (maxAspect - minAspect)
  const targetX = 4 + t * 4
  const position = SceneConfig.camera.lateral.clone()
  position.x += t * 5
  return {
    position,
    target: new THREE.Vector3(targetX, 0, 0),
  }
}
