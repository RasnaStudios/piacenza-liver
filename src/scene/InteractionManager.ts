import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { worldToModelSpace } from "../camera/InscriptionPositions";
import type { HoveredSection, InscriptionClickPayload } from "../types";
import type { Inscription } from "./LiverData";
import type { LiverModel } from "./LiverModel";

export interface InteractionCallbacks {
	onInscriptionClick: (payload: InscriptionClickPayload) => void;
	onBackgroundClick: () => void;
	onMarkerHover: (section: HoveredSection | null) => void;
	onZoomDetected: () => void;
	onMouseMove: (
		position: { x: number; y: number },
		isOverCanvas: boolean,
	) => void;
	onModifierKeyChange: (isPressed: boolean) => void;
	onReset: () => void;
	onViewChange: () => void;
}

export class InteractionManager {
	private renderer: THREE.WebGLRenderer;
	private camera: THREE.Camera;
	private controls: OrbitControls;
	private liverModel: LiverModel;
	private liverInscriptions: Inscription[];
	private callbacks: InteractionCallbacks;

	private isPanningOrRotating = false;
	private mouseDownPosition: { x: number; y: number } | null = null;
	private mouseMovedDuringClick = false;
	private lastRaycastPosition: { x: number; y: number } | null = null;
	private raycastThrottleTimeout: number | null = null;

	// Model rotation state
	private isRotatingModel = false;
	private isShiftPressed = false;
	private isMetaPressed = false;
	private lastMousePosition = { x: 0, y: 0 };

	// Touch state
	private touchStartPosition: { x: number; y: number } | null = null;
	private touchMovedDuringTouch = false;
	private lastTapTime = 0;
	private isMultiTouch = false;

	// 3-finger model rotation state
	private isThreeFingerTouch = false;
	private lastThreeFingerPosition: { x: number; y: number } | null = null;

	// Zoom detection
	private initialCameraDistance: number | null = null;
	private hasZoomed = false;
	private isIntroAnimation = false;

	private boundHandleMouseMove: (event: MouseEvent) => void;
	private boundHandleClick: (event: MouseEvent) => void;
	private boundHandleMouseDown: (event: MouseEvent) => void;
	private boundHandleMouseUp: (event: MouseEvent) => void;
	private boundHandleKeyDown: (event: KeyboardEvent) => void;
	private boundHandleKeyUp: (event: KeyboardEvent) => void;
	private boundHandleControlsStart: () => void;
	private boundHandleControlsEnd: () => void;
	private boundHandleTouchStart: (event: TouchEvent) => void;
	private boundHandleTouchMove: (event: TouchEvent) => void;
	private boundHandleTouchEnd: (event: TouchEvent) => void;
	private boundHandleDoubleClick: (event: MouseEvent) => void;

	constructor(
		renderer: THREE.WebGLRenderer,
		camera: THREE.Camera,
		controls: OrbitControls,
		liverModel: LiverModel,
		liverInscriptions: Inscription[],
		callbacks: InteractionCallbacks,
	) {
		this.renderer = renderer;
		this.camera = camera;
		this.controls = controls;
		this.liverModel = liverModel;
		this.liverInscriptions = liverInscriptions;
		this.callbacks = callbacks;

		this.boundHandleMouseMove = this.handleMouseMove.bind(this);
		this.boundHandleClick = this.handleClick.bind(this);
		this.boundHandleMouseDown = this.handleMouseDown.bind(this);
		this.boundHandleMouseUp = this.handleMouseUp.bind(this);
		this.boundHandleKeyDown = this.handleKeyDown.bind(this);
		this.boundHandleKeyUp = this.handleKeyUp.bind(this);
		this.boundHandleControlsStart = this.handleControlsStart.bind(this);
		this.boundHandleControlsEnd = this.handleControlsEnd.bind(this);
		this.boundHandleTouchStart = this.handleTouchStart.bind(this);
		this.boundHandleTouchMove = this.handleTouchMove.bind(this);
		this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
		this.boundHandleDoubleClick = this.handleDoubleClick.bind(this);

		this.setupEventListeners();
	}

