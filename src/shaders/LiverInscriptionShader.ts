import * as THREE from 'three'
import vertexShader from './liver-inscription.vert?raw'
import fragmentShaderTemplate from './liver-inscription.frag.template?raw'
import { generateInscriptionColorFunction } from './generateShader'

export const liverInscriptionVertexShader = vertexShader

export const liverInscriptionFragmentShader = fragmentShaderTemplate.replace(
  '{{INSCRIPTION_COLOR_FUNCTION}}',
  generateInscriptionColorFunction()
)

export interface LiverShaderUniforms extends Record<string, THREE.IUniform> {
  diffuseTexture: { value: THREE.Texture | null }
  normalTexture: { value: THREE.Texture | null }
  maskTexture: { value: THREE.Texture | null }
  time: { value: number }
  hoveredInscription: { value: number }
}