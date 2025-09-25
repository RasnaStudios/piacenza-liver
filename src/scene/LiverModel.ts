import { gsap } from "gsap";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import objUrl from "../assets/liver-model/Fegato.obj";
import baseColorUrl from "../assets/liver-model/Fegato_baseColor.jpg";
import normalUrl from "../assets/liver-model/Fegato_normal.jpg";
import ormUrl from "../assets/liver-model/Fegato_occlusionRoughnessMetallic.jpg";
import maskUrl from "../assets/segmentation.png";
import atlasMeta from "../assets/segmentation_atlas.json";
import atlasPngUrl from "../assets/segmentation_atlas.png";
import { SceneConfig } from "../config/SceneConfig";
import type { AtlasMeta, AtlasTweak } from "../types";
import { getInscriptionGroup } from "../utils/liverUtils";
import { liverInscriptions } from "./LiverData";

export class LiverModel {
	private scene: THREE.Scene;
	private mesh: THREE.Mesh | null = null;
	private object: THREE.Object3D | null = null;
	private onProgress?: (progress: number) => void;
	private loadingManager: THREE.LoadingManager;
	private lastProgress: number = 0;
	private liverCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
	private reportProgress(p: number) {
		const clamped = Math.max(0, Math.min(100, Math.floor(p)));
		const monotonic = Math.max(this.lastProgress, clamped);
		this.lastProgress = monotonic;
		this.onProgress?.(monotonic);
	}

	setAtlasTweak(partial: Partial<typeof this.atlasTweak>) {
		this.atlasTweak = { ...this.atlasTweak, ...partial };
		// Re-apply current hover if active
		if (this.currentHoveredId) {
			this.setHoveredInscription(this.currentHoveredId);
		}
	}

	getAtlasTweak() {
		return { ...this.atlasTweak };
	}

	// Offscreen canvas for CPU-side sampling of the segmentation mask
	private maskCanvas: HTMLCanvasElement | null = null;
	private maskCtx: CanvasRenderingContext2D | null = null;
	private maskWidth = 0;
	private maskHeight = 0;

	private onModelReady?: () => void;
	private atlasTexture: THREE.Texture | null = null;
	private selectedMaterial: THREE.MeshStandardMaterial | null = null;
	private selectedMesh: THREE.Mesh | null = null;
	private hoveredMaterial: THREE.MeshStandardMaterial | null = null;
	private hoveredMesh: THREE.Mesh | null = null;
	private atlasCols = 1;
	private atlasRows = 1;
	private labelToTile: Record<number, { row: number; col: number }> = {};
	private atlasTweak: AtlasTweak = {
		flipX: false,
		flipY: true,
		repeatScaleX: 1,
		repeatScaleY: 1,
		offsetX: 0,
		offsetY: 0,
		idOffset: 0,
		idMap: {
			// Row 0 (1-8) should map to Row 4 (33-40)
			1: 33,
			2: 34,
			3: 35,
			4: 36,
			5: 37,
			6: 38,
			7: 39,
			8: 40,
			// Row 1 (9-16) should map to Row 3 (25-32)
			9: 25,
			10: 26,
			11: 27,
			12: 28,
			13: 29,
			14: 30,
			15: 31,
			16: 32,
			// Row 3 (25-32) should map to Row 1 (9-16)
			25: 9,
			26: 10,
			27: 11,
			28: 12,
			29: 13,
			30: 14,
			31: 15,
			32: 16,
			// Row 4 (33-40) should map to Row 0 (1-8)
			33: 1,
			34: 2,
			35: 3,
			36: 4,
			37: 5,
			38: 6,
			39: 7,
			40: 8,
		},
	};

	private currentHoveredId: number = 0;
	private currentSelectedId: number = 0;

	private getHighlightColor(id: number): THREE.Color {
		// Apply the same ID remapping as the highlighting system
		let remappedId = this.atlasTweak.idMap?.[id] ?? id;
		remappedId = Math.round(remappedId + (this.atlasTweak.idOffset || 0));

		const ins = liverInscriptions.find((i) => i.id === remappedId);
		if (ins) {
			const group = getInscriptionGroup(ins.id);
			if (group?.color) {
				return new THREE.Color(group.color);
			}
		}
		return new THREE.Color(0xffc107);
	}

	constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
		this.scene = scene;
		this.onProgress = onProgress;
		// Centralized loading manager for accurate progress reporting
		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onStart = () => {
			this.reportProgress(0);
		};
		this.loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
			// Unified progress across ALL resources (gltf, bin, textures, segmentation)
			const percent =
				itemsTotal > 0
					? Math.min(95, Math.round((itemsLoaded / itemsTotal) * 95))
					: 0;
			this.reportProgress(percent);
		};
		this.loadingManager.onLoad = () => {
			// Manager finished loading all tracked resources
			if (this.lastProgress < 95) this.reportProgress(95);
		};

		if (!this.checkWebGLSupport()) {
			console.error("WebGL not supported on this device");
			throw new Error("WebGL not supported");
		}

		this.loadLiverModel();
	}

	private checkWebGLSupport(): boolean {
		try {
			const canvas = document.createElement("canvas");
			const gl =
				canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			return !!gl;
		} catch (_e) {
			return false;
		}
	}

	private calculateLiverCenter() {
		if (!this.mesh || !this.object) {
			console.warn(
				"Cannot calculate liver center: mesh or object not available",
			);
			return;
		}

		// Calculate bounding box of the entire object (which includes all transforms)
		const worldBoundingBox = new THREE.Box3();
		worldBoundingBox.setFromObject(this.object);

		const worldCenter = new THREE.Vector3();
		worldBoundingBox.getCenter(worldCenter);

		// Store the calculated center for reuse
		this.liverCenter = worldCenter.clone();

		if (
			import.meta.env.VITE_DEBUG_ENABLED === "true" &&
			import.meta.env.VITE_DEBUG_LIVER_BOUNDING_BOX === "true"
		) {
			// DEBUG: Add world-space bounding box visualization
			const boxGeometry = new THREE.BoxGeometry(
				worldBoundingBox.max.x - worldBoundingBox.min.x,
				worldBoundingBox.max.y - worldBoundingBox.min.y,
				worldBoundingBox.max.z - worldBoundingBox.min.z,
			);
			const boxMaterial = new THREE.MeshBasicMaterial({
				color: 0xff0000,
				wireframe: true,
				transparent: true,
				opacity: 0.8,
			});
			const worldBoxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
			worldBoxMesh.position.copy(worldCenter);
			this.scene.add(worldBoxMesh);
		}

		if (
			import.meta.env.VITE_DEBUG_ENABLED === "true" &&
			import.meta.env.VITE_DEBUG_LIVER_INSCRIPTION === "true"
		) {
			// Add green spheres at inscription camera targets for debugging
			for (const inscription of liverInscriptions) {
				if (inscription.cameraTarget) {
					// Transform local coordinates to world coordinates
					const worldTarget = inscription.cameraTarget.clone();
					worldTarget.applyMatrix4(this.object.matrixWorld);

					const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
					const sphereMaterial = new THREE.MeshBasicMaterial({
						color: 0x00ff00,
						transparent: true,
						opacity: 0.8,
					});
					const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
					sphere.position.copy(worldTarget);
					sphere.name = `inscription-${inscription.id}-target`;
					this.scene.add(sphere);
				}
			}
		}
	}

	// Getter for the calculated liver center
	getLiverCenter(): THREE.Vector3 {
		return this.liverCenter.clone();
	}

	// Method to reset camera target to liver center
	resetCameraToCenter(controls?: OrbitControls) {
		if (this.liverCenter && controls) {
			controls.target.copy(this.liverCenter);
			console.log("Camera target reset to liver center:", this.liverCenter);
		}
	}

	private async loadLiverModel() {
		try {
			// Load PBR textures available in /src/assets/liver-model
			const textureLoader = new THREE.TextureLoader(this.loadingManager);
			const [baseColor, normalTex, ormTex, maskTex, atlasTex] =
				await Promise.all([
					textureLoader.loadAsync(baseColorUrl),
					textureLoader.loadAsync(normalUrl),
					textureLoader.loadAsync(ormUrl),
					textureLoader.loadAsync(maskUrl),
					textureLoader.loadAsync(atlasPngUrl),
				]);

			// Configure textures
			const configureTexture = (
				texture: THREE.Texture,
				config: Partial<THREE.Texture>,
			) => {
				Object.assign(texture, { needsUpdate: true, ...config });
			};

			// Configure segmentation mask texture
			configureTexture(maskTex, {
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				generateMipmaps: false,
				wrapS: THREE.ClampToEdgeWrapping,
				wrapT: THREE.ClampToEdgeWrapping,
				flipY: false,
			});

			// Configure PBR textures
			[baseColor, normalTex, ormTex].forEach((tex) => {
				configureTexture(tex, {
					wrapS: THREE.ClampToEdgeWrapping,
					wrapT: THREE.ClampToEdgeWrapping,
					colorSpace: THREE.SRGBColorSpace,
					flipY: baseColor.flipY,
					// Improved filtering for smoother texture blending
					minFilter: THREE.LinearMipmapLinearFilter,
					magFilter: THREE.LinearFilter,
					generateMipmaps: true,
				});
			});

			// Configure atlas texture for smooth highlights
			configureTexture(atlasTex, {
				minFilter: THREE.LinearMipmapLinearFilter,
				magFilter: THREE.LinearFilter,
				generateMipmaps: true,
				wrapS: THREE.ClampToEdgeWrapping,
				wrapT: THREE.ClampToEdgeWrapping,
				flipY: false,
				colorSpace: THREE.NoColorSpace,
			});
			this.atlasTexture = atlasTex;

			// Parse atlas meta
			this.atlasCols = (atlasMeta as AtlasMeta).cols || 1;
			this.atlasRows = (atlasMeta as AtlasMeta).rows || 1;
			const labelsObj = (atlasMeta as AtlasMeta).labels || {};
			this.labelToTile = {};
			Object.keys(labelsObj).forEach((k) => {
				const n = Number(k);
				this.labelToTile[n] = { row: labelsObj[k].row, col: labelsObj[k].col };
			});

			// Prepare offscreen canvas for mask sampling
			const img = maskTex.image as HTMLImageElement;
			if (img?.width && img?.height) {
				this.maskCanvas = document.createElement("canvas");
				this.maskCanvas.width = this.maskWidth = img.width;
				this.maskCanvas.height = this.maskHeight = img.height;
				this.maskCtx = this.maskCanvas.getContext("2d", {
					willReadFrequently: true,
				});
				this.maskCtx?.drawImage(img, 0, 0, img.width, img.height);
			}

			// Create base material with PBR settings
			const baseMaterial = new THREE.MeshStandardMaterial({
				// Texture maps
				map: baseColor,
				normalMap: normalTex,
				aoMap: ormTex,
				roughnessMap: ormTex,
				metalnessMap: ormTex,

				// Rendering properties
				side: THREE.FrontSide,
				transparent: false,
				depthWrite: true,
				depthTest: true,

				// Material properties for color reproduction and blending
				metalness: 0.1, // Metalness to reduce harsh reflections
				roughness: 0.8, // Roughness for softer, larger reflections
				aoMapIntensity: 0.8, // AO intensity for smoother transitions
				flatShading: false, // Smooth shading for lighting response
				// Additional properties for blending
				normalScale: new THREE.Vector2(0.8, 0.8), // Normal intensity for smoother surface
			});

			baseMaterial.shadowSide = THREE.FrontSide;

			// Create separate materials for selected and hovered states
			const createHighlightMaterial = () =>
				new THREE.MeshStandardMaterial({
					color: new THREE.Color(0xffc107),
					transparent: true,
					opacity: 0.0,
					alphaMap: this.atlasTexture,
					depthWrite: false,
					alphaTest: 0.0,
					blending: THREE.AdditiveBlending,
					depthTest: true,
				});

			this.selectedMaterial = createHighlightMaterial();
			this.hoveredMaterial = createHighlightMaterial();

			// Load OBJ geometry
			const objLoader = new OBJLoader(this.loadingManager);
			const object = await objLoader.loadAsync(objUrl);

			object.traverse((child) => {
				if ((child as THREE.Object3D & { isMesh?: boolean }).isMesh) {
					const mesh = child as THREE.Mesh;
					const geom = mesh.geometry as THREE.BufferGeometry;

					// Compute vertex normals and bounding box for proper rendering
					geom.computeVertexNormals();
					geom.computeBoundingBox();

					mesh.material = baseMaterial;
					mesh.castShadow = true;
					mesh.receiveShadow = true;
					this.mesh = mesh;

					// Ensure uv2 exists so aoMap can work; duplicate uv if missing

					// Create overlay meshes
					const createOverlayMesh = (
						material: THREE.Material,
						renderOrderOffset: number,
					) => {
						const overlayMesh = new THREE.Mesh(geom, material);
						overlayMesh.position.copy(mesh.position);
						overlayMesh.rotation.copy(mesh.rotation);
						overlayMesh.scale.copy(mesh.scale);
						overlayMesh.renderOrder =
							(mesh.renderOrder || 0) + renderOrderOffset;
						if (mesh.parent) {
							mesh.parent.add(overlayMesh);
						} else {
							this.scene.add(overlayMesh);
						}
						return overlayMesh;
					};

					// Create and add selected overlay mesh
					if (!this.selectedMesh && this.selectedMaterial) {
						this.selectedMesh = createOverlayMesh(this.selectedMaterial, 1);
					}

					// Create and add hovered overlay mesh
					if (!this.hoveredMesh && this.hoveredMaterial) {
						this.hoveredMesh = createOverlayMesh(this.hoveredMaterial, 2);
					}
				}
			});

			// Hide model during loading to prevent snap
			object.visible = false;

			// Apply transforms before adding to scene to avoid snap
			object.scale.setScalar(SceneConfig.model.scale);
			object.position.copy(SceneConfig.model.position);
			object.rotation.setFromVector3(SceneConfig.model.rotation);

			this.object = object;
			this.scene.add(object);

			// Show model after positioning
			object.visible = true;
			this.calculateLiverCenter();

			(
				window as typeof window & {
					liverAtlas?: {
						set: (t: Partial<AtlasTweak>) => void;
						get: () => AtlasTweak;
					};
				}
			).liverAtlas = {
				set: (t: Partial<AtlasTweak>) => this.setAtlasTweak(t),
				get: () => this.getAtlasTweak(),
			};

			// Complete load
			this.reportProgress(100);
			if (this.onModelReady) this.onModelReady();
		} catch (error) {
			console.error("Error loading liver model:", error);
			throw error;
		}
	}

	getPosition() {
		const target = this.object || this.mesh;
		return target ? target.position.clone() : new THREE.Vector3();
	}

	setPosition(position: THREE.Vector3) {
		const target = this.object || this.mesh;
		if (target) {
			target.position.copy(position);
		}
	}

	getMesh() {
		return this.mesh;
	}

	getObject() {
		return this.object;
	}

	getMaskTexture() {
		// Return the segmentation mask texture used for UV-based inscription picking
		return this.maskCanvas ? { image: this.maskCanvas } : null;
	}

	setHoveredInscription(inscriptionId: number) {
		this.currentHoveredId = inscriptionId;
		this.updateHoveredHighlight();
	}

	setSelectedInscription(inscriptionId: number) {
		this.currentSelectedId = inscriptionId;
		// Clear hover state when selecting to prevent overlap
		if (inscriptionId > 0) {
			this.currentHoveredId = 0;
			this.updateHoveredHighlight();
		}
		this.updateSelectedHighlight();
	}

	private updateHighlight(
		material: THREE.MeshStandardMaterial | null,
		inscriptionId: number,
		opacity: number,
	) {
		if (!this.atlasTexture || !material) return;

		if (!inscriptionId) {
			material.opacity = 0.0;
			material.needsUpdate = true;
			return;
		}

		this.applyHighlightToMaterial(inscriptionId, material, opacity);
	}

	private updateSelectedHighlight() {
		this.updateHighlight(this.selectedMaterial, this.currentSelectedId, 0.4);
	}

	private updateHoveredHighlight() {
		// Don't show hovered highlight if hovering over selected inscription to avoid overlap
		const hoverId =
			this.currentHoveredId && this.currentHoveredId !== this.currentSelectedId
				? this.currentHoveredId
				: 0;
		this.updateHighlight(this.hoveredMaterial, hoverId, 0.3);
	}

	private calculateUVCoordinates(labelId: number) {
		const tile = this.labelToTile[labelId];
		const baseU = 1 / Math.max(1, this.atlasCols);
		const baseV = 1 / Math.max(1, this.atlasRows);
		const { flipX, flipY, repeatScaleX, repeatScaleY, offsetX, offsetY } =
			this.atlasTweak;

		return {
			repeat: new THREE.Vector2(
				(flipX ? -1 : 1) * baseU * (repeatScaleX || 1),
				(flipY ? -1 : 1) * baseV * (repeatScaleY || 1),
			),
			offset: new THREE.Vector2(
				(flipX ? (tile.col + 1) * baseU : tile.col * baseU) + offsetX,
				(flipY ? 1 - (tile.row + 1) * baseV : tile.row * baseV) + offsetY,
			),
		};
	}

	private applyHighlightToMaterial(
		inscriptionId: number,
		material: THREE.MeshStandardMaterial,
		opacity: number,
	) {
		// Remap incoming id if configured
		let labelId = this.atlasTweak.idMap?.[inscriptionId] ?? inscriptionId;
		labelId = Math.round(labelId + (this.atlasTweak.idOffset || 0));

		if (!labelId || !this.labelToTile[labelId]) {
			material.opacity = 0.0;
			material.needsUpdate = true;
			return;
		}

		const { repeat, offset } = this.calculateUVCoordinates(labelId);

		// Create a clone of the atlas texture for this material
		const textureClone = this.atlasTexture?.clone();
		if (textureClone) {
			textureClone.repeat.copy(repeat);
			textureClone.offset.copy(offset);
			material.alphaMap = textureClone;
		}
		material.color.copy(this.getHighlightColor(labelId));
		material.opacity = opacity;
		material.needsUpdate = true;
	}

	getInscriptionAtUV(_u: number, _v: number): number {
		if (
			!this.maskCtx ||
			!this.maskCanvas ||
			this.maskWidth === 0 ||
			this.maskHeight === 0
		)
			return 0;
		// Clamp uv to [0,1]
		const u = Math.min(1, Math.max(0, _u));
		const v = Math.min(1, Math.max(0, _v));
		// Canvas origin is top-left; OBJ UV v=0 is bottom => use (1 - v)
		const x = Math.min(
			this.maskWidth - 1,
			Math.max(0, Math.floor(u * this.maskWidth)),
		);
		const y = Math.min(
			this.maskHeight - 1,
			Math.max(0, Math.floor((1 - v) * this.maskHeight)),
		);
		const data = this.maskCtx.getImageData(x, y, 1, 1).data;
		const id = data[0]; // red channel encodes id 0..255
		return id;
	}

	getModelMatrix(): THREE.Matrix4 {
		return this.object?.matrix || new THREE.Matrix4();
	}

	setOnModelReady(callback: () => void) {
		this.onModelReady = callback;
	}

	dispose() {
		// Use Three.js traverse to dispose of all meshes and materials
		const disposeObject = (obj: THREE.Object3D | null) => {
			if (!obj) return;

			obj.traverse((child) => {
				if ((child as THREE.Object3D & { isMesh?: boolean }).isMesh) {
					const mesh = child as THREE.Mesh;
					mesh.geometry?.dispose();
					if (Array.isArray(mesh.material)) {
						mesh.material.forEach((mat) => {
							mat.dispose();
						});
					} else {
						mesh.material?.dispose();
					}
				}
			});

			this.scene.remove(obj);
		};

		// Clean up all objects using traverse
		disposeObject(this.object);
		disposeObject(this.selectedMesh);
		disposeObject(this.hoveredMesh);

		// Clean up remaining resources
		this.mesh = null;
		this.object = null;
		this.selectedMesh = null;
		this.hoveredMesh = null;
		this.selectedMaterial = null;
		this.hoveredMaterial = null;
		this.atlasTexture?.dispose();
		this.atlasTexture = null;
		this.maskCanvas = null;
		this.maskCtx = null;
	}

	// Pulse animation - only runs once on initial load
	pulseAllInscriptions() {
		if (!this.mesh || !this.hoveredMaterial) return;

		const inscriptions = liverInscriptions.slice();
		const overlays: THREE.Mesh[] = [];

		// Use configuration from SceneConfig
		const config = SceneConfig.pulse;

		let index = 0;

		const addNext = () => {
			if (index >= inscriptions.length) {
				// Wait for trail to finish, then do final pulse
				setTimeout(() => {
					// Create final pulse with all inscriptions
					const finalOverlays: THREE.Mesh[] = [];

					inscriptions.forEach((inscription) => {
						const material = this.hoveredMaterial?.clone();
						if (!material || !this.mesh?.geometry) return;

						material.opacity = config.finalColor.startOpacity;
						this.applyHighlightToMaterial(
							inscription.id,
							material,
							config.finalColor.highlightOpacity,
						);

						const mesh = new THREE.Mesh(this.mesh.geometry, material);
						mesh.position.copy(this.mesh.position);
						mesh.rotation.copy(this.mesh.rotation);
						mesh.scale.copy(this.mesh.scale);

						(this.mesh?.parent || this.scene).add(mesh);
						finalOverlays.push(mesh);
					});

					// Final pulse animation - simple light pulse
					gsap
						.timeline()
						.to(
							finalOverlays.map((m) => m.material),
							{
								opacity: config.finalPulse.peakOpacity,
								duration: config.finalPulse.riseDuration,
								ease: "power2.out",
							},
						)
						.to(
							finalOverlays.map((m) => m.material),
							{
								opacity: 0,
								duration: config.finalPulse.fallDuration,
								ease: "power2.in",
								onComplete: () => {
									// Cleanup final overlays
									finalOverlays.forEach((mesh) => {
										(mesh.parent || this.scene).remove(mesh);
										if (Array.isArray(mesh.material)) {
											mesh.material.forEach((mat) => {
												mat.dispose();
											});
										} else {
											mesh.material.dispose();
										}
									});

									// Cleanup trail overlays
									overlays.forEach((mesh) => {
										(mesh.parent || this.scene).remove(mesh);
										if (Array.isArray(mesh.material)) {
											mesh.material.forEach((mat) => {
												mat.dispose();
											});
										} else {
											mesh.material.dispose();
										}
									});
								},
							},
						);
				}, config.trailDuration + config.finalPulseDelay); // Wait for trail to finish
				return;
			}

			// Create overlay for current inscription
			const material = this.hoveredMaterial?.clone();
			if (!material || !this.mesh?.geometry) return;

			material.opacity = config.trailColor.startOpacity;
			this.applyHighlightToMaterial(
				inscriptions[index].id,
				material,
				config.trailColor.highlightOpacity,
			);

			const mesh = new THREE.Mesh(this.mesh.geometry, material);
			mesh.position.copy(this.mesh.position);
			mesh.rotation.copy(this.mesh.rotation);
			mesh.scale.copy(this.mesh.scale);

			(this.mesh?.parent || this.scene).add(mesh);
			overlays.push(mesh);

			// Fade out this inscription after TRAIL_DURATION
			setTimeout(() => {
				gsap.to(material, {
					opacity: 0,
					duration: config.individualFadeDuration,
					ease: "power2.in",
					onComplete: () => {
						(mesh.parent || this.scene).remove(mesh);
						material.dispose();
					},
				});
			}, config.trailDuration);

			// Move to next inscription
			setTimeout(addNext, config.trailSpeed);
			index++;
		};

		addNext();
	}
}
