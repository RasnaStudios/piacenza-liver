import { MantineProvider } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// Core 3D logic
import { CameraController } from "./camera/Controller";
import { SceneConfig } from "./config/SceneConfig";
import { InteractionManager } from "./scene/InteractionManager";
// Data
import { type Inscription, liverInscriptions } from "./scene/LiverData";
import { LiverModel } from "./scene/LiverModel";
import type { HoveredSection } from "./types";
import { BraveDisclaimer } from "./ui/components/BraveDisclaimer";
import { DataSummary } from "./ui/components/DataSummary";
import { HoverTooltip } from "./ui/components/HoverTooltip";
// UI Components
import { DeityPanel } from "./ui/DeityPanel";
import { InscriptionList } from "./ui/InscriptionList";
import { LoadingScreen } from "./ui/LoadingScreen";
import "@mantine/core/styles.css";
import "./styles/global.css";

function PiacenzaLiverScene() {
	// State management
	const [selectedInscription, setSelectedInscription] =
		useState<Inscription | null>(null);
	const [hoveredSection, setHoveredSection] = useState<HoveredSection | null>(
		null,
	);
	const [isInteracting, setIsInteracting] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [mousePosition, setMousePosition] = useState({
		x: 0,
		y: 0,
		isOverCanvas: true,
	});
	const [isMouseOverPanel, setIsMouseOverPanel] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [cameraDebugInfo, setCameraDebugInfo] = useState<{
		position: THREE.Vector3;
		target: THREE.Vector3;
		localPosition: THREE.Vector3;
		localTarget: THREE.Vector3;
		offsetTargetScreenPos?: { x: number; y: number };
	} | null>(null);
	const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);

	// Refs for 3D objects and controllers
	const containerRef = useRef<HTMLDivElement | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);

	// Controller refs
	const cameraControllerRef = useRef<CameraController | null>(null);
	const liverModelRef = useRef<LiverModel | null>(null);
	const interactionManagerRef = useRef<InteractionManager | null>(null);

	// Animation frame ref
	const animationIdRef = useRef<number | null>(null);

	// Timeout refs to prevent panel re-opening after reset
	const panelTimeoutRef = useRef<number | null>(null);

	// Optimized callback handlers
	const handleMarkerHover = useCallback((section: HoveredSection | null) => {
		setHoveredSection(section);
		if (liverModelRef.current) {
			if (section?.id) {
				liverModelRef.current.setHoveredInscription(section.id);
			} else {
				liverModelRef.current.setHoveredInscription(0);
			}
		}
	}, []);

	const handleReset = useCallback(() => {
		if (!cameraControllerRef.current) return;

		// Clear any pending panel timeout to prevent re-opening after reset
		if (panelTimeoutRef.current) {
			clearTimeout(panelTimeoutRef.current);
			panelTimeoutRef.current = null;
		}

		if (interactionManagerRef.current) {
			interactionManagerRef.current.setIntroAnimationMode(true);
		}

		cameraControllerRef.current.resetToDefault(
			liverModelRef.current,
			800,
			() => {
				if (interactionManagerRef.current) {
					interactionManagerRef.current.setIntroAnimationMode(false);
				}
			},
		);

		setSelectedInscription(null);
		setHasInteracted(false);
		setIsInteracting(false);
		if (interactionManagerRef.current) {
			interactionManagerRef.current.resetZoomState();
		}
	}, []);

	const handleInscriptionClick = useCallback(
		(payload: {
			inscriptionId: number;
			cameraLocalPosition: THREE.Vector3; // Camera position relative to liver model
			cameraLocalTarget: THREE.Vector3; // Camera target relative to liver model
			modelMatrix: THREE.Matrix4; // Transforms model-local coords to world coords (accounts for liver rotation when moved by the user with shift key)
		}) => {
			const { inscriptionId, modelMatrix } = payload;
			const inscription = liverInscriptions.find(
				(ins) => ins.id === inscriptionId,
			);
			if (
				!inscription ||
				!cameraControllerRef.current ||
				!liverModelRef.current
			)
				return;

			setHasInteracted(true);
			liverModelRef.current.setSelectedInscription(inscriptionId);

			if (cameraControllerRef.current) {
				cameraControllerRef.current.focusOn(
					inscription.cameraTarget,
					inscription.cameraPosition,
					1000,
					true,
					undefined,
					modelMatrix,
				);
				// Clear any existing timeout before setting a new one
				if (panelTimeoutRef.current) {
					clearTimeout(panelTimeoutRef.current);
				}
			}
			setSelectedInscription(inscription);
		},
		[],
	);

	const handleInscriptionListClick = useCallback((inscription: Inscription) => {
		if (!cameraControllerRef.current || !liverModelRef.current) return;

		setHasInteracted(true);
		liverModelRef.current.setSelectedInscription(inscription.id);
		setSelectedInscription(inscription);
		cameraControllerRef.current.focusOn(
			inscription.cameraTarget,
			inscription.cameraPosition,
			800,
			true,
			undefined,
			liverModelRef.current.getModelMatrix(),
		);
	}, []);

	const handleBackgroundClick = useCallback(() => {
		setSelectedInscription(null);
		if (liverModelRef.current) {
			liverModelRef.current.setHoveredInscription(0);
		}
	}, []);

	const handlePanelClose = useCallback(() => {
		setSelectedInscription(null);

		if (cameraControllerRef.current && liverModelRef.current && !isMobile) {
			cameraControllerRef.current.resetToDefault(
				liverModelRef.current as LiverModel,
				800,
			);
		}

		if (liverModelRef.current) {
			liverModelRef.current.setHoveredInscription(0);
		}

		setIsInteracting(false);
	}, []);

	const handleZoomDetected = useCallback(() => {
		setHasInteracted(true);
	}, []);

	const handleMouseMove = useCallback(
		(position: { x: number; y: number }, isOverCanvas: boolean) => {
			setMousePosition({ ...position, isOverCanvas });
		},
		[],
	);

	const handleModifierKeyChange = useCallback((isPressed: boolean) => {
		setIsModifierKeyPressed(isPressed);
	}, []);

	// Update container class based on interaction state
	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			if (isInteracting) {
				container.classList.add("interacting");
			} else {
				container.classList.remove("interacting");
			}

			// Add or remove interacted class based on state
			if (hasInteracted) {
				container.classList.add("interacted");
			} else {
				container.classList.remove("interacted");
			}
		}
	}, [isInteracting, hasInteracted]);

	// Initialize 3D scene
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);
		scene.fog = new THREE.FogExp2(0x000000, 0.03);
		sceneRef.current = scene;
		const camera = new THREE.PerspectiveCamera(
			60,
			container.clientWidth / container.clientHeight,
			0.1,
			1000,
		);
		camera.position.copy(SceneConfig.camera.initial);
		cameraRef.current = camera;
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setClearColor(0x000000, 0);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);
		rendererRef.current = renderer;
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.maxPolarAngle = Math.PI;
		controls.minDistance = 1.5;
		controls.maxDistance = 10;
		controls.target.copy(new THREE.Vector3(0, 0, 0));
		controlsRef.current = controls;
		setupLighting(scene);

		const handleLoadingProgress = (progress: number) => {
			setLoadingProgress(progress);
		};

		// Initialize controllers and models
		const cameraController = new CameraController(camera, controls);
		cameraControllerRef.current = cameraController;

		try {
			const liverModel = new LiverModel(scene, handleLoadingProgress);
			liverModelRef.current = liverModel;
		} catch (e: unknown) {
			console.error("Failed to initialize LiverModel:", e);
			setErrorMsg(
				"Your browser or device does not support the required 3D features (WebGL). Please try updating your browser or using a different device.",
			);
			setIsLoading(false);
		}

		liverModelRef.current?.setOnModelReady(() => {
			setIsLoading(false);
			setTimeout(() => {
				if (cameraControllerRef.current && interactionManagerRef.current) {
					interactionManagerRef.current.setIntroAnimationMode(true);
					liverModelRef.current?.pulseAllInscriptions();
					cameraControllerRef.current.playIntroAnimation(() => {
						interactionManagerRef.current?.setIntroAnimationMode(false);
						interactionManagerRef.current?.setInitialCameraDistance(
							cameraRef.current ? cameraRef.current.position.length() : 0,
						);
					}, liverModelRef.current?.getLiverCenter() || undefined);
				}
			}, 800);
		});

		// Add WebGL context loss handling
		const handleContextLoss = (event: Event) => {
			event.preventDefault();
			console.warn("WebGL context lost");
			setErrorMsg("3D rendering context was lost. Please refresh the page.");
		};

		const handleContextRestore = () => {
			console.log("WebGL context restored");
			setErrorMsg(null);
			// Reload the scene
			window.location.reload();
		};

		renderer.domElement.addEventListener("webglcontextlost", handleContextLoss);
		renderer.domElement.addEventListener(
			"webglcontextrestored",
			handleContextRestore,
		);

		const handleResize = () => {
			const width = container.clientWidth;
			const height = container.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};
		window.addEventListener("resize", handleResize);

		const animate = () => {
			animationIdRef.current = requestAnimationFrame(animate);
			controls.update();

			// Update camera debug info
			if (
				import.meta.env.VITE_DEBUG_ENABLED === "true" &&
				import.meta.env.VITE_DEBUG_SHOW_CAMERA_INFO === "true"
			) {
				// Convert world coordinates to model-local coordinates
				const modelMatrix = liverModelRef.current?.getModelMatrix();
				const modelMatrixInverse = modelMatrix?.clone().invert();

				const worldPosition = camera.position.clone();
				const worldTarget = controls.target.clone();

				let localPosition = worldPosition.clone();
				let localTarget = worldTarget.clone();

				if (modelMatrixInverse) {
					localPosition = worldPosition
						.clone()
						.applyMatrix4(modelMatrixInverse);
					localTarget = worldTarget.clone().applyMatrix4(modelMatrixInverse);
				}

				setCameraDebugInfo({
					position: worldPosition,
					target: worldTarget,
					localPosition: localPosition,
					localTarget: localTarget,
				});
			}

			renderer.render(scene, camera);
		};
		animate();

		return () => {
			if (animationIdRef.current) {
				cancelAnimationFrame(animationIdRef.current);
			}

			// Clear any pending panel timeout
			if (panelTimeoutRef.current) {
				clearTimeout(panelTimeoutRef.current);
				panelTimeoutRef.current = null;
			}

			cameraController?.dispose();
			liverModelRef.current?.dispose();
			interactionManagerRef.current?.dispose();

			renderer.dispose();
			scene.clear();

			window.removeEventListener("resize", handleResize);

			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		};
	}, []);
	useEffect(() => {
		if (
			rendererRef.current &&
			cameraRef.current &&
			controlsRef.current &&
			liverModelRef.current
		) {
			if (interactionManagerRef.current) {
				interactionManagerRef.current.dispose();
			}

			const interactionManager = new InteractionManager(
				rendererRef.current,
				cameraRef.current,
				controlsRef.current,
				liverModelRef.current,
				liverInscriptions,
				{
					onInscriptionClick: handleInscriptionClick,
					onBackgroundClick: handleBackgroundClick,
					onMarkerHover: handleMarkerHover,
					onZoomDetected: handleZoomDetected,
					onMouseMove: handleMouseMove,
					onModifierKeyChange: handleModifierKeyChange,
					onReset: handleReset,
				},
			);
			interactionManagerRef.current = interactionManager;
		}
	}, [
		handleInscriptionClick,
		handleBackgroundClick,
		handleMarkerHover,
		handleZoomDetected,
		handleMouseMove,
		handleModifierKeyChange,
		handleReset,
	]);

	// Clear hovered inscription when mouse enters panel area
	useEffect(() => {
		if (isMouseOverPanel && liverModelRef.current) {
			liverModelRef.current.setHoveredInscription(0);
			setHoveredSection(null);
		}
	}, [isMouseOverPanel]);

	return (
		<div className="piacenza-liver-app">
			<div className="scene-container">
				<div ref={containerRef} className="three-container" />

				{/* Modular UI components */}
				<section
					aria-label="UI Panel Container"
					onMouseEnter={() => setIsMouseOverPanel(true)}
					onMouseLeave={() => setIsMouseOverPanel(false)}
				>
					<DeityPanel
						selectedInscription={selectedInscription}
						onClose={handlePanelClose}
						onInscriptionSelect={handleInscriptionListClick}
					/>
					<InscriptionList
						onInscriptionSelect={handleInscriptionListClick}
						selectedInscription={selectedInscription}
						isLoading={isLoading}
						hasInteracted={hasInteracted}
					/>
				</section>

				<HoverTooltip
					hoveredSection={hoveredSection}
					mousePosition={mousePosition}
					isPanelOpen={!!selectedInscription}
					isModifierKeyPressed={isModifierKeyPressed}
					isMouseOverPanel={isMouseOverPanel}
				/>

				{/* Debug Overlay */}
				{import.meta.env.VITE_DEBUG_ENABLED === "true" &&
					import.meta.env.VITE_DEBUG_SHOW_CAMERA_INFO === "true" &&
					cameraDebugInfo && (
						<div
							style={{
								position: "fixed",
								top: "10px",
								left: "10px",
								background: "rgba(0, 0, 0, 0.8)",
								color: "white",
								padding: "10px",
								fontFamily: "monospace",
								fontSize: "12px",
								borderRadius: "5px",
								zIndex: 1000,
								pointerEvents: "none",
							}}
						>
							<div style={{ fontWeight: "bold", marginBottom: "5px" }}>
								WORLD COORDINATES
							</div>
							<div>Camera Position:</div>
							<div>x: {cameraDebugInfo.position.x.toFixed(3)}</div>
							<div>y: {cameraDebugInfo.position.y.toFixed(3)}</div>
							<div>z: {cameraDebugInfo.position.z.toFixed(3)}</div>
							<div style={{ marginTop: "10px" }}>Camera Target:</div>
							<div>x: {cameraDebugInfo.target.x.toFixed(3)}</div>
							<div>y: {cameraDebugInfo.target.y.toFixed(3)}</div>
							<div>z: {cameraDebugInfo.target.z.toFixed(3)}</div>

							<div
								style={{
									fontWeight: "bold",
									marginTop: "15px",
									marginBottom: "5px",
								}}
							>
								LOCAL COORDINATES
							</div>
							<div>Camera Position:</div>
							<div>x: {cameraDebugInfo.localPosition.x.toFixed(3)}</div>
							<div>y: {cameraDebugInfo.localPosition.y.toFixed(3)}</div>
							<div>z: {cameraDebugInfo.localPosition.z.toFixed(3)}</div>
							<div style={{ marginTop: "10px" }}>Camera Target:</div>
							<div>x: {cameraDebugInfo.localTarget.x.toFixed(3)}</div>
							<div>y: {cameraDebugInfo.localTarget.y.toFixed(3)}</div>
							<div>z: {cameraDebugInfo.localTarget.z.toFixed(3)}</div>
						</div>
					)}

				{/* Center Dot */}
				{import.meta.env.VITE_DEBUG_ENABLED === "true" &&
					import.meta.env.VITE_DEBUG_SHOW_CENTER_DOT === "true" && (
						<>
							{/* Original center */}
							<div
								style={{
									position: "fixed",
									top: "50%",
									left: "50%",
									width: "4px",
									height: "4px",
									background: "red",
									borderRadius: "50%",
									transform: "translate(-50%, -50%)",
									zIndex: 1000,
									pointerEvents: "none",
								}}
							/>
							{/* New center (offset based on actual screen projection) */}
							{cameraDebugInfo?.offsetTargetScreenPos && (
								<div
									style={{
										position: "fixed",
										top: `${cameraDebugInfo.offsetTargetScreenPos.y}px`,
										left: `${cameraDebugInfo.offsetTargetScreenPos.x}px`,
										width: "6px",
										height: "6px",
										background: "blue",
										borderRadius: "50%",
										transform: "translate(-50%, -50%)",
										zIndex: 1000,
										pointerEvents: "none",
									}}
								/>
							)}
						</>
					)}

				{!isLoading && <BraveDisclaimer />}

				<LoadingScreen progress={loadingProgress} isLoading={isLoading} />

				{/* Data Summary */}
				<DataSummary />

				{/* Brave Browser Disclaimer */}
				<BraveDisclaimer />

				{/* Compatibility/Error Banner */}
				{errorMsg && (
					<div
						style={{
							position: "fixed",
							bottom: 12,
							left: "50%",
							transform: "translateX(-50%)",
							background: "rgba(0,0,0,0.8)",
							color: "#fff",
							padding: "10px 14px",
							borderRadius: 6,
							fontSize: 14,
							zIndex: 10000,
							maxWidth: "90vw",
							textAlign: "center" as const,
							border: "1px solid #333",
						}}
						role="alert"
					>
						{errorMsg}
					</div>
				)}
			</div>
		</div>
	);
}

