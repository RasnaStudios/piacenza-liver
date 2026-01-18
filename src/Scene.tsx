import { Box } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
// Core 3D logic
import { CameraController } from "./camera/Controller"
import { SceneConfig } from "./config/SceneConfig"
// Hooks
import { useOrientation } from "./hooks/useOrientation"
import {
  clearAboutHash,
  clearInscriptionHash,
  isAboutHash,
  parseInscriptionIdFromHash,
  setAboutHash,
  setInscriptionHash,
} from "./navigation"
import { InteractionManager } from "./scene/InteractionManager"
// Data
import { type Inscription, liverInscriptions } from "./scene/LiverData"
import { LiverModel } from "./scene/LiverModel"
import type { HoveredSection } from "./types"
import { InteractionMode } from "./types/interaction"
import { About } from "./ui/components/About"
import { ActionMenu } from "./ui/components/ActionMenu"
import { BraveDisclaimer } from "./ui/components/BraveDisclaimer"
import { HoverTooltip } from "./ui/components/HoverTooltip"
import { InteractionButton } from "./ui/components/InteractionButton"
import { ResetInstruction } from "./ui/components/ResetInstruction"
// UI Components
import { DeityPanel } from "./ui/DeityPanel"
import { InscriptionList } from "./ui/InscriptionList"
import "@mantine/core/styles.css"
import "./styles/global.css"

