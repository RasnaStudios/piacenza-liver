import * as THREE from "three"

// Scene configuration for positions and animation offsets
export const SceneConfig = {
  // Initial positions
  model: {
    position: new THREE.Vector3(0.2, 0.5, 0),
    rotation: new THREE.Vector3(0.15, 3.0, 0.0), // Anatomical orientation
    scale: 1.0,
  },

  inscriptions: {
    cameraDistance: 1, // model-space distance from inscription center
  },

  camera: {
    lateral: new THREE.Vector3(5, 20, 20), // Camera position for "About" mode (liver on the side)
    initial: new THREE.Vector3(0, 2, 10), // Starting camera position
    final: {
      // Final camera positions reached after close-up animation
      landscape: new THREE.Vector3(0, 4, 3), // initial + landscape offset
      portrait: new THREE.Vector3(0, 6, 10), // initial + portrait offset
    },
    animationDuration: 1800, // Animation duration in milliseconds
  },

  // Lighting configuration
  lighting: {
    lightColor: 0xfff8e7, // Warm white light
    ambientColor: 0x7a6b5a, // Warm ambient light for blending
    intensityMultiplier: 0.95, // Global intensity multiplier
    keyLightIntensity: 135, // Main spotlight intensity
    shadowMapSize: 4096, // Shadow map resolution
    shadowBias: -0.0001, // Shadow bias to prevent acne
    shadowNormalBias: 0.02, // Additional shadow bias
    shadowRadius: 8, // Shadow softness radius
    cameraFillIntensity: 2.5, // Soft camera-attached fill
    cameraFillDistance: 6,
    cameraFillAngle: Math.PI / 4,
    cameraFillPenumbra: 0.9,
    cameraFillTargetDistance: 3,
  },

  // Performance and interaction configuration
  performance: {
    raycastThrottleMs: 7, // Throttle raycast and mouse updates to 1/X*1000 fps (lower = faster)
    mouseMoveThreshold: 5, // Skip raycast if mouse moved less than X pixels
  },

  // UI timing configuration
  ui: {
    aboutFadeDuration: 500,
    aboutExitDuration: 500,
  },

  // Highlight rendering configuration
  highlight: {
    alphaCutoff: 0.03, // Higher values = crisper highlight edges (less dilution)
    selectedOpacity: 0.3,
    hoveredOpacity: 0.2,
  },

  // Pulse animation configuration
  pulse: {
    trailSpeed: 80, // milliseconds between each inscription (lower = faster)
    trailDuration: 400, // how long each inscription stays lit (milliseconds)
    finalPulseDelay: 200, // extra delay before final pulse (milliseconds)
    individualFadeDuration: 0.1, // duration of individual inscription fade (seconds)

    // Final pulse - simple light pulse effect
    finalPulse: {
      riseDuration: 1.2, // slow rise to peak (seconds)
      fallDuration: 1.0, // slow fall from peak (seconds)
      peakOpacity: 0.4, // peak brightness
    },

    // Color animation phases
    trailColor: {
      startOpacity: 0.6, // initial opacity when inscription lights up
      highlightOpacity: 0.4, // highlight intensity for trail inscriptions
    },

    finalColor: {
      startOpacity: 0.0, // initial opacity for final pulse inscriptions
      highlightOpacity: 0.4, // highlight intensity for final pulse inscriptions
    },
  },
}
