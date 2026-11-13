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
    cameraDistance: 1.2, // model-space distance from inscription center
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
    lightColor: 0xffe3e2, // Warm light
    ambientColor: 0x9c7a5e, // Warm ambient light for blending
    intensityMultiplier: 2.0,
    ambientIntensityMul: 1.92,
    keyLightIntensity: 70,
    // Shadow map resolution. 4096² = 64MB GPU memory + slow soft-shadow taps.
    // 2048² is visually indistinguishable here because the scene is dim and
    // the shadow is heavily blurred by `shadowRadius`. Saves ~48MB GPU.
    shadowMapSize: 2048,
    shadowBias: -0.0001, // Shadow bias to prevent acne
    shadowNormalBias: 0.02, // Additional shadow bias
    shadowRadius: 8, // Shadow softness radius
    cameraFillIntensity: 5.2,
    cameraFillIntensityClose: 1.62,
    cameraFillDistanceMin: 2, // Camera distance where intensity is at minimum
    cameraFillDistanceMax: 8, // Camera distance where intensity is at maximum
    cameraFillDistance: 8,
    cameraFillAngle: Math.PI / 2.95,
    cameraFillPenumbra: 1,
    cameraFillTargetDistance: 3,
  },

  // Material configuration
  material: {
    metalness: 0.82,
    roughness: 1.0,
    aoMapIntensity: 1.0,
    flatShading: false,
    // Negative Y converts DirectX normal map format (Unreal) to OpenGL (Three.js)
    normalScale: new THREE.Vector2(1.0, -1.0),
    textureAnisotropy: 1,
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
    fadeMs: 600, // Cross-fade whenever selection changes
  },

  // Slow idle overview and inscription tour. Override idle time with ?idle=SECONDS.
  screensaver: {
    enabled: true,
    idleSeconds: 300,
    pointerMoveThresholdPx: 4,
    wakeInputGuardMs: 1000,
    // Interest point the spin axis passes through; null uses the model center
    pivotPointId: null as number | null,
    loop: true,
    // Blend from the current view into the screensaver
    enterMs: 6000,
    // Camera move from one view (wide view or point) to the next
    transitionMs: 9000,
    spin: {
      // Model-space axis the object spins around (through the pivot)
      axis: [0, 1, 0] as [number, number, number],
      secondsPerRevolution: 240,
      direction: 1 as 1 | -1, // 1 counterclockwise as seen from the camera, -1 clockwise
      rampUpMs: 8000, // time to reach full speed from rest
    },
    overview: {
      durationSeconds: 90,
      // Camera tilt away from the spin axis (degrees), oscillating between min and max
      tiltDeg: { min: 12, max: 22 },
      tiltCycles: 1,
      // Side of the object the camera leans toward (degrees around the spin axis)
      // Lean toward the default camera side to avoid crossing the camera-up pole.
      tiltAzimuthDeg: 98,
      // Distance from the pivot as a multiple of the distance that fits the whole object on screen
      distance: { near: 0.85, far: 1.0 },
      zoomCycles: 1,
    },
    tour: {
      pointIds: "all" as "all" | number[],
      // Time on each point, including the camera move toward it
      secondsPerPoint: 4,
      highlightFadeMs: 3000,
      transitionMs: 3000,
      holdAfterTransitionMs: 1000,
      maxDegreesPerSecond: 12,
    },
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
