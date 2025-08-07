import * as THREE from 'three'

// Note: Shader exports removed - inscription logic now handled in LiverModel.ts 
// using onBeforeCompile for better glTF material compatibility

export interface LiverShaderUniforms extends Record<string, THREE.IUniform> {
  diffuseTexture: { value: THREE.Texture | null }
  normalTexture: { value: THREE.Texture | null }
  maskTexture: { value: THREE.Texture | null }
  time: { value: number }
  hoveredInscription: { value: number }
}