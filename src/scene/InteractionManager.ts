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

	// Model rotation state
	private isRotatingModel = false;
	private isShiftPressed = false;
	private isMetaPressed = false;
	private lastMousePosition = { x: 0, y: 0 };

	// Touch state
	private touchStartPosition: { x: number; y: number } | null = null;
	private touchMovedDuringTouch = false;
	private lastTapTime = 0;

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
		this.renderer.domElement.addEventListener(
			"mousemove",
			this.boundHandleMouseMove,
		);
		this.renderer.domElement.addEventListener("click", this.boundHandleClick);
		this.renderer.domElement.addEventListener(
			"mousedown",
			this.boundHandleMouseDown,
		);
		this.renderer.domElement.addEventListener(
			"mouseup",
			this.boundHandleMouseUp,
		);
		this.renderer.domElement.addEventListener(
			"dblclick",
			this.boundHandleDoubleClick,
		);

		// Touch events for mobile
		this.renderer.domElement.addEventListener(
			"touchstart",
			this.boundHandleTouchStart,
			{ passive: false },
		);
		this.renderer.domElement.addEventListener(
			"touchmove",
			this.boundHandleTouchMove,
			{ passive: false },
		);
		this.renderer.domElement.addEventListener(
			"touchend",
			this.boundHandleTouchEnd,
			{ passive: false },
		);

		// Mouse and wheel events
		this.renderer.domElement.addEventListener(
			"wheel",
			this.handleWheel.bind(this),
			{ passive: true },
		);

		// Keyboard events for Shift detection
		window.addEventListener("keydown", this.boundHandleKeyDown);
		window.addEventListener("keyup", this.boundHandleKeyUp);

		this.controls.addEventListener("start", this.boundHandleControlsStart);
		this.controls.addEventListener("end", this.boundHandleControlsEnd);

		// Removed setup debug logs
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

		const liverMesh = this.liverModel.getMesh();
		if (!liverMesh || !this.liverModel.getMaskTexture()) {
			return;
		}

		const rect = this.renderer.domElement.getBoundingClientRect();
		const mouse = new THREE.Vector2();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		// Only test the base mesh, not its children (e.g., overlay)
		const intersects = raycaster.intersectObject(liverMesh, false);

		if (intersects.length > 0) {
			const intersection = intersects[0];
			const uv = intersection.uv;

			if (uv) {
				const inscriptionId = this.liverModel.getInscriptionAtUV(uv.x, uv.y);

				if (inscriptionId > 0 && inscriptionId <= 42) {
					this.liverModel.setHoveredInscription(inscriptionId);

					const inscription = this.liverInscriptions.find(
						(ins) => ins.id === inscriptionId,
					);
					if (inscription) {
						const hoveredSection: HoveredSection = {
							id: inscription.id,
							gods: inscription.gods,
							etruscanText: inscription.etruscanText,
						};
						this.callbacks.onMarkerHover(hoveredSection);
						this.renderer.domElement.style.cursor = "pointer";
					}
				} else {
					this.liverModel.setHoveredInscription(0);
					this.callbacks.onMarkerHover(null);
					this.renderer.domElement.style.cursor = "grab";
				}
			} else {
				this.liverModel.setHoveredInscription(0);
				this.callbacks.onMarkerHover(null);
				this.renderer.domElement.style.cursor = "grab";
			}
		} else {
			this.liverModel.setHoveredInscription(0);
			this.callbacks.onMarkerHover(null);
			this.renderer.domElement.style.cursor = "grab";
		}
	}

	private handleControlsStart() {
		this.isPanningOrRotating = true;
	}

	private handleControlsEnd() {
		this.isPanningOrRotating = false;
		this.checkForZoom();
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

		if (currentDistance < initialDistance * 0.8 && !this.hasZoomed) {
			this.hasZoomed = true;
			this.callbacks.onZoomDetected();
		}
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
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
			this.touchMovedDuringTouch = false;
		}
	}

	private handleTouchMove(event: TouchEvent) {
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

	private processClick(clientX: number, clientY: number) {
		const rect = this.renderer.domElement.getBoundingClientRect();
		const mouse = new THREE.Vector2();
		mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		const liverMesh = this.liverModel.getMesh();
		if (liverMesh) {
			// Only test the base mesh, not its children (e.g., overlay)
			const intersects = raycaster.intersectObject(liverMesh, false);

			if (intersects.length > 0) {
				const intersection = intersects[0];
				const uv = intersection.uv;

				if (uv) {
					const inscriptionId = this.liverModel.getInscriptionAtUV(uv.x, uv.y);

					if (inscriptionId > 0 && inscriptionId <= 42) {
						const inscription = this.liverInscriptions.find(
							(ins) => ins.id === inscriptionId,
						);
						if (inscription) {
							const persp = this.camera as THREE.PerspectiveCamera;
							const worldPos = persp.position.clone();
							const worldTgt = this.controls.target.clone();
							const liverObject = this.liverModel.getObject?.();
							const modelMatrix = liverObject
								? liverObject.matrixWorld.clone()
								: new THREE.Matrix4();
							const localPos = worldToModelSpace(worldPos, modelMatrix);
							const localTgt = worldToModelSpace(worldTgt, modelMatrix);
							this.callbacks.onInscriptionClick({
								inscriptionId,
								clickedUV: uv.clone(),
								cameraWorldPosition: worldPos,
								cameraWorldTarget: worldTgt,
								cameraLocalPosition: localPos,
								cameraLocalTarget: localTgt,
								modelMatrix,
							});
						}
					}
				}
			} else {
				this.callbacks.onBackgroundClick();
			}
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

	private performReset() {
		this.callbacks.onReset();
	}

	public dispose() {
		this.renderer.domElement.removeEventListener(
			"mousemove",
			this.boundHandleMouseMove,
		);
		this.renderer.domElement.removeEventListener(
			"click",
			this.boundHandleClick,
		);
		this.renderer.domElement.removeEventListener(
			"mousedown",
			this.boundHandleMouseDown,
		);
		this.renderer.domElement.removeEventListener(
			"mouseup",
			this.boundHandleMouseUp,
		);
		this.renderer.domElement.removeEventListener(
			"dblclick",
			this.boundHandleDoubleClick,
		);

		this.renderer.domElement.removeEventListener(
			"touchstart",
			this.boundHandleTouchStart,
		);
		this.renderer.domElement.removeEventListener(
			"touchmove",
			this.boundHandleTouchMove,
		);
		this.renderer.domElement.removeEventListener(
			"touchend",
			this.boundHandleTouchEnd,
		);
		this.renderer.domElement.removeEventListener(
			"wheel",
			this.handleWheel.bind(this),
		);

		window.removeEventListener("keydown", this.boundHandleKeyDown);
		window.removeEventListener("keyup", this.boundHandleKeyUp);

		this.controls.removeEventListener("start", this.boundHandleControlsStart);
		this.controls.removeEventListener("end", this.boundHandleControlsEnd);
	}
}