function PiacenzaLiverScene({
  isLoading,
  setIsLoading,
  setLoadingProgress,
  hasInteracted,
  setHasInteracted,
  setTitleVisible,
}: {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  hasInteracted: boolean
  setHasInteracted: (interacted: boolean) => void
  setTitleVisible: (visible: boolean) => void
}) {
  const navigate = useNavigate()
  // Orientation detection
  const isPortrait = useOrientation()
  const isSmallScreen = useMediaQuery("(max-width: 768px)")
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(
    InteractionMode.Loading,
  )
  const isAboutMode = interactionMode === InteractionMode.About
  const isInscriptionMode = interactionMode === InteractionMode.Inscription

  // State management
  const [selectedInscription, setSelectedInscription] =
    useState<Inscription | null>(null)
  const [hoveredSection, setHoveredSection] = useState<HoveredSection | null>(
    null,
  )
  const [isInteracting, setIsInteracting] = useState(false)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [isIntroTransitioning, setIsIntroTransitioning] = useState(false)
  const [immediateMousePosition, setImmediateMousePosition] = useState({
    x: 0,
    y: 0,
    isOverCanvas: true,
  })
  const [isMouseOverPanel, setIsMouseOverPanel] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [viewportKey, setViewportKey] = useState(0)
  const [cameraDebugInfo, setCameraDebugInfo] = useState<{
    position: THREE.Vector3
    target: THREE.Vector3
    localPosition: THREE.Vector3
    localTarget: THREE.Vector3
    offsetTargetScreenPos?: { x: number; y: number }
  } | null>(null)
  const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false)
  const [hasViewChanged, setHasViewChanged] = useState(false)

  // Refs for 3D objects and controllers
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)

  // Controller refs
  const cameraControllerRef = useRef<CameraController | null>(null)
  const liverModelRef = useRef<LiverModel | null>(null)
  const interactionManagerRef = useRef<InteractionManager | null>(null)

  // Animation frame ref
  const animationIdRef = useRef<number | null>(null)

  // Timeout refs to prevent panel re-opening after reset
  const panelTimeoutRef = useRef<number | null>(null)

  // Click debouncing to prevent rapid clicks
  const lastClickTimeRef = useRef<number>(0)
  const clickDebounceDelay = 300 // 300ms debounce
  const introTimeoutRef = useRef<number | null>(null)
  const initialAnimationTriggeredRef = useRef<boolean>(false)

  const getIntroPose = useCallback(() => {
    const aspect = window.innerWidth / window.innerHeight
    const minAspect = 1
    const maxAspect = 2.4
    const clamped = Math.min(Math.max(aspect, minAspect), maxAspect)
    const t = (clamped - minAspect) / (maxAspect - minAspect)
    const targetX = 4 + t * 4
    const position = SceneConfig.camera.lateral.clone()
    position.x += t * 5
    return {
      position,
      target: new THREE.Vector3(targetX, 0, 0),
    }
  }, [])

  // Particle animation refs
  const particleRefs = useRef<{
    particles: THREE.Points | null
    particlePositions: Float32Array | null
    particleVelocities: Float32Array | null
    particleCount: number
  }>({
    particles: null,
    particlePositions: null,
    particleVelocities: null,
    particleCount: 0,
  })

  // Debug camera info update (throttled)
  const updateDebugInfo = useCallback(() => {
    if (
      import.meta.env.VITE_DEBUG_ENABLED === "true" &&
      import.meta.env.VITE_DEBUG_SHOW_CAMERA_INFO === "true" &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const modelMatrix = liverModelRef.current?.getModelMatrix()
      const modelMatrixInverse = modelMatrix?.clone().invert()

      const worldPosition = cameraRef.current.position.clone()
      const worldTarget = controlsRef.current.target.clone()

      let localPosition = worldPosition.clone()
      let localTarget = worldTarget.clone()

      if (modelMatrixInverse) {
        localPosition = worldPosition.clone().applyMatrix4(modelMatrixInverse)
        localTarget = worldTarget.clone().applyMatrix4(modelMatrixInverse)
      }

      setCameraDebugInfo({
        position: worldPosition,
        target: worldTarget,
        localPosition: localPosition,
        localTarget: localTarget,
      })
    }
  }, [])

  // Optimized callback handlers
  const handleMarkerHover = useCallback(
    (section: HoveredSection | null) => {
      if (interactionMode === InteractionMode.About) {
        if (liverModelRef.current) {
          liverModelRef.current.setHoveredInscription(0)
        }
        setHoveredSection(null)
        return
      }

      setHoveredSection(section)
      if (liverModelRef.current) {
        if (section?.id) {
          liverModelRef.current.setHoveredInscription(section.id)
        } else {
          liverModelRef.current.setHoveredInscription(0)
        }
      }
    },
    [interactionMode],
  )

  const enableInteractionNow = useCallback(() => {
    setHasInteracted(true)
    setIsIntroTransitioning(false)
    setHasViewChanged(true)
    if (interactionManagerRef.current) {
      interactionManagerRef.current.setIntroAnimationMode(false)
      interactionManagerRef.current.setInteractionEnabled(true)
      interactionManagerRef.current.setHoverEnabled(true)
      interactionManagerRef.current.setClickEnabled(true)
    }
    if (controlsRef.current) {
      controlsRef.current.enabled = true
    }
    if (cameraRef.current && interactionManagerRef.current) {
      interactionManagerRef.current.setInitialCameraDistance(
        cameraRef.current.position.length(),
      )
    }
  }, [setHasInteracted, setTitleVisible])

  const startInteraction = useCallback(() => {
    if (
      hasInteracted ||
      isIntroTransitioning ||
      isLoading ||
      !isSceneReady ||
      !cameraControllerRef.current
    ) {
      return
    }

    clearAboutHash()
    setInteractionMode(InteractionMode.ThreeD)
    setIsIntroTransitioning(true)

    if (interactionManagerRef.current) {
      interactionManagerRef.current.setIntroAnimationMode(true)
    }

    enableInteractionNow()

    cameraControllerRef.current?.resetToDefault(
      liverModelRef.current,
      SceneConfig.camera.animationDuration,
      () => {
        liverModelRef.current?.pulseAllInscriptions()
      },
    )
  }, [
    hasInteracted,
    isIntroTransitioning,
    isLoading,
    isSceneReady,
    enableInteractionNow,
    setTitleVisible,
    setInteractionMode,
  ])

  const handleReset = useCallback(() => {
    if (!cameraControllerRef.current) return

    // Clear any pending panel timeout to prevent re-opening after reset
    if (panelTimeoutRef.current) {
      clearTimeout(panelTimeoutRef.current)
      panelTimeoutRef.current = null
    }
    if (introTimeoutRef.current) {
      clearTimeout(introTimeoutRef.current)
      introTimeoutRef.current = null
    }

    if (interactionManagerRef.current) {
      interactionManagerRef.current.setIntroAnimationMode(true)
    }

    cameraControllerRef.current.resetToDefault(
      liverModelRef.current,
      800,
      () => {
        if (interactionManagerRef.current) {
          interactionManagerRef.current.setIntroAnimationMode(false)
        }
      },
    )

    setSelectedInscription(null)
    setInteractionMode(InteractionMode.ThreeD)
    setTitleVisible(true)
    setIsInteracting(false)
    setHasViewChanged(false)
    clearInscriptionHash()
    if (interactionManagerRef.current) {
      interactionManagerRef.current.resetZoomState()
    }
  }, [setHasInteracted, setTitleVisible, setInteractionMode])

  const handleReturnToIntro = useCallback(() => {
    if (!cameraControllerRef.current || !cameraRef.current) return

    if (introTimeoutRef.current) {
      clearTimeout(introTimeoutRef.current)
      introTimeoutRef.current = null
    }

    setSelectedInscription(null)
    setInteractionMode(InteractionMode.About)
    setTitleVisible(true)
    setHasInteracted(false)
    setIsIntroTransitioning(false)
    setIsInteracting(false)
    setHasViewChanged(false)
    clearInscriptionHash()
    setAboutHash()

    if (interactionManagerRef.current) {
      interactionManagerRef.current.setIntroAnimationMode(true)
      interactionManagerRef.current.setInteractionEnabled(false)
      interactionManagerRef.current.setHoverEnabled(false)
      interactionManagerRef.current.setClickEnabled(true)
      interactionManagerRef.current.resetZoomState()
    }

    if (liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
    }

    const introPose = getIntroPose()
    cameraControllerRef.current.focusOn(
      introPose.target,
      introPose.position,
      800,
      false,
      () => {
        interactionManagerRef.current?.setIntroAnimationMode(false)
        if (controlsRef.current) {
          controlsRef.current.enabled = false
        }
      },
    )
  }, [getIntroPose, setHasInteracted, setInteractionMode])

  const handleViewChange = useCallback(() => {
    if (interactionMode === InteractionMode.About) return
    setHasViewChanged(true)
    setTitleVisible(false)
    // Update debug info when view changes (throttled by requestAnimationFrame)
    if (import.meta.env.VITE_DEBUG_ENABLED === "true") {
      requestAnimationFrame(updateDebugInfo)
    }
  }, [interactionMode, setTitleVisible, updateDebugInfo])
  const handleInscriptionClick = useCallback(
    (payload: {
      inscriptionId: number
      cameraLocalPosition: THREE.Vector3 // Camera position relative to liver model
      cameraLocalTarget: THREE.Vector3 // Camera target relative to liver model
      modelMatrix: THREE.Matrix4 // Transforms model-local coords to world coords (accounts for liver rotation when moved by the user with shift key)
    }) => {
      if (interactionMode === InteractionMode.About) {
        startInteraction()
        return
      }

      // Debounce rapid clicks
      const now = Date.now()
      if (now - lastClickTimeRef.current < clickDebounceDelay) {
        return
      }
      lastClickTimeRef.current = now

      const { inscriptionId, modelMatrix } = payload
      const inscription = liverInscriptions.find(
        (ins) => ins.id === inscriptionId,
      )
      if (
        !inscription ||
        !cameraControllerRef.current ||
        !liverModelRef.current
      )
        return

      setHasInteracted(true)
      setInteractionMode(InteractionMode.Inscription)
      setHasViewChanged(true)
      liverModelRef.current.setSelectedInscription(inscriptionId)

      // Show panel immediately for better responsiveness
      setSelectedInscription(inscription)

      setInscriptionHash(inscriptionId)

      if (cameraControllerRef.current) {
        cameraControllerRef.current.focusOn(
          inscription.cameraTarget,
          inscription.cameraPosition,
          600,
          true,
          undefined,
          modelMatrix,
        )
        // Clear any existing timeout before setting a new one
        if (panelTimeoutRef.current) {
          clearTimeout(panelTimeoutRef.current)
        }
      }
    },
    [
      interactionMode,
      startInteraction,
      setHasInteracted,
      setTitleVisible,
      setInteractionMode,
    ],
  )

  const handleInscriptionListClick = useCallback(
    (inscription: Inscription) => {
      if (interactionMode === InteractionMode.About) return
      if (!cameraControllerRef.current || !liverModelRef.current) return

      setHasInteracted(true)
      setInteractionMode(InteractionMode.Inscription)
      setHasViewChanged(true)
      liverModelRef.current.setSelectedInscription(inscription.id)
      setSelectedInscription(inscription)
      setInscriptionHash(inscription.id)
      cameraControllerRef.current.focusOn(
        inscription.cameraTarget,
        inscription.cameraPosition,
        500,
        true,
        undefined,
        liverModelRef.current.getModelMatrix(),
      )
    },
    [interactionMode, setHasInteracted, setTitleVisible, setInteractionMode],
  )

  const handleBackgroundClick = useCallback(
    (clickedOnLiver?: boolean) => {
      if (interactionMode === InteractionMode.About) {
        if (clickedOnLiver) {
          startInteraction()
        }
        return
      }

      setSelectedInscription(null)
      if (liverModelRef.current) {
        liverModelRef.current.setHoveredInscription(0)
      }
      clearInscriptionHash()
    },
    [interactionMode, startInteraction],
  )

  const handlePanelClose = useCallback(() => {
    setSelectedInscription(null)
    setInteractionMode(InteractionMode.ThreeD)
    clearInscriptionHash()
    clearAboutHash()

    if (
      cameraControllerRef.current &&
      liverModelRef.current &&
      !isSmallScreen &&
      !isPortrait
    ) {
      cameraControllerRef.current.resetToDefault(
        liverModelRef.current as LiverModel,
        800,
      )
    }

    if (liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
    }

    setIsInteracting(false)
  }, [setInteractionMode, isSmallScreen, isPortrait])

  const handleZoomDetected = useCallback(() => {
    if (interactionMode === InteractionMode.About) return
    setHasInteracted(true)
    setTitleVisible(false)
  }, [interactionMode, setHasInteracted, setTitleVisible])

  const handleModelRotate = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
    setHasViewChanged(true)
  }, [hasInteracted, setHasInteracted])

  // Mouse move handler with throttling to match raycast timing
  const mouseMoveTimeoutRef = useRef<number | null>(null)
  const handleMouseMove = useCallback(
    (position: { x: number; y: number }, isOverCanvas: boolean) => {
      // Clear existing timeout
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current)
      }

      // Throttle updates
      mouseMoveTimeoutRef.current = window.setTimeout(() => {
        setImmediateMousePosition({ ...position, isOverCanvas })
        mouseMoveTimeoutRef.current = null
      }, SceneConfig.performance.raycastThrottleMs)
    },
    [],
  )

  const handleModifierKeyChange = useCallback((isPressed: boolean) => {
    setIsModifierKeyPressed(isPressed)
  }, [])

  // Update container class based on interaction state
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      if (isInteracting) {
        container.classList.add("interacting")
      } else {
        container.classList.remove("interacting")
      }

      // Add or remove interacted class based on state
      if (hasInteracted) {
        container.classList.add("interacted")
      } else {
        container.classList.remove("interacted")
      }
    }
  }, [isInteracting, hasInteracted])

  useEffect(() => {
    const handleResize = () => {
      setViewportKey((current) => current + 1)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return
    if (
      interactionMode !== InteractionMode.About ||
      isIntroTransitioning ||
      !isSceneReady
    )
      return
    if (isPortrait) return

    const introPose = getIntroPose()
    cameraRef.current.position.copy(introPose.position)
    controlsRef.current.target.copy(introPose.target)
    controlsRef.current.update()
  }, [
    interactionMode,
    isIntroTransitioning,
    isSceneReady,
    isPortrait,
    getIntroPose,
    viewportKey,
  ])

  useEffect(() => {
    const isInteractive =
      interactionMode === InteractionMode.ThreeD ||
      interactionMode === InteractionMode.Inscription
    if (controlsRef.current) {
      controlsRef.current.enabled = isInteractive
    }
    if (interactionManagerRef.current) {
      interactionManagerRef.current.setInteractionEnabled(isInteractive)
      interactionManagerRef.current.setHoverEnabled(isInteractive)
      interactionManagerRef.current.setClickEnabled(true)
    }
    if (!isInteractive && liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
    }
  }, [interactionMode])

  // Trigger initial camera animation when scene is ready
  useEffect(() => {
    if (parseInscriptionIdFromHash() || isAboutHash()) {
      initialAnimationTriggeredRef.current = true
      return
    }
    if (
      !isSceneReady ||
      interactionMode !== InteractionMode.ThreeD ||
      initialAnimationTriggeredRef.current ||
      !cameraControllerRef.current ||
      !liverModelRef.current
    ) {
      return
    }

    initialAnimationTriggeredRef.current = true
    setIsIntroTransitioning(true)

    if (interactionManagerRef.current) {
      interactionManagerRef.current.setIntroAnimationMode(true)
    }

    cameraControllerRef.current.resetToDefault(
      liverModelRef.current,
      SceneConfig.camera.animationDuration,
      () => {
        liverModelRef.current?.pulseAllInscriptions()
        setIsIntroTransitioning(false)
        if (interactionManagerRef.current) {
          interactionManagerRef.current.setIntroAnimationMode(false)
        }
      },
    )
  }, [isSceneReady, interactionMode])

  // Initialize 3D scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x000000, 0.03)
    sceneRef.current = scene
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    camera.position.copy(SceneConfig.camera.initial)
    cameraRef.current = camera
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI
    controls.minDistance = 1.5
    controls.maxDistance = 10
    controls.target.copy(SceneConfig.model.position)
    controls.enabled = true
    controlsRef.current = controls
    setupLighting(scene)

    // Store particle references after lighting setup
    const particles = scene.children.find(
      (child) => child instanceof THREE.Points,
    ) as THREE.Points
    if (particles) {
      particleRefs.current.particles = particles
      particleRefs.current.particlePositions = particles.geometry.attributes
        .position.array as Float32Array
      particleRefs.current.particleVelocities = particles.geometry.attributes
        .velocity.array as Float32Array
      particleRefs.current.particleCount = 40 // particleCount from setupLighting
    }

    // Initialize controllers and models
    const cameraController = new CameraController(camera, controls)
    cameraControllerRef.current = cameraController

    try {
      const liverModel = new LiverModel(scene, setLoadingProgress)
      liverModelRef.current = liverModel
    } catch (e: unknown) {
      console.error("Failed to initialize LiverModel:", e)
      setErrorMsg(
        "Your browser or device does not support the required 3D features (WebGL). Please try updating your browser or using a different device.",
      )
      setIsLoading(false)
    }

    liverModelRef.current?.setOnModelReady(() => {
      setIsSceneReady(true)
      setIsLoading(false)
      setInteractionMode(InteractionMode.ThreeD)
    })

    // Add WebGL context loss handling
    const handleContextLoss = (event: Event) => {
      event.preventDefault()
      console.warn("WebGL context lost")
      setErrorMsg("3D rendering context was lost. Please refresh the page.")
    }

    const handleContextRestore = () => {
      console.log("WebGL context restored")
      setErrorMsg(null)
      // Reload the scene
      window.location.reload()
    }

    renderer.domElement.addEventListener("webglcontextlost", handleContextLoss)
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      handleContextRestore,
    )

    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener("resize", handleResize)

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()

      // Animate particles in main loop (throttled to 30fps)
      if (Math.random() < 0.5 && particleRefs.current.particles) {
        // ~30fps throttling
        const {
          particlePositions,
          particleVelocities,
          particleCount,
          particles,
        } = particleRefs.current
        if (particlePositions && particleVelocities) {
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3

            particlePositions[i3] += particleVelocities[i3]
            particlePositions[i3 + 1] += particleVelocities[i3 + 1]
            particlePositions[i3 + 2] += particleVelocities[i3 + 2]

            if (
              particlePositions[i3 + 1] < -1 ||
              Math.abs(particlePositions[i3]) > 2 ||
              Math.abs(particlePositions[i3 + 2] - 1.5) > 2
            ) {
              const height = Math.random() * 6
              const radius = (height / 6) * 1.8 * Math.random()
              const angle = Math.random() * Math.PI * 2

              particlePositions[i3] = Math.cos(angle) * radius
              particlePositions[i3 + 1] = 6 - height
              particlePositions[i3 + 2] = Math.sin(angle) * radius + 1.5
            }
          }
          particles.geometry.attributes.position.needsUpdate = true
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      // Clear any pending panel timeout
      if (panelTimeoutRef.current) {
        clearTimeout(panelTimeoutRef.current)
        panelTimeoutRef.current = null
      }
      if (introTimeoutRef.current) {
        clearTimeout(introTimeoutRef.current)
        introTimeoutRef.current = null
      }

      // Clear mouse move timeout
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current)
        mouseMoveTimeoutRef.current = null
      }

      cameraController?.dispose()
      liverModelRef.current?.dispose()
      interactionManagerRef.current?.dispose()

      renderer.dispose()
      scene.clear()

      window.removeEventListener("resize", handleResize)

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [setIsLoading, setLoadingProgress])
  useEffect(() => {
    if (
      rendererRef.current &&
      cameraRef.current &&
      controlsRef.current &&
      liverModelRef.current
    ) {
      if (interactionManagerRef.current) {
        interactionManagerRef.current.dispose()
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
          onModelRotate: handleModelRotate,
          onMouseMove: handleMouseMove,
          onModifierKeyChange: handleModifierKeyChange,
          onReset: handleReset,
          onViewChange: handleViewChange,
        },
      )
      interactionManager.setInteractionEnabled(
        interactionMode === InteractionMode.ThreeD ||
          interactionMode === InteractionMode.Inscription,
      )
      interactionManager.setHoverEnabled(
        interactionMode === InteractionMode.ThreeD ||
          interactionMode === InteractionMode.Inscription,
      )
      interactionManager.setClickEnabled(true)
      interactionManagerRef.current = interactionManager
    }
  }, [
    handleInscriptionClick,
    handleBackgroundClick,
    handleMarkerHover,
    handleZoomDetected,
    handleMouseMove,
    handleModifierKeyChange,
    handleReset,
    handleViewChange,
    handleModelRotate,
    interactionMode,
  ])

  // Clear hovered inscription when mouse enters panel area
  useEffect(() => {
    if (isMouseOverPanel && liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
      setHoveredSection(null)
    }
  }, [isMouseOverPanel])

  // Handle hash-based navigation (e.g., #inscription-3)
  useEffect(() => {
    // Check for #about hash on initial mount
    if (isAboutHash() && !isLoading && isSceneReady) {
      handleReturnToIntro()
    }
  }, [isLoading, isSceneReady, handleReturnToIntro])

  useEffect(() => {
    const handleHashNavigation = () => {
      // Check for #about hash
      if (isAboutHash()) {
        if (isSceneReady && interactionMode !== InteractionMode.About) {
          handleReturnToIntro()
        }
        return
      }

      // Check for inscription hash
      const inscriptionId = parseInscriptionIdFromHash()
      if (inscriptionId == null) return

      const inscription = liverInscriptions.find(
        (ins) => ins.id === inscriptionId,
      )
      if (!inscription) return

      // If scene is ready, select inscription immediately
      if (
        isSceneReady &&
        cameraControllerRef.current &&
        liverModelRef.current
      ) {
        // Skip loading screen and title overlay if navigating directly
        if (!hasInteracted) {
          setHasInteracted(true)
          setInteractionMode(InteractionMode.ThreeD)
          setTitleVisible(false)
          setIsLoading(false)
        }

        // Get model matrix from liver model
        const modelMatrix =
          liverModelRef.current.getModelMatrix() || new THREE.Matrix4()

        // Use a small delay to ensure state updates are processed
        setTimeout(() => {
          handleInscriptionClick({
            inscriptionId,
            cameraLocalPosition: inscription.cameraPosition,
            cameraLocalTarget: inscription.cameraTarget,
            modelMatrix,
          })
        }, 100)
      }
    }

    // Check hash on mount and when scene becomes ready
    if (isSceneReady) {
      handleHashNavigation()
    }

    // Listen for hash changes
    const handleHashChange = () => {
      handleHashNavigation()
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [
    isSceneReady,
    hasInteracted,
    interactionMode,
    handleInscriptionClick,
    handleReturnToIntro,
    setHasInteracted,
    setInteractionMode,
    setTitleVisible,
    setIsLoading,
  ])

  // Apply CSS classes to clip the Three.js canvas when panel is open
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Apply appropriate CSS classes based on panel state and device
    if (selectedInscription) {
      if (isPortrait || isSmallScreen) {
        container.classList.add("panel-open-mobile")
        container.classList.remove("panel-open-desktop")
      } else {
        container.classList.add("panel-open-desktop")
        container.classList.remove("panel-open-mobile")
      }
    } else {
      container.classList.remove("panel-open-desktop", "panel-open-mobile")
    }

    // Cleanup function
    return () => {
      container.classList.remove("panel-open-desktop", "panel-open-mobile")
    }
  }, [selectedInscription, isPortrait, isSmallScreen])

  return (
    <div className="piacenza-liver-app">
      <div className="scene-container">
        <div
          ref={containerRef}
          className={`three-container${isPortrait && isAboutMode ? " hidden" : ""}`}
        />

        {/* Modular UI components */}
        <section
          aria-label="UI Panel Container"
          onMouseEnter={() => setIsMouseOverPanel(true)}
          onMouseLeave={() => setIsMouseOverPanel(false)}
        >
          <About
            onStartInteraction={startInteraction}
            isVisible={isAboutMode && !isIntroTransitioning}
            isLoading={isLoading}
          />
          <DeityPanel
            selectedInscription={selectedInscription}
            onClose={handlePanelClose}
            onInscriptionSelect={handleInscriptionListClick}
            onAboutClick={handleReturnToIntro}
            onExploreClick={() => navigate("/inscriptions")}
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
          mousePosition={immediateMousePosition}
          isPanelOpen={isInscriptionMode}
          isModifierKeyPressed={isModifierKeyPressed}
          isMouseOverPanel={isMouseOverPanel}
        />

        <ResetInstruction
          isPanelOpen={isInscriptionMode}
          hasViewChanged={hasViewChanged}
        />
        {isSceneReady && !isLoading && !isAboutMode && (
          <>
            {!isPortrait && (
              <Box
                style={{
                  position: "fixed",
                  right: isSmallScreen ? "20px" : "40px",
                  bottom: isSmallScreen ? "20px" : "32px",
                  zIndex: 25,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "flex-end",
                  pointerEvents: "auto",
                }}
              >
                <InteractionButton
                  onClick={handleReturnToIntro}
                  variant="text"
                  size="md"
                >
                  About the Liver
                </InteractionButton>
                <InteractionButton
                  onClick={() => navigate("/inscriptions")}
                  variant="text"
                  size="md"
                >
                  Explore inscriptions
                </InteractionButton>
              </Box>
            )}
            <ActionMenu
              onAboutClick={handleReturnToIntro}
              onExploreClick={() => navigate("/inscriptions")}
              isVisible={isPortrait}
            />
          </>
        )}

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
  )
}

// Lighting setup function
function setupLighting(scene: THREE.Scene) {
  const config = SceneConfig.lighting

  // 3-Point Lighting Setup

  // 1. KEY LIGHT - Spotlight for dramatic shadows on floor
  const keyLight = new THREE.SpotLight(
    config.lightColor,
    150.0 * config.intensityMultiplier,
  )
  keyLight.position.set(0, 6, 3)
  keyLight.target.position.set(0, 0, 0)
  keyLight.angle = Math.PI / 6 // Narrower spotlight (30 degrees instead of 60)
  keyLight.penumbra = 0.95
  keyLight.decay = 2
  keyLight.distance = 15
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = config.shadowMapSize
  keyLight.shadow.mapSize.height = config.shadowMapSize
  keyLight.shadow.camera.near = 0.1
  keyLight.shadow.camera.far = 15
  keyLight.shadow.camera.fov = 45
  keyLight.shadow.bias = -0.0001
  keyLight.shadow.normalBias = 0.02
  scene.add(keyLight)
  scene.add(keyLight.target)

  // 2. FILL LIGHT - Softer light to fill shadows (front-left)
  const fillLight = new THREE.DirectionalLight(
    config.lightColor,
    0.4 * config.intensityMultiplier,
  )
  fillLight.position.set(-6, 4, 4)
  fillLight.target.position.set(0, 0, 0)
  fillLight.castShadow = true
  fillLight.shadow.mapSize.width = config.shadowMapSize
  fillLight.shadow.mapSize.height = config.shadowMapSize
  fillLight.shadow.camera.near = 0.1
  fillLight.shadow.camera.far = 20
  fillLight.shadow.camera.left = -10
  fillLight.shadow.camera.right = 10
  fillLight.shadow.camera.top = 10
  fillLight.shadow.camera.bottom = -10
  fillLight.shadow.bias = -0.0001
  fillLight.shadow.normalBias = 0.02
  fillLight.shadow.radius = 8
  scene.add(fillLight)
  scene.add(fillLight.target)

  // 3. BACK LIGHT - Rim lighting from behind (creates separation)
  const backLight = new THREE.DirectionalLight(
    config.lightColor,
    0.4 * config.intensityMultiplier,
  )
  backLight.position.set(-2, 6, -8)
  backLight.target.position.set(0, 0, 0)
  backLight.castShadow = true
  backLight.shadow.mapSize.width = config.shadowMapSize
  backLight.shadow.mapSize.height = config.shadowMapSize
  backLight.shadow.camera.near = 0.1
  backLight.shadow.camera.far = 20
  backLight.shadow.camera.left = -10
  backLight.shadow.camera.right = 10
  backLight.shadow.camera.top = 10
  backLight.shadow.camera.bottom = -10
  backLight.shadow.bias = -0.0001
  backLight.shadow.normalBias = 0.02
  backLight.shadow.radius = 8
  scene.add(backLight)
  scene.add(backLight.target)

  // Subtle bottom fill for inscription visibility
  const bottomFill = new THREE.PointLight(
    config.lightColor,
    10 * config.intensityMultiplier,
    100,
    2,
  )
  bottomFill.position.set(0, -6, 0)
  bottomFill.castShadow = false
  scene.add(bottomFill)

  // Extremely subtle dust particles
  const particleCount = 40
  const particleGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const height = Math.random() * 6
    const radius = (height / 6) * 1.8 * Math.random()
    const angle = Math.random() * Math.PI * 2

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = 6 - height
    positions[i3 + 2] = Math.sin(angle) * radius + 1.5

    velocities[i3] = (Math.random() - 0.5) * 0.0005
    velocities[i3 + 1] = -Math.random() * 0.0003
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.0005
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  )
  particleGeometry.setAttribute(
    "velocity",
    new THREE.BufferAttribute(velocities, 3),
  )

  const particleMaterial = new THREE.PointsMaterial({
    color: config.lightColor,
    size: 0.005,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)

  // Minimal ambient light for dramatic museum effect
  const ambientLight = new THREE.AmbientLight(
    config.ambientColor,
    1.5 * config.intensityMultiplier,
  )
  scene.add(ambientLight)

  // Large museum floor plane - dark but receives shadows
  const floorGeometry = new THREE.PlaneGeometry(5000, 5000)
  const floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x222222,
    transparent: false,
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, -3.0, 0)
  floor.receiveShadow = true
  scene.add(floor)
}

export default function Scene({
  isLoading,
  setIsLoading,
  setLoadingProgress,
  hasInteracted,
  setHasInteracted,
  setTitleVisible,
}: {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  hasInteracted: boolean
  setHasInteracted: (interacted: boolean) => void
  setTitleVisible: (visible: boolean) => void
}) {
  return (
    <PiacenzaLiverScene
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      setLoadingProgress={setLoadingProgress}
      hasInteracted={hasInteracted}
      setHasInteracted={setHasInteracted}
      setTitleVisible={setTitleVisible}
    />
  )
}
