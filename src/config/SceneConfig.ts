import * as THREE from 'three'

// Scene configuration for positions and animation offsets
export const SceneConfig = {
  // Initial positions
  model: {
    position: new THREE.Vector3(0.2, 1.5, 0),
    rotation: new THREE.Vector3(-1.500, 3.150, 0.000), // Anatomical orientation
    scale: 1.0
  },
  
  camera: {
    initial: new THREE.Vector3(0, 2, 10),
    target: new THREE.Vector3(0, 0, 0)  // Where the camera looks at (pan control)
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
      duration: 1500
    }
  },

  // Mobile-specific offset for inscription interactions
  cameraOffset: {
    mobile: {
      positionOffset: new THREE.Vector3(0.0, 0.5, 0.5),
      targetOffset: new THREE.Vector3(0.0, 0.5, 0.5),
    },
    desktop: {
      positionOffset: new THREE.Vector3(0.0, 0.0, 0.0),
      targetOffset: new THREE.Vector3(0.0, 0.0, 0.0),
    }
  },
  
  // Reset animation duration
  reset: {
    duration: 800
  }
}