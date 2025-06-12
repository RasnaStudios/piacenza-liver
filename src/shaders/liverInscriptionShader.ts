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
  
  void main() {
    // Sample the diffuse texture
    vec4 diffuseColor = texture2D(diffuseTexture, vUv);
    
    // Sample the mask texture to get inscription ID
    vec2 maskUv = vec2(vUv.x, 1.0 - vUv.y); // Flip Y coordinate
    vec4 maskColor = texture2D(maskTexture, maskUv);
    int inscriptionId = int(maskColor.r * 255.0 + 0.5); // Use only red channel as grayscale
    
    vec3 finalColor = diffuseColor.rgb;
    
    // Add hover effect with golden shimmer for the entire region
    if (inscriptionId > 0 && inscriptionId <= 22 && inscriptionId == hoveredInscription) {
      float shimmer = sin(time * 8.0) * 0.3 + 0.7;
      vec3 goldColor = vec3(1.0, 0.8, 0.2);
      finalColor = mix(finalColor, goldColor, shimmer * 0.5);
      
      // Add pulsing glow
      float pulse = sin(time * 4.0) * 0.2 + 0.8;
      finalColor *= pulse;
      
      // Add region color overlay
      vec3 regionColor = getInscriptionColor(inscriptionId);
      finalColor = mix(finalColor, regionColor, 0.3);
      
      // Debug: make hovered regions very bright to ensure visibility
      finalColor = mix(finalColor, vec3(1.0, 1.0, 0.0), 0.5);
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