// Note: This file is no longer used - inscription logic now handled directly
// in LiverModel.ts using onBeforeCompile for better glTF material compatibility

import { liverGroups } from '../scene/LiverData'

function hexToVec3(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`
}

export function generateInscriptionColorFunction(): string {
  let glslFunction = 'vec3 getInscriptionColor(int inscriptionId) {\n'
  
  for (const [, group] of Object.entries(liverGroups)) {
    const positions = group.positions
    const minPos = Math.min(...positions)
    const maxPos = Math.max(...positions)
    const colorVec = hexToVec3(group.color)
    
    glslFunction += `  if (inscriptionId >= ${minPos} && inscriptionId <= ${maxPos}) {\n`
    glslFunction += `    return ${colorVec}; // ${group.name} (${group.color})\n`
    glslFunction += `  }\n`
  }
  
  glslFunction += '  return vec3(1.0, 1.0, 1.0); // Default white\n'
  glslFunction += '}'
  
  return glslFunction
}