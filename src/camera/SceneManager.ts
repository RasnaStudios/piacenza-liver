import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraController } from './Controller';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private cameraController: CameraController;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 8); // Moved further back for larger model

    // Renderer setup: create a dedicated fresh canvas to avoid 2D/WebGL context conflicts
    const canvas = document.createElement('canvas');
    // Ensure container is clean (no pre-existing canvas with 2D context)
    while (container.firstChild) container.removeChild(container.firstChild);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Camera controller
    this.cameraController = new CameraController(this.camera, this.controls);

    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Start animation loop
    this.animate();
  }

  private handleResize = () => {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public getCameraController(): CameraController {
    return this.cameraController;
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.handleResize);
    // Remove canvas from DOM and dispose renderer
    const canvas = this.renderer.domElement;
    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    this.renderer.dispose();
    this.controls.dispose();
  }
}

export function useSceneManager(containerRef: React.RefObject<HTMLElement>) {
  const sceneManagerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    sceneManagerRef.current = new SceneManager(containerRef.current);

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
    };
  }, [containerRef]);

  return sceneManagerRef.current;
} 