varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPos;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}