	private setupEventListeners() {
		const domElement = this.renderer.domElement;

		// Mouse events
		domElement.addEventListener("mousemove", this.boundHandleMouseMove);
		domElement.addEventListener("click", this.boundHandleClick);
		domElement.addEventListener("mousedown", this.boundHandleMouseDown);
		domElement.addEventListener("mouseup", this.boundHandleMouseUp);
		domElement.addEventListener("dblclick", this.boundHandleDoubleClick);

		// Touch events
		domElement.addEventListener("touchstart", this.boundHandleTouchStart, {
			passive: false,
		});
		domElement.addEventListener("touchmove", this.boundHandleTouchMove, {
			passive: false,
		});
		domElement.addEventListener("touchend", this.boundHandleTouchEnd, {
			passive: false,
		});

		// Wheel event
		domElement.addEventListener("wheel", this.handleWheel.bind(this), {
			passive: true,
		});

		// Keyboard and control events
		window.addEventListener("keydown", this.boundHandleKeyDown);
		window.addEventListener("keyup", this.boundHandleKeyUp);
		this.controls.addEventListener("start", this.boundHandleControlsStart);
		this.controls.addEventListener("end", this.boundHandleControlsEnd);
	}

	private handleMouseDown(event: MouseEvent) {
		this.mouseDownPosition = { x: event.clientX, y: event.clientY };
		this.mouseMovedDuringClick = false;
		this.lastMousePosition = { x: event.clientX, y: event.clientY };

		// Check if Shift is pressed for model rotation
		if (this.isShiftPressed) {
			this.isRotatingModel = true;
			this.controls.enabled = false; // Disable camera controls
			event.preventDefault();
		}
	}

	private handleMouseUp(_event: MouseEvent) {
		if (this.isRotatingModel) {
			this.isRotatingModel = false;
			this.controls.enabled = true; // Re-enable camera controls
		}
	}

	private handleKeyDown(event: KeyboardEvent) {
		let modifierChanged = false;

		if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
			this.isShiftPressed = true;
			modifierChanged = true;
		}
		if (event.metaKey) {
			this.isMetaPressed = true;
			modifierChanged = true;
		}

		if (modifierChanged) {
			this.callbacks.onModifierKeyChange(
				this.isShiftPressed || this.isMetaPressed,
			);
		}

		// Debug camera position logging
		if (
			import.meta.env.VITE_DEBUG_ENABLED === "true" &&
			event.key.toLowerCase() === "r"
		) {
			console.log("=== CAMERA DEBUG INFO ===");

			// Convert world coordinates to model-local coordinates
			const modelMatrix = this.liverModel.getModelMatrix();
			const modelMatrixInverse = modelMatrix.clone().invert();

			const localCameraPos = this.camera.position
				.clone()
				.applyMatrix4(modelMatrixInverse);
			const localCameraTarget = this.controls.target
				.clone()
				.applyMatrix4(modelMatrixInverse);

			console.log("World coordinates:");
			console.log(
				`World Position: ${this.camera.position.x.toFixed(3)}, ${this.camera.position.y.toFixed(3)}, ${this.camera.position.z.toFixed(3)}`,
			);
			console.log(
				`World Target: ${this.controls.target.x.toFixed(3)}, ${this.controls.target.y.toFixed(3)}, ${this.controls.target.z.toFixed(3)}`,
			);
			console.log("Model-local coordinates:");
			console.log(
				`cameraPosition: new THREE.Vector3(${localCameraPos.x.toFixed(3)}, ${localCameraPos.y.toFixed(3)}, ${localCameraPos.z.toFixed(3)}),`,
			);
			console.log(
				`cameraTarget: new THREE.Vector3(${localCameraTarget.x.toFixed(3)}, ${localCameraTarget.y.toFixed(3)}, ${localCameraTarget.z.toFixed(3)}),`,
			);
			console.log("========================");
		}
	}

	private handleKeyUp(event: KeyboardEvent) {
		let modifierChanged = false;

		if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
			this.isShiftPressed = false;
			modifierChanged = true;
			if (this.isRotatingModel) {
				this.isRotatingModel = false;
				this.controls.enabled = true;
			}
		}
		if (!event.metaKey) {
			this.isMetaPressed = false;
			modifierChanged = true;
		}

		if (modifierChanged) {
			this.callbacks.onModifierKeyChange(
				this.isShiftPressed || this.isMetaPressed,
			);
		}
	}

	private handleMouseMove(event: MouseEvent) {
		// Check if mouse is over the canvas element
		const canvas = this.renderer.domElement;
		const canvasRect = canvas.getBoundingClientRect();
		const isOverCanvas =
			event.clientX >= canvasRect.left &&
			event.clientX <= canvasRect.right &&
			event.clientY >= canvasRect.top &&
			event.clientY <= canvasRect.bottom;

		// Update mouse position for callbacks
		this.callbacks.onMouseMove(
			{ x: event.clientX, y: event.clientY },
			isOverCanvas,
		);

		// Handle model rotation when Shift+drag is active
		if (this.isRotatingModel && this.isShiftPressed) {
			const deltaX = event.clientX - this.lastMousePosition.x;
			const deltaY = event.clientY - this.lastMousePosition.y;

			const liverObject = this.liverModel.getObject();
			if (liverObject) {
				// Rotation sensitivity
				const rotationSpeed = 0.01;

				// Apply rotation: horizontal movement = Y rotation, vertical movement = X rotation
				liverObject.rotation.y += deltaX * rotationSpeed;
				liverObject.rotation.x += deltaY * rotationSpeed;
			}

			this.lastMousePosition = { x: event.clientX, y: event.clientY };
			return; // Skip normal hover detection when rotating model
		}

		if (this.mouseDownPosition) {
			const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
			const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);
			const moveThreshold = 5;

			if (deltaX > moveThreshold || deltaY > moveThreshold) {
				this.mouseMovedDuringClick = true;
			}
		}

		// Use throttled raycast for hover detection
		this.throttledRaycast(event.clientX, event.clientY);
	}

	private handleControlsStart() {
		this.isPanningOrRotating = true;
	}

	private handleControlsEnd() {
		this.isPanningOrRotating = false;
		this.checkForZoom();
		// Notify that view has changed (rotation/pan)
		this.callbacks.onViewChange();
	}

	private handleWheel(_event: WheelEvent) {
		this.checkForZoom();
	}

	private checkForZoom() {
		if (this.isIntroAnimation) return;

		const camera = this.camera as THREE.PerspectiveCamera;
		if (!camera) return;

		if (this.initialCameraDistance === null) {
			this.initialCameraDistance = camera.position.length();
			return;
		}

		const currentDistance = camera.position.length();
		const initialDistance = this.initialCameraDistance;

		// Detect zoom in (getting closer)
		if (currentDistance < initialDistance * 0.8 && !this.hasZoomed) {
			this.hasZoomed = true;
			this.callbacks.onZoomDetected();
			// Clear any selected inscription when zoom is detected
			this.callbacks.onBackgroundClick();
		}

		// Notify that view has changed (zoom)
		this.callbacks.onViewChange();
	}

	private handleClick(event: MouseEvent) {
		if (this.isPanningOrRotating) {
			return;
		}

		if (this.mouseMovedDuringClick) {
			this.mouseDownPosition = null;
			this.mouseMovedDuringClick = false;
			return;
		}

		this.mouseDownPosition = null;
		this.mouseMovedDuringClick = false;

		this.processClick(event.clientX, event.clientY);
	}

	private handleTouchStart(event: TouchEvent) {
		if (event.touches.length === 3) {
			// 3-finger touch for model rotation
			this.isThreeFingerTouch = true;
			this.isMultiTouch = false;
			const touch = event.touches[0]; // Use first touch as reference
			this.lastThreeFingerPosition = { x: touch.clientX, y: touch.clientY };
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			event.preventDefault(); // Prevent default 3-finger gestures
		} else if (event.touches.length === 1) {
			const touch = event.touches[0];
			this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
			this.touchMovedDuringTouch = false;
			this.isMultiTouch = false;
			this.isThreeFingerTouch = false;
		} else if (event.touches.length === 2) {
			// 2-finger touch (pinch/zoom gesture)
			this.isMultiTouch = true;
			this.isThreeFingerTouch = false;
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			// Clear any selected inscription during multi-touch
			this.callbacks.onBackgroundClick();
		} else if (event.touches.length > 3) {
			// More than 3 fingers - ignore
			this.isMultiTouch = true;
			this.isThreeFingerTouch = false;
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
		}
	}

	private handleTouchMove(event: TouchEvent) {
		if (event.touches.length === 3 && this.isThreeFingerTouch) {
			// 3-finger model rotation
			const touch = event.touches[0]; // Use first touch as reference
			const currentPosition = { x: touch.clientX, y: touch.clientY };

			if (this.lastThreeFingerPosition) {
				const deltaX = currentPosition.x - this.lastThreeFingerPosition.x;
				const deltaY = currentPosition.y - this.lastThreeFingerPosition.y;

				const liverObject = this.liverModel.getObject();
				if (liverObject) {
					// Rotation sensitivity for touch (slightly higher than mouse)
					const rotationSpeed = 0.015;

					// Apply rotation: horizontal movement = Y rotation, vertical movement = X rotation
					liverObject.rotation.y += deltaX * rotationSpeed;
					liverObject.rotation.x += deltaY * rotationSpeed;
				}
			}

			this.lastThreeFingerPosition = currentPosition;
			event.preventDefault();
			return;
		}

		if (event.touches.length > 1) {
			// Multi-touch move (pinch/zoom gesture)
			this.isMultiTouch = true;
			this.touchMovedDuringTouch = true;
			return;
		}

		if (this.touchStartPosition && event.touches.length === 1) {
			const touch = event.touches[0];
			const deltaX = Math.abs(touch.clientX - this.touchStartPosition.x);
			const deltaY = Math.abs(touch.clientY - this.touchStartPosition.y);
			const moveThreshold = 10; // Slightly higher threshold for touch

			if (deltaX > moveThreshold || deltaY > moveThreshold) {
				this.touchMovedDuringTouch = true;
			}
		}
	}

	private handleTouchEnd(event: TouchEvent) {
		// Reset 3-finger touch state
		if (this.isThreeFingerTouch) {
			this.isThreeFingerTouch = false;
			this.lastThreeFingerPosition = null;
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			return;
		}

		// Reset multi-touch state when touches end
		if (this.isMultiTouch) {
			this.isMultiTouch = false;
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			return;
		}

		if (this.isPanningOrRotating) {
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			return;
		}

		if (this.touchMovedDuringTouch || !this.touchStartPosition) {
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			return;
		}

		// Check for double tap
		const currentTime = Date.now();
		const tapLength = currentTime - this.lastTapTime;
		if (tapLength < 500 && tapLength > 0) {
			// Double tap detected
			event.preventDefault();
			this.performReset();
			this.touchStartPosition = null;
			this.touchMovedDuringTouch = false;
			this.lastTapTime = 0;
			return;
		}
		this.lastTapTime = currentTime;

		// Use the touch start position for more accurate raycasting
		const touch = this.touchStartPosition;
		this.touchStartPosition = null;
		this.touchMovedDuringTouch = false;

		// Prevent default to avoid mouse events
		event.preventDefault();

		this.processClick(touch.x, touch.y);
	}

	private handleDoubleClick(event: MouseEvent) {
		event.preventDefault();

		// Clear selection highlighting on double-click
		this.liverModel.setSelectedInscription(0);

		// Also perform reset for camera/UI
		this.performReset();
	}

	private calculateCameraPositions() {
		const persp = this.camera as THREE.PerspectiveCamera;
		const worldPos = persp.position.clone();
		const worldTgt = this.controls.target.clone();
		const liverObject = this.liverModel.getObject?.();
		const modelMatrix = liverObject
			? liverObject.matrixWorld.clone()
			: new THREE.Matrix4();
		const localPos = worldToModelSpace(worldPos, modelMatrix);
		const localTgt = worldToModelSpace(worldTgt, modelMatrix);

		return {
			worldPosition: worldPos,
			worldTarget: worldTgt,
			localPosition: localPos,
			localTarget: localTgt,
			modelMatrix,
		};
	}

	private processClick(clientX: number, clientY: number) {
		const intersection = this.performRaycast(clientX, clientY);
		const inscription = this.getInscriptionFromIntersection(intersection);

		if (inscription) {
			const cameraData = this.calculateCameraPositions();

			this.callbacks.onInscriptionClick({
				inscriptionId: inscription.id,
				clickedUV: intersection?.uv?.clone() || new THREE.Vector2(),
				cameraWorldPosition: cameraData.worldPosition,
				cameraWorldTarget: cameraData.worldTarget,
				cameraLocalPosition: cameraData.localPosition,
				cameraLocalTarget: cameraData.localTarget,
				modelMatrix: cameraData.modelMatrix,
			});
		} else {
			this.callbacks.onBackgroundClick();
		}
	}

	public isCurrentlyPanningOrRotating(): boolean {
		return this.isPanningOrRotating;
	}

	public setInitialCameraDistance(distance: number) {
		this.initialCameraDistance = distance;
	}

	public setIntroAnimationMode(enabled: boolean) {
		this.isIntroAnimation = enabled;
	}

	public getIsIntroAnimation(): boolean {
		return this.isIntroAnimation;
	}

	public resetZoomState() {
		this.hasZoomed = false;
		if (this.camera) {
			this.initialCameraDistance = (
				this.camera as THREE.PerspectiveCamera
			).position.length();
		}
	}

	private performRaycast(clientX: number, clientY: number) {
		const liverMesh = this.liverModel.getMesh();
		if (!liverMesh) return null;

		const rect = this.renderer.domElement.getBoundingClientRect();
		const mouse = new THREE.Vector2();
		mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		const intersects = raycaster.intersectObject(liverMesh, false);
		return intersects.length > 0 ? intersects[0] : null;
	}

	private throttledRaycast(clientX: number, clientY: number) {
		// Check if mouse moved significantly (more than 5 pixels)
		if (this.lastRaycastPosition) {
			const deltaX = Math.abs(clientX - this.lastRaycastPosition.x);
			const deltaY = Math.abs(clientY - this.lastRaycastPosition.y);
			const threshold = 5;

			if (deltaX < threshold && deltaY < threshold) {
				return; // Skip raycast if mouse hasn't moved much
			}
		}

		// Clear existing timeout
		if (this.raycastThrottleTimeout) {
			clearTimeout(this.raycastThrottleTimeout);
		}

		// Throttle raycast to max 30fps (33ms)
		this.raycastThrottleTimeout = window.setTimeout(() => {
			this.lastRaycastPosition = { x: clientX, y: clientY };
			this.performHoverRaycast(clientX, clientY);
			this.raycastThrottleTimeout = null;
		}, 10);
	}

	private performHoverRaycast(clientX: number, clientY: number) {
		if (!this.liverModel.getMaskTexture()) return;

		const intersection = this.performRaycast(clientX, clientY);
		const inscription = this.getInscriptionFromIntersection(intersection);

		if (inscription) {
			this.liverModel.setHoveredInscription(inscription.id);
			this.callbacks.onMarkerHover(inscription);
			this.renderer.domElement.style.cursor = "pointer";
		} else {
			this.liverModel.setHoveredInscription(0);
			this.callbacks.onMarkerHover(null);
			this.renderer.domElement.style.cursor = "grab";
		}
	}

	private getInscriptionFromIntersection(
		intersection: THREE.Intersection | null,
	) {
		if (!intersection?.uv) return null;

		const inscriptionId = this.liverModel.getInscriptionAtUV(
			intersection.uv.x,
			intersection.uv.y,
		);
		if (inscriptionId <= 0 || inscriptionId > 42) return null;

		return (
			this.liverInscriptions.find((ins) => ins.id === inscriptionId) || null
		);
	}

	private performReset() {
		this.callbacks.onReset();
	}

	public dispose() {
		// Clear raycast timeout
		if (this.raycastThrottleTimeout) {
			clearTimeout(this.raycastThrottleTimeout);
			this.raycastThrottleTimeout = null;
		}

		const domElement = this.renderer.domElement;

		// Mouse events
		domElement.removeEventListener("mousemove", this.boundHandleMouseMove);
		domElement.removeEventListener("click", this.boundHandleClick);
		domElement.removeEventListener("mousedown", this.boundHandleMouseDown);
		domElement.removeEventListener("mouseup", this.boundHandleMouseUp);
		domElement.removeEventListener("dblclick", this.boundHandleDoubleClick);

		// Touch events
		domElement.removeEventListener("touchstart", this.boundHandleTouchStart);
		domElement.removeEventListener("touchmove", this.boundHandleTouchMove);
		domElement.removeEventListener("touchend", this.boundHandleTouchEnd);

		// Wheel event
		domElement.removeEventListener("wheel", this.handleWheel.bind(this));

		// Keyboard and control events
		window.removeEventListener("keydown", this.boundHandleKeyDown);
		window.removeEventListener("keyup", this.boundHandleKeyUp);
		this.controls.removeEventListener("start", this.boundHandleControlsStart);
		this.controls.removeEventListener("end", this.boundHandleControlsEnd);
	}
}
