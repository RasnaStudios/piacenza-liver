import * as THREE from 'three'

// Helper function to convert UV coordinates to world position on mesh surface
export function getWorldPositionFromUV(mesh: THREE.Mesh, uv: THREE.Vector2): THREE.Vector3 | null {
  const geometry = mesh.geometry
  if (!geometry || !geometry.attributes.position || !geometry.attributes.uv) {
    console.error('Missing geometry attributes for UV-to-world conversion')
    return null
  }
  
  const positions = geometry.attributes.position.array as Float32Array
  const uvs = geometry.attributes.uv.array as Float32Array
  const indices = geometry.index?.array
  
  let bestMatch: {
    distance: number,
    worldPosition: THREE.Vector3
  } | null = null
  
  if (indices) {
    // Indexed geometry - check each triangle
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i]
      const i2 = indices[i + 1] 
      const i3 = indices[i + 2]
      
      // Get UV coordinates for this triangle
      const uv1 = new THREE.Vector2(uvs[i1 * 2], uvs[i1 * 2 + 1])
      const uv2 = new THREE.Vector2(uvs[i2 * 2], uvs[i2 * 2 + 1])
      const uv3 = new THREE.Vector2(uvs[i3 * 2], uvs[i3 * 2 + 1])
      
      // Check if our UV point is inside this triangle
      const baryCoords = getBarycentricCoordinates(uv, uv1, uv2, uv3)
      
      if (baryCoords && isInsideTriangle(baryCoords)) {
        // Point is inside triangle - calculate exact world position using barycentric interpolation
        const pos1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2])
        const pos2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2])
        const pos3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2])
        
        // Interpolate world position using barycentric coordinates
        const worldPos = pos1.clone().multiplyScalar(baryCoords.x)
          .add(pos2.clone().multiplyScalar(baryCoords.y))
          .add(pos3.clone().multiplyScalar(baryCoords.z))
        
        // Transform to world space
        worldPos.applyMatrix4(mesh.matrixWorld)
        return worldPos
      }
      
      // Point is outside triangle - calculate distance to triangle center
      const triangleCenterUV = uv1.clone().add(uv2).add(uv3).multiplyScalar(1/3)
      const distance = uv.distanceTo(triangleCenterUV)
      
      if (!bestMatch || distance < bestMatch.distance) {
        // Calculate triangle center in world space
        const pos1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2])
        const pos2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2])
        const pos3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2])
        
        const worldPos = pos1.clone().add(pos2).add(pos3).multiplyScalar(1/3)
        worldPos.applyMatrix4(mesh.matrixWorld)
        
        bestMatch = { distance, worldPosition: worldPos }
      }
    }
  } else {
    // Non-indexed geometry - process vertices directly
    let minDistance = Infinity
    let closestVertex = 0
    
    // Find the closest vertex by UV distance
    for (let i = 0; i < positions.length / 3; i++) {
      const vertexUV = new THREE.Vector2(uvs[i * 2], uvs[i * 2 + 1])
      const distance = uv.distanceTo(vertexUV)
      
      if (distance < minDistance) {
        minDistance = distance
        closestVertex = i
      }
    }
    
    if (minDistance < Infinity) {
      // Get the world position of the closest vertex
      const vertexPos = new THREE.Vector3(
        positions[closestVertex * 3],
        positions[closestVertex * 3 + 1],
        positions[closestVertex * 3 + 2]
      )
      
      // Transform to world space
      vertexPos.applyMatrix4(mesh.matrixWorld)
      return vertexPos
    }
  }
  
  return bestMatch?.worldPosition || null
}

// Helper function to calculate barycentric coordinates
function getBarycentricCoordinates(p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2): THREE.Vector3 | null {
  const v0 = b.clone().sub(a)
  const v1 = c.clone().sub(a)
  const v2 = p.clone().sub(a)
  
  const d00 = v0.dot(v0)
  const d01 = v0.dot(v1)
  const d11 = v1.dot(v1)
  const d20 = v2.dot(v0)
  const d21 = v2.dot(v1)
  
  const denom = d00 * d11 - d01 * d01
  if (Math.abs(denom) < 1e-10) return null
  
  const v = (d11 * d20 - d01 * d21) / denom
  const w = (d00 * d21 - d01 * d20) / denom
  const u = 1.0 - v - w
  
  return new THREE.Vector3(u, v, w)
}

