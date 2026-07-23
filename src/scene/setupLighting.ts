import * as THREE from "three"
import { SceneConfig } from "../config/SceneConfig"

export function setupLighting(scene: THREE.Scene) {
  const config = SceneConfig.lighting

  // Key light - spotlight for dramatic shadows on floor
  const keyLight = new THREE.SpotLight(
    config.lightColor,
    config.keyLightIntensity * config.intensityMultiplier,
  )
  keyLight.position.set(0, 6, 3)
  keyLight.target.position.set(0, 0, 0)
  keyLight.angle = Math.PI / 6 // Narrower spotlight (30 degrees instead of 60)
  keyLight.penumbra = 0.95
  keyLight.decay = 2
  keyLight.distance = 15
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = config.shadowMapSize
  keyLight.shadow.mapSize.height = config.shadowMapSize
  keyLight.shadow.camera.near = 0.1
  keyLight.shadow.camera.far = 15
  keyLight.shadow.camera.fov = 45
  keyLight.shadow.bias = config.shadowBias
  keyLight.shadow.normalBias = config.shadowNormalBias
  keyLight.shadow.radius = config.shadowRadius
  scene.add(keyLight)
  scene.add(keyLight.target)

  // Extremely subtle dust particles
  const particleCount = 40
  const particleGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const height = Math.random() * 6
    const radius = (height / 6) * 1.8 * Math.random()
    const angle = Math.random() * Math.PI * 2

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = 6 - height
    positions[i3 + 2] = Math.sin(angle) * radius + 1.5

    velocities[i3] = (Math.random() - 0.5) * 0.0005
    velocities[i3 + 1] = -Math.random() * 0.0003
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.0005
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  )
  particleGeometry.setAttribute(
    "velocity",
    new THREE.BufferAttribute(velocities, 3),
  )

  const particleMaterial = new THREE.PointsMaterial({
    color: config.lightColor,
    size: 0.005,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)

  // Minimal ambient light for dramatic museum effect
  const ambientLight = new THREE.AmbientLight(
    config.ambientColor,
    config.ambientIntensityMul * config.intensityMultiplier,
  )
  scene.add(ambientLight)

  // Museum floor plane. The original was 5000×5000 — but the shadow camera
  // only covers ~30 units of radius, the spot light range is 15 units, and
  // the scene fog (0x000000 0.03) makes anything past ~50 units fade to black.
  // 100×100 is more than enough and is visually identical, while saving the
  // GPU from rasterizing a giant clipped polygon.
  const floorGeometry = new THREE.PlaneGeometry(100, 100)
  const floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x222222,
    transparent: false,
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, -3.0, 0)
  floor.receiveShadow = true
  // Floor is static — let the renderer skip its matrix update each frame.
  floor.matrixAutoUpdate = false
  floor.updateMatrix()
  scene.add(floor)
}
