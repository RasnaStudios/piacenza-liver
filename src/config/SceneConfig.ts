import * as THREE from "three"

// Scene configuration for positions and animation offsets
export const SceneConfig = {
  // Initial positions
  model: {
    position: new THREE.Vector3(0.2, 0.5, 0),
    rotation: new THREE.Vector3(-1.5, 3.15, 0.0), // Anatomical orientation
    scale: 1.0,
  },

  camera: {
    initial: new THREE.Vector3(0, 2, 10),
  },

  // Animation offsets (added to initial positions)
  animation: {
    camera: {
      landscape: {
        positionOffset: new THREE.Vector3(0, 2, -7), // Move up and closer
        targetOffset: new THREE.Vector3(0, -1, -1.5),
      },
      portrait: {
        positionOffset: new THREE.Vector3(0, 3, -4), // Move up and closer
        targetOffset: new THREE.Vector3(0, 0, 0),
      },
      duration: 1500,
    },
  },

  // Lighting configuration
  lighting: {
    lightColor: 0xfff8e7, // Warm white light
    ambientColor: 0x7a6b5a, // Warm ambient light for blending
    intensityMultiplier: 1.0, // Global intensity multiplier
    shadowMapSize: 1024, // Shadow map resolution
    shadowBias: -0.0001, // Shadow bias to prevent acne
    shadowNormalBias: 0.02, // Additional shadow bias
    shadowRadius: 8, // Shadow softness radius
  },

  // Performance and interaction configuration
  performance: {
    raycastThrottleMs: 10, // Throttle raycast and mouse updates to 1/X*1000 fps
    mouseMoveThreshold: 5, // Skip raycast if mouse moved less than X pixels
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
