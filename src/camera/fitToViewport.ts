import * as THREE from "three"

export function getFitDistance(
  camera: THREE.PerspectiveCamera,
  sphere: THREE.Sphere,
): number {
  const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
  return sphere.radius / (Math.tan(halfFov) * Math.min(camera.aspect, 1))
}
