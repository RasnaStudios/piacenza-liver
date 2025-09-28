import * as THREE from 'three';
import { SceneConfig } from '../config/SceneConfig';

export function getLiverModelMatrix(): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  const position = SceneConfig.model.position;
  const rotation = SceneConfig.model.rotation;
  const scale = SceneConfig.model.scale;

  matrix.makeRotationFromEuler(
    new THREE.Euler(rotation.x, rotation.y, rotation.z)
  );
  matrix.scale(new THREE.Vector3(scale, scale, scale));
  matrix.setPosition(position);

  return matrix;
}

export function worldToModelSpace(
  worldPosition: THREE.Vector3,
  modelMatrix?: THREE.Matrix4
): THREE.Vector3 {
  const m = (modelMatrix ?? getLiverModelMatrix()).clone();
  const inverse = m.invert();
  return worldPosition.clone().applyMatrix4(inverse);
}

// Note: Only keeping minimal utilities needed by InteractionManager and App