// Lighting setup function
function setupLighting(scene: THREE.Scene) {
	const lightColor = 0xfff4e6;

	// 3-Point Lighting Setup

	// 1. KEY LIGHT - Spotlight for dramatic shadows on floor
	const keyLight = new THREE.SpotLight(0xfff4e6, 80.0);
	keyLight.position.set(0, 6, 3);
	keyLight.target.position.set(0, 0, 0);
	keyLight.angle = Math.PI / 6;
	keyLight.penumbra = 0.9;
	keyLight.decay = 2;
	keyLight.distance = 15;
	keyLight.castShadow = true;
	keyLight.shadow.mapSize.width = 256;
	keyLight.shadow.mapSize.height = 256;
	keyLight.shadow.camera.near = 0.1;
	keyLight.shadow.camera.far = 15;
	keyLight.shadow.camera.fov = 30;
	keyLight.shadow.bias = -0.0001;
	keyLight.shadow.normalBias = 0.02;
	(keyLight.shadow as unknown as THREE.DirectionalLightShadow).radius = 8;
	scene.add(keyLight);
	scene.add(keyLight.target);

	// 2. FILL LIGHT - Softer light to fill shadows (front-left, lower intensity)
	const fillLight = new THREE.DirectionalLight(0xfff4e6, 0.8);
	fillLight.position.set(-6, 4, 4);
	fillLight.target.position.set(0, 0, 0);
	fillLight.castShadow = false;
	scene.add(fillLight);
	scene.add(fillLight.target);

	// 3. BACK LIGHT - Rim lighting from behind (creates separation)
	const backLight = new THREE.DirectionalLight(0xfff4e6, 0.4);
	backLight.position.set(-2, 6, -8);
	backLight.target.position.set(0, 0, 0);
	backLight.castShadow = false;
	scene.add(backLight);
	scene.add(backLight.target);

	// Subtle bottom fill for inscription visibility
	const bottomFill = new THREE.PointLight(lightColor, 8, 12, 2);
	bottomFill.position.set(0, -6, 0);
	bottomFill.castShadow = false;
	scene.add(bottomFill);

	// Extremely subtle dust particles
	const particleCount = 40;
	const particleGeometry = new THREE.BufferGeometry();
	const positions = new Float32Array(particleCount * 3);
	const velocities = new Float32Array(particleCount * 3);

	for (let i = 0; i < particleCount; i++) {
		const i3 = i * 3;
		const height = Math.random() * 6;
		const radius = (height / 6) * 1.8 * Math.random();
		const angle = Math.random() * Math.PI * 2;

		positions[i3] = Math.cos(angle) * radius;
		positions[i3 + 1] = 6 - height;
		positions[i3 + 2] = Math.sin(angle) * radius + 1.5;

		velocities[i3] = (Math.random() - 0.5) * 0.0005;
		velocities[i3 + 1] = -Math.random() * 0.0003;
		velocities[i3 + 2] = (Math.random() - 0.5) * 0.0005;
	}

	particleGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3),
	);
	particleGeometry.setAttribute(
		"velocity",
		new THREE.BufferAttribute(velocities, 3),
	);

	const particleMaterial = new THREE.PointsMaterial({
		color: lightColor,
		size: 0.005,
		transparent: true,
		opacity: 0.12,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});

	const particles = new THREE.Points(particleGeometry, particleMaterial);
	scene.add(particles);

	const animateParticles = () => {
		const positions = particles.geometry.attributes.position.array;
		const velocities = particles.geometry.attributes.velocity.array;

		for (let i = 0; i < particleCount; i++) {
			const i3 = i * 3;

			positions[i3] += velocities[i3];
			positions[i3 + 1] += velocities[i3 + 1];
			positions[i3 + 2] += velocities[i3 + 2];

			if (
				positions[i3 + 1] < -1 ||
				Math.abs(positions[i3]) > 2 ||
				Math.abs(positions[i3 + 2] - 1.5) > 2
			) {
				const height = Math.random() * 6;
				const radius = (height / 6) * 1.8 * Math.random();
				const angle = Math.random() * Math.PI * 2;

				positions[i3] = Math.cos(angle) * radius;
				positions[i3 + 1] = 6 - height;
				positions[i3 + 2] = Math.sin(angle) * radius + 1.5;
			}
		}

		particles.geometry.attributes.position.needsUpdate = true;
		requestAnimationFrame(animateParticles);
	};
	animateParticles();

	// Minimal ambient light for dramatic museum effect
	const ambientLight = new THREE.AmbientLight(0x1a1611, 1);
	scene.add(ambientLight);

	// Large museum floor plane - dark but receives shadows
	const floorGeometry = new THREE.PlaneGeometry(5000, 5000);
	const floorMaterial = new THREE.MeshLambertMaterial({
		color: 0x222222,
		transparent: false,
	});
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.position.set(0, -3.0, 0);
	floor.receiveShadow = true;
	scene.add(floor);
}

export default function App() {
	return (
		<MantineProvider>
			<PiacenzaLiverScene />
		</MantineProvider>
	);
}
