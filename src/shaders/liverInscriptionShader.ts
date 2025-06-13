export const liverInscriptionVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const liverInscriptionFragmentShader = `
  uniform sampler2D diffuseTexture;
  uniform sampler2D maskTexture;
  uniform float time;
  uniform int hoveredInscription;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Color palette for different inscription groups
  vec3 getInscriptionColor(int inscriptionId) {
    if (inscriptionId >= 1 && inscriptionId <= 4) {
      return vec3(0.5, 0.8, 1.0); // Sky blue
    } else if (inscriptionId >= 5 && inscriptionId <= 8) {
      return vec3(0.0, 0.8, 0.8); // Teal water
    } else if (inscriptionId >= 9 && inscriptionId <= 12) {
      return vec3(0.6, 0.4, 0.2); // Brown earth
    } else if (inscriptionId >= 13 && inscriptionId <= 16) {
      return vec3(0.5, 0.5, 0.0); // Olive underworld
    } else if (inscriptionId >= 17 && inscriptionId <= 20) {
      return vec3(1.0, 0.2, 0.2); // Red (Pars Familiaris)
    } else if (inscriptionId >= 21 && inscriptionId <= 22) {
      return vec3(0.2, 0.8, 0.6); // Blue-green (remaining)
    }
    return vec3(1.0, 1.0, 1.0); // Default white
  }
  
  // Function to detect borders by sampling neighboring pixels
  float detectBorder(vec2 uv, float pixelSize) {
    float centerId = texture2D(maskTexture, vec2(uv.x, 1.0 - uv.y)).r * 255.0;
    
    // Sample 8 neighboring pixels
    float neighbors[8];
    neighbors[0] = texture2D(maskTexture, vec2(uv.x - pixelSize, 1.0 - (uv.y - pixelSize))).r * 255.0; // top-left
    neighbors[1] = texture2D(maskTexture, vec2(uv.x, 1.0 - (uv.y - pixelSize))).r * 255.0; // top
    neighbors[2] = texture2D(maskTexture, vec2(uv.x + pixelSize, 1.0 - (uv.y - pixelSize))).r * 255.0; // top-right
    neighbors[3] = texture2D(maskTexture, vec2(uv.x - pixelSize, 1.0 - uv.y)).r * 255.0; // left
    neighbors[4] = texture2D(maskTexture, vec2(uv.x + pixelSize, 1.0 - uv.y)).r * 255.0; // right
    neighbors[5] = texture2D(maskTexture, vec2(uv.x - pixelSize, 1.0 - (uv.y + pixelSize))).r * 255.0; // bottom-left
    neighbors[6] = texture2D(maskTexture, vec2(uv.x, 1.0 - (uv.y + pixelSize))).r * 255.0; // bottom
    neighbors[7] = texture2D(maskTexture, vec2(uv.x + pixelSize, 1.0 - (uv.y + pixelSize))).r * 255.0; // bottom-right
    
    // Check if any neighbor has a different ID (indicating a border)
    float borderStrength = 0.0;
    for (int i = 0; i < 8; i++) {
      if (abs(neighbors[i] - centerId) > 0.5) {
        borderStrength = 1.0;
        break;
      }
    }
    
    return borderStrength;
  }
  
  void main() {
    // Sample the diffuse texture
    vec4 diffuseColor = texture2D(diffuseTexture, vUv);
    
    // Sample the mask texture to get inscription ID
    // Flip Y coordinate to match texture orientation
    vec2 maskUv = vec2(vUv.x, 1.0 - vUv.y);
    vec4 maskColor = texture2D(maskTexture, maskUv);
    
    // More precise conversion from grayscale to inscription ID
    float grayValue = maskColor.r;
    int inscriptionId = int(grayValue * 255.0 + 0.5);
    
    vec3 finalColor = diffuseColor.rgb;
    
    // Calculate pixel size for border detection (assuming 2048x2048 texture)
    float pixelSize = 1.0 / 2048.0;
    
    // Detect borders
    float borderStrength = detectBorder(vUv, pixelSize);
    
    // Apply border blur effect
    if (borderStrength > 0.0 && inscriptionId > 0 && inscriptionId <= 40) {
      // Get the region color for the border
      vec3 regionColor = getInscriptionColor(inscriptionId);
      
      // Create a glowing border effect with 30% opacity
      float glow = sin(time * 3.0) * 0.3 + 0.7;
      vec3 borderColor = mix(regionColor, vec3(1.0, 1.0, 1.0), 0.3);
      finalColor = mix(finalColor, borderColor, borderStrength * glow * 0.18); // Reduced to 0.18 (30% opacity)
    }
    
    // Only apply hover effect to the exact inscription being hovered
    // Use strict equality and ensure we're in valid range
    if (inscriptionId > 0 && inscriptionId <= 40 && inscriptionId == hoveredInscription) {
      // Get the group color for this inscription
      vec3 groupColor = getInscriptionColor(inscriptionId);
      
      // Create shimmer effect using the group color with 30% opacity
      float shimmer = sin(time * 8.0) * 0.3 + 0.7;
      vec3 shimmerColor = mix(groupColor, vec3(1.0, 1.0, 1.0), 0.5);
      finalColor = mix(finalColor, shimmerColor, shimmer * 0.21); // Reduced to 0.21 (30% opacity)
      
      // Add pulsing glow using group color with 30% opacity
      float pulse = sin(time * 4.0) * 0.2 + 0.8;
      finalColor = mix(finalColor, finalColor * pulse, 0.3); // 30% opacity for pulse effect
      
      // Add region color overlay with 30% opacity
      finalColor = mix(finalColor, groupColor, 0.12); // Reduced to 0.12 (30% opacity)
      
      // Make hovered regions bright but maintain group color with 30% opacity
      finalColor = mix(finalColor, groupColor * 1.5, 0.18); // Reduced to 0.18 (30% opacity)
    }
    
    gl_FragColor = vec4(finalColor, diffuseColor.a);
  }
`

import * as THREE from 'three'

export interface LiverShaderUniforms extends Record<string, THREE.IUniform> {
  diffuseTexture: { value: THREE.Texture | null }
  maskTexture: { value: THREE.Texture | null }
  time: { value: number }
  hoveredInscription: { value: number }
}