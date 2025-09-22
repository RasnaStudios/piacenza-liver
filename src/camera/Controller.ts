import { gsap } from "gsap";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SceneConfig } from "../config/SceneConfig";
import type { LiverModel } from "../scene/LiverModel";

// Helper function to detect portrait orientation with improved detection
const isPortraitOrientation = () => {
	return window.innerHeight > window.innerWidth;
};

// Helper function to get orientation-specific camera animation offsets
const getCameraAnimationOffsets = () => {
	return isPortraitOrientation()
		? SceneConfig.animation.camera.portrait
		: SceneConfig.animation.camera.landscape;
};

export class CameraController {
	private camera: THREE.Camera;
	private controls: OrbitControls;
	private lastManualPosition: THREE.Vector3;
	private lastManualTarget: THREE.Vector3;
	private isAnimating: boolean;
	private currentAnimationId: string | null;
	private originalControlsEnabled: boolean;
	private originalEnableDamping: boolean;
	private controlsTemporarilyDisabled: boolean;
	private currentTween: gsap.core.Tween | null = null;

	constructor(camera: THREE.Camera, controls: OrbitControls) {
		this.camera = camera;
		this.controls = controls;

		// Track user's manual positions
		// Calculate intro end position and target using config
		const cameraOffsets = getCameraAnimationOffsets();
		const endPos = SceneConfig.camera.initial
			.clone()
			.add(cameraOffsets.positionOffset);
		const endTarget = new THREE.Vector3(0, 0, 0)
			.clone()
			.add(cameraOffsets.targetOffset);
		this.lastManualPosition = endPos;
		this.lastManualTarget = endTarget;

		// Animation state
		this.isAnimating = false;
		this.currentAnimationId = null;
		this.originalControlsEnabled = controls.enabled;
		this.originalEnableDamping = controls.enableDamping;
		this.controlsTemporarilyDisabled = false;

		// Bind methods
		this.handleControlsChange = this.handleControlsChange.bind(this);
		this.handleControlsStart = this.handleControlsStart.bind(this);
		this.handleControlsEnd = this.handleControlsEnd.bind(this);

		// Listen for manual camera movements
		this.controls.addEventListener("change", this.handleControlsChange);
		this.controls.addEventListener("start", this.handleControlsStart);
		this.controls.addEventListener("end", this.handleControlsEnd);
	}

	private ensureSafeEndPose(
		startPosition: THREE.Vector3,
		startTarget: THREE.Vector3,
		endPosition: THREE.Vector3,
		endTarget: THREE.Vector3,
	): { endPosition: THREE.Vector3; endTarget: THREE.Vector3 } {
		// Ensure numbers are finite
		const all = [
			endPosition.x,
			endPosition.y,
			endPosition.z,
			endTarget.x,
			endTarget.y,
			endTarget.z,
		];
		for (const v of all) {
			if (!Number.isFinite(v)) {
				// Fallback to start pose to avoid corrupting controls
				return {
					endPosition: startPosition.clone(),
					endTarget: startTarget.clone(),
				};
			}
		}
		return { endPosition, endTarget };
	}

	// Handle when user starts manual control (interrupt animations)
	handleControlsStart() {
		if (this.isAnimating) {
			this.stopAnimation();
		}
	}

	// Handle when user stops manual control
	handleControlsEnd() {
		// Update manual position when user finishes controlling
		if (!this.isAnimating) {
			this.lastManualPosition.copy(this.camera.position);
			this.lastManualTarget.copy(this.controls.target);
		}
	}

	// Track manual camera movements (only when not animating)
	handleControlsChange() {
		if (!this.isAnimating) {
			this.lastManualPosition.copy(this.camera.position);
			this.lastManualTarget.copy(this.controls.target);
		}
	}

	// Animate camera to focus on a specific position with panel-aware positioning and proper text orientation
	focusOn(
		targetPosition: THREE.Vector3,
		cameraPosition: THREE.Vector3,
		duration: number = 800,
		isPanelOpen: boolean = false,
		onComplete?: () => void,
		modelMatrix?: THREE.Matrix4,
	) {
		// Stop any existing animation first
		this.stopAnimation();

		// Store current position before animating
		this.lastManualPosition.copy(this.camera.position);
		this.lastManualTarget.copy(this.controls.target);

		// TODO: Use isPanelOpen for panel-aware camera positioning
		// Currently unused but reserved for future panel positioning logic
		void isPanelOpen;

		const startPosition = this.camera.position.clone();
		const startTarget = this.controls.target.clone();

		// Transform coordinates if model matrix is provided
		let endTarget = targetPosition.clone();
		let endPosition = cameraPosition.clone();

		if (modelMatrix) {
			endTarget = targetPosition.clone().applyMatrix4(modelMatrix);
			endPosition = cameraPosition.clone().applyMatrix4(modelMatrix);
		}

		// Sanitize the target/position to avoid degenerate offsets and non-finite values
		const safePose = this.ensureSafeEndPose(
			startPosition,
			startTarget,
			endPosition,
			endTarget,
		);
		endPosition = safePose.endPosition;
		endTarget = safePose.endTarget;

		// Temporarily disable controls to avoid fighting during animation
		this.originalControlsEnabled = this.controls.enabled;
		this.originalEnableDamping = this.controls.enableDamping;
		this.controls.enabled = false;
		this.controls.enableDamping = false;
		this.controlsTemporarilyDisabled = true;
		this.isAnimating = true;

		// Simple animation - just animate position and target, let OrbitControls handle rotation
		const tween = gsap.to(
			{ t: 0 },
			{
				t: 1,
				duration: duration / 1000,
				ease: "power2.inOut",
				onUpdate: () => {
					if (!this.isAnimating) return;
					const t = (tween.targets()[0] as { t: number }).t;

					// Simple lerp for position and target
					this.camera.position.lerpVectors(startPosition, endPosition, t);
					this.controls.target.lerpVectors(startTarget, endTarget, t);
				},
				onComplete: () => {
					this.isAnimating = false;
					this.currentAnimationId = null;
					if (this.controlsTemporarilyDisabled) {
						this.controls.enabled = this.originalControlsEnabled;
						this.controls.enableDamping = this.originalEnableDamping;
						this.controlsTemporarilyDisabled = false;
					}
					this.controls.update();
					if (onComplete) onComplete();
				},
			},
		);

		// Track animation state
		this.isAnimating = true;
		this.currentTween = tween;
		return "camera-focus-gsap";
	}

	// Intro camera animation
	playIntroAnimation(onComplete?: () => void, finalTarget?: THREE.Vector3) {
		this.stopAnimation();

		const startPos = this.camera.position.clone();
		const cameraOffsets = getCameraAnimationOffsets();
		const endPos = startPos.clone().add(cameraOffsets.positionOffset);
		const target = finalTarget?.clone() || new THREE.Vector3(0, 0, 0);
		const duration = SceneConfig.animation.camera.duration;

		this.isAnimating = true;
		const tween = gsap.to(
			{ t: 0 },
			{
				t: 1,
				duration: duration / 1000,
				ease: "power2.inOut",
				onUpdate: () => {
					if (this.currentTween !== tween || !this.isAnimating) return;
					const t = (tween.targets()[0] as { t: number }).t;

					const tempCameraPos = new THREE.Vector3().lerpVectors(
						startPos,
						endPos,
						t,
					);
					const tempTargetPos = new THREE.Vector3().lerpVectors(
						target,
						target,
						t,
					);

					this.camera.position.copy(tempCameraPos);
					this.controls.target.copy(tempTargetPos);
					this.controls.update();
				},
				onComplete: () => {
					if (this.currentTween !== tween) return;
					this.isAnimating = false;
					this.currentTween = null;
					this.lastManualPosition.copy(endPos);
					this.lastManualTarget.copy(target);
					if (onComplete) onComplete();
				},
			},
		);
		this.currentTween = tween;
		this.currentAnimationId = "camera-intro-gsap";
		return "camera-intro-gsap";
	}

	// Reset camera and model to default positions
	resetToDefault(
		liverModel: LiverModel | null,
		duration = 1000,
		onComplete?: () => void,
	) {
		this.stopAnimation();

		const startPosition = this.camera.position.clone();
		const startTarget = this.controls.target.clone();

		const cameraOffsets = getCameraAnimationOffsets();
		const endPosition = SceneConfig.camera.initial
			.clone()
			.add(cameraOffsets.positionOffset);
		const endTarget =
			liverModel?.getLiverCenter().clone() || new THREE.Vector3(0, 0, 0);

		this.lastManualPosition.copy(endPosition);
		this.lastManualTarget.copy(endTarget);

		let modelAnimation: ((t: number) => void) | null = null;

		if (liverModel) {
			const liverObject = liverModel.getObject();
			if (liverObject) {
				const startModelPosition = {
					x: liverObject.position.x,
					y: liverObject.position.y,
					z: liverObject.position.z,
				};
				const startModelRotation = {
					x: liverObject.rotation.x,
					y: liverObject.rotation.y,
					z: liverObject.rotation.z,
				};
				const endModelPosition = SceneConfig.model.position;
				const endModelRotation = SceneConfig.model.rotation;

				modelAnimation = (t: number) => {
					if (liverObject) {
						liverObject.position.x =
							startModelPosition.x +
							(endModelPosition.x - startModelPosition.x) * t;
						liverObject.position.y =
							startModelPosition.y +
							(endModelPosition.y - startModelPosition.y) * t;
						liverObject.position.z =
							startModelPosition.z +
							(endModelPosition.z - startModelPosition.z) * t;

						liverObject.rotation.x =
							startModelRotation.x +
							(endModelRotation.x - startModelRotation.x) * t;
						liverObject.rotation.y =
							startModelRotation.y +
							(endModelRotation.y - startModelRotation.y) * t;
						liverObject.rotation.z =
							startModelRotation.z +
							(endModelRotation.z - startModelRotation.z) * t;
					}
				};
			}
		}

		this.isAnimating = true;
		const tween = gsap.to(
			{ t: 0 },
			{
				t: 1,
				duration: duration / 1000,
				ease: "power1.inOut",
				onUpdate: () => {
					if (this.currentTween !== tween || !this.isAnimating) return;
					const t = (tween.targets()[0] as { t: number }).t;

					const tempCameraPos = new THREE.Vector3().lerpVectors(
						startPosition,
						endPosition,
						t,
					);
					const tempTargetPos = new THREE.Vector3().lerpVectors(
						startTarget,
						endTarget,
						t,
					);
					this.camera.position.copy(tempCameraPos);
					this.controls.target.copy(tempTargetPos);
					this.camera.up.set(0, 1, 0);
					this.camera.lookAt(tempTargetPos);
					this.controls.update();

					if (modelAnimation) {
						modelAnimation(t);
					}
				},
				onComplete: () => {
					if (this.currentTween !== tween) return;
					this.isAnimating = false;
					this.currentTween = null;
					if (onComplete) onComplete();
				},
			},
		);
		this.currentTween = tween;
		this.currentAnimationId = "camera-reset-gsap";
		return "camera-reset-gsap";
	}

	// Stop current camera animation immediately
	stopAnimation() {
		if (this.currentTween) {
			this.currentTween.kill();
			this.currentTween = null;
		}
		this.isAnimating = false;
		this.currentAnimationId = null;

		// Always restore controls state if we temporarily disabled them
		if (this.controlsTemporarilyDisabled) {
			this.controls.enabled = this.originalControlsEnabled;
			this.controls.enableDamping = this.originalEnableDamping;
			this.controlsTemporarilyDisabled = false;
		}

		// Ensure controls are properly updated after stopping
		this.controls.update();
	}

	// Get current animation ID for external checks
	getCurrentAnimationId(): string | null {
		return this.currentAnimationId;
	}

	// Check if currently animating
	isCurrentlyAnimating(): boolean {
		return this.isAnimating;
	}

	// Cleanup
	dispose() {
		this.controls.removeEventListener("change", this.handleControlsChange);
		this.controls.removeEventListener("start", this.handleControlsStart);
		this.controls.removeEventListener("end", this.handleControlsEnd);
		this.stopAnimation();
	}
}