// Helper function to check if point is inside triangle
function isInsideTriangle(baryCoords: THREE.Vector3): boolean {
  return baryCoords.x >= 0 && baryCoords.y >= 0 && baryCoords.z >= 0 && 
         Math.abs(baryCoords.x + baryCoords.y + baryCoords.z - 1) < 1e-6
}

// Helper function to get surface normal at UV position
export function getSurfaceNormalAtUV(mesh: THREE.Mesh, uv: THREE.Vector2): THREE.Vector3 | null {
  const geometry = mesh.geometry
  if (!geometry || !geometry.attributes.normal || !geometry.attributes.uv) {
    console.error('Missing geometry attributes for normal calculation')
    return null
  }
  
  const normals = geometry.attributes.normal.array as Float32Array
  const uvs = geometry.attributes.uv.array as Float32Array
  const indices = geometry.index?.array
  
  if (indices) {
    // Indexed geometry - find triangle containing UV point
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i]
      const i2 = indices[i + 1] 
      const i3 = indices[i + 2]
      
      // Get UV coordinates for this triangle
      const uv1 = new THREE.Vector2(uvs[i1 * 2], uvs[i1 * 2 + 1])
      const uv2 = new THREE.Vector2(uvs[i2 * 2], uvs[i2 * 2 + 1])
      const uv3 = new THREE.Vector2(uvs[i3 * 2], uvs[i3 * 2 + 1])
      
      // Check if our UV point is inside this triangle
      const baryCoords = getBarycentricCoordinates(uv, uv1, uv2, uv3)
      
      if (baryCoords && isInsideTriangle(baryCoords)) {
        // Interpolate normal using barycentric coordinates
        const normal1 = new THREE.Vector3(normals[i1 * 3], normals[i1 * 3 + 1], normals[i1 * 3 + 2])
        const normal2 = new THREE.Vector3(normals[i2 * 3], normals[i2 * 3 + 1], normals[i2 * 3 + 2])
        const normal3 = new THREE.Vector3(normals[i3 * 3], normals[i3 * 3 + 1], normals[i3 * 3 + 2])
        
        const interpolatedNormal = normal1.clone().multiplyScalar(baryCoords.x)
          .add(normal2.clone().multiplyScalar(baryCoords.y))
          .add(normal3.clone().multiplyScalar(baryCoords.z))
          .normalize()
        
        // Transform to world space
        interpolatedNormal.transformDirection(mesh.matrixWorld)
        return interpolatedNormal
      }
    }
  }
  
  // Fallback: find closest vertex and use its normal
  let minDistance = Infinity
  let closestVertex = 0
  
  for (let i = 0; i < normals.length / 3; i++) {
    const vertexUV = new THREE.Vector2(uvs[i * 2], uvs[i * 2 + 1])
    const distance = uv.distanceTo(vertexUV)
    
    if (distance < minDistance) {
      minDistance = distance
      closestVertex = i
    }
  }
  
  if (minDistance < Infinity) {
    const normal = new THREE.Vector3(
      normals[closestVertex * 3],
      normals[closestVertex * 3 + 1],
      normals[closestVertex * 3 + 2]
    )
    normal.transformDirection(mesh.matrixWorld)
    return normal
  }
  
  return null
}

// Get all triangles and their areas that belong to a specific inscription
export function getInscriptionGeometry(
  mesh: THREE.Mesh,
  inscriptionId: number,
  maskTexture: THREE.Texture
): { triangles: Array<{vertices: THREE.Vector3[], normal: THREE.Vector3, area: number}>, totalArea: number } {
  const geometry = mesh.geometry
  if (!geometry || !geometry.attributes.position || !geometry.attributes.uv) {
    return { triangles: [], totalArea: 0 }
  }

  const positions = geometry.attributes.position.array as Float32Array
  const uvs = geometry.attributes.uv.array as Float32Array
  const indices = geometry.index?.array
  const triangles: Array<{vertices: THREE.Vector3[], normal: THREE.Vector3, area: number}> = []
  let totalArea = 0

  // Get texture data for sampling
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx || !maskTexture.image) return { triangles: [], totalArea: 0 }
  
  canvas.width = maskTexture.image.width
  canvas.height = maskTexture.image.height
  ctx.drawImage(maskTexture.image, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const textureData = imageData.data

  const sampleInscriptionAtUV = (u: number, v: number): number => {
    const x = Math.floor(u * canvas.width)
    const y = Math.floor(v * canvas.height)
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return 0
    const index = (y * canvas.width + x) * 4
    return textureData[index] // Red channel contains inscription ID
  }

  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i]
      const i2 = indices[i + 1]
      const i3 = indices[i + 2]

      // Get UV coordinates for triangle vertices
      const uv1 = new THREE.Vector2(uvs[i1 * 2], uvs[i1 * 2 + 1])
      const uv2 = new THREE.Vector2(uvs[i2 * 2], uvs[i2 * 2 + 1])
      const uv3 = new THREE.Vector2(uvs[i3 * 2], uvs[i3 * 2 + 1])

      // Sample multiple points across the triangle to check if it belongs to inscription
      const samples = [
        uv1, uv2, uv3, // Vertices
        uv1.clone().add(uv2).multiplyScalar(0.5), // Edge midpoints
        uv2.clone().add(uv3).multiplyScalar(0.5),
        uv3.clone().add(uv1).multiplyScalar(0.5),
        uv1.clone().add(uv2).add(uv3).multiplyScalar(1/3) // Centroid
      ]

      const inscriptionSamples = samples.filter(uv => sampleInscriptionAtUV(uv.x, uv.y) === inscriptionId)
      
      // If majority of samples belong to this inscription, include the triangle
      if (inscriptionSamples.length >= samples.length * 0.5) {
        const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2])
        const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2])
        const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2])
        
        // Transform to world coordinates
        v1.applyMatrix4(mesh.matrixWorld)
        v2.applyMatrix4(mesh.matrixWorld)
        v3.applyMatrix4(mesh.matrixWorld)

        // Calculate triangle normal and area
        const edge1 = v2.clone().sub(v1)
        const edge2 = v3.clone().sub(v1)
        const normal = edge1.clone().cross(edge2).normalize()
        const area = edge1.cross(edge2).length() * 0.5

        triangles.push({ vertices: [v1, v2, v3], normal, area })
        totalArea += area
      }
    }
  }

  return { triangles, totalArea }
}

// Calculate average normal weighted by triangle area
export function calculateAverageNormal(triangles: Array<{normal: THREE.Vector3, area: number}>, totalArea: number): THREE.Vector3 {
  const averageNormal = new THREE.Vector3(0, 0, 0)
  
  for (const triangle of triangles) {
    const weight = triangle.area / totalArea
    averageNormal.add(triangle.normal.clone().multiplyScalar(weight))
  }
  
  return averageNormal.normalize()
}

// Move camera directly toward clicked point to center it
export function calculateCameraPositionFromSurface(
  _mesh: THREE.Mesh, 
  _uv: THREE.Vector2, 
  worldPosition: THREE.Vector3, 
  currentCameraPosition: THREE.Vector3,
  _maskTexture: THREE.Texture | null = null
): { cameraPosition: THREE.Vector3, targetPosition: THREE.Vector3 } {
  
  // Calculate direction FROM camera TO the clicked point
  const directionToPoint = worldPosition.clone().sub(currentCameraPosition).normalize()
  
  // Current distance from camera to clicked point
  const currentDistance = currentCameraPosition.distanceTo(worldPosition)
  
  // Move significantly closer without arbitrary constraints
  const targetDistance = currentDistance * 0.5 // Get 50% closer
  
  console.log(`Direct movement: current distance ${currentDistance.toFixed(2)}, target distance ${targetDistance.toFixed(2)}`)
  
  // Position camera closer to the clicked point along the direct line
  const newPosition = worldPosition.clone().sub(directionToPoint.multiplyScalar(targetDistance))
  
  // Allow full movement for proper positioning  
  console.log(`Final movement: ${newPosition.clone().sub(currentCameraPosition).length().toFixed(2)} units`)
  
  // Target the clicked point to center it
  return { cameraPosition: newPosition, targetPosition: worldPosition }
} 