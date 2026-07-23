import { Box } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { FiArrowLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
// Core 3D logic
import { CameraController } from "./camera/Controller"
import { getIntroPose } from "./camera/introPose"
import { SceneConfig } from "./config/SceneConfig"
// Hooks
import { useOrientation } from "./hooks/useOrientation"
import { buildLocalizedPath, getLocalePrefix } from "./i18n/localeRouting"
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
import type { SceneProps } from "./scene/SceneProps"
import { setupLighting } from "./scene/setupLighting"
import type { HoveredSection } from "./types"
import { InteractionMode } from "./types/interaction"
import { About } from "./ui/components/About"
import { ActionButtons } from "./ui/components/ActionButtons"
import { ActionMenu } from "./ui/components/ActionMenu"
import { BraveDisclaimer } from "./ui/components/BraveDisclaimer"
import {
  HoverTooltip,
  type HoverTooltipHandle,
} from "./ui/components/HoverTooltip"
import { ResetInstruction } from "./ui/components/ResetInstruction"
// UI Components
import { DeityPanel } from "./ui/DeityPanel"
import { InscriptionList } from "./ui/InscriptionList"

function PiacenzaLiverScene({
  isLoading,
  setIsLoading,
  setLoadingProgress,
  hasInteracted,
  setHasInteracted,
  setTitleVisible,
}: SceneProps) {
  const navigate = useNavigate()
  const { i18n } = useTranslation("common")
  // Orientation detection
  const isPortrait = useOrientation()
  const isSmallScreen = useMediaQuery("(max-width: 768px)")
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(
    InteractionMode.Loading,
  )
  const isAboutMode = interactionMode === InteractionMode.About
  const isInscriptionMode = interactionMode === InteractionMode.Inscription
  const localePrefix = getLocalePrefix(i18n.language)
  const inscriptionsPath = buildLocalizedPath("/inscriptions", localePrefix)

  // State management
  const [selectedInscription, setSelectedInscription] =
    useState<Inscription | null>(null)
  const [hoveredSection, setHoveredSection] = useState<HoveredSection | null>(
    null,
  )
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [isIntroTransitioning, setIsIntroTransitioning] = useState(false)
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
  const cameraFillLightRef = useRef<THREE.SpotLight | null>(null)
  const cameraFillTargetRef = useRef<THREE.Object3D | null>(null)

  // Controller refs
  const cameraControllerRef = useRef<CameraController | null>(null)
  const liverModelRef = useRef<LiverModel | null>(null)
  const interactionManagerRef = useRef<InteractionManager | null>(null)
  const hoverTooltipRef = useRef<HoverTooltipHandle | null>(null)

  // Animation frame ref
  const animationIdRef = useRef<number | null>(null)
  const renderRequestedRef = useRef(true)

  // Click debouncing to prevent rapid clicks
  const lastClickTimeRef = useRef<number>(0)
  const clickDebounceDelay = 300 // 300ms debounce
  const initialAnimationTriggeredRef = useRef<boolean>(false)
  const initialCameraDistanceRef = useRef<number | null>(null)
  const initialCameraTargetRef = useRef<THREE.Vector3 | null>(null)
  const hashNavigationTimeoutRef = useRef<number | null>(null)

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

    if (liverModelRef.current) {
      liverModelRef.current.setSelectedInscription(0)
      liverModelRef.current.setHoveredInscription(0)
    }

    setSelectedInscription(null)
    setInteractionMode(InteractionMode.ThreeD)
    setTitleVisible(true)
    setHasViewChanged(false)
    clearInscriptionHash()
    if (interactionManagerRef.current) {
      interactionManagerRef.current.resetZoomState()
    }
  }, [setHasInteracted, setTitleVisible, setInteractionMode])

  const handleReturnToIntro = useCallback(() => {
    if (!cameraControllerRef.current || !cameraRef.current) return

    setSelectedInscription(null)
    setInteractionMode(InteractionMode.About)
    setTitleVisible(true)
    setHasInteracted(false)
    setIsIntroTransitioning(false)
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
  }, [setHasInteracted, setInteractionMode])

  const handleViewChange = useCallback(() => {
    if (interactionMode === InteractionMode.About) return

    const camera = cameraRef.current
    const controls = controlsRef.current
    let isZoomOrPan = true

    if (camera && controls) {
      if (initialCameraDistanceRef.current == null) {
        initialCameraDistanceRef.current = camera.position.length()
      }
      if (!initialCameraTargetRef.current) {
        initialCameraTargetRef.current = controls.target.clone()
      }
      const baselineDist =
        initialCameraDistanceRef.current ?? camera.position.length()
      const baselineTarget =
        initialCameraTargetRef.current ?? controls.target.clone()
      const distDelta = Math.abs(camera.position.length() - baselineDist)
      const targetDelta = controls.target.distanceTo(baselineTarget)
      isZoomOrPan = distDelta > 0.05 || targetDelta > 0.05
    }

    setHasViewChanged(true)
    if (isZoomOrPan) {
      setTitleVisible(false)
    }
    // Update debug info when view changes (throttled by requestAnimationFrame)
    if (import.meta.env.VITE_DEBUG_ENABLED === "true") {
      requestAnimationFrame(updateDebugInfo)
    }
  }, [interactionMode, setHasViewChanged, setTitleVisible, updateDebugInfo])
  const getScaledCameraPosition = useCallback(
    (position: THREE.Vector3, target: THREE.Vector3) => {
      const desiredDistance = SceneConfig.inscriptions.cameraDistance
      const direction = position.clone().sub(target)
      const currentLength = direction.length()
      if (!Number.isFinite(currentLength) || currentLength < 1e-3) {
        return target
          .clone()
          .add(new THREE.Vector3(0, 1, 0).multiplyScalar(desiredDistance))
      }
      return target
        .clone()
        .add(direction.multiplyScalar(desiredDistance / currentLength))
    },
    [],
  )

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
      setTitleVisible(false)
      liverModelRef.current.setSelectedInscription(inscriptionId)

      // Show panel immediately for better responsiveness
      setSelectedInscription(inscription)

      setInscriptionHash(inscriptionId)

      if (cameraControllerRef.current) {
        const scaledCameraPos = getScaledCameraPosition(
          inscription.cameraPosition,
          inscription.cameraTarget,
        )
        cameraControllerRef.current.focusOn(
          inscription.cameraTarget,
          scaledCameraPos,
          600,
          true,
          undefined,
          modelMatrix,
        )
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
      setTitleVisible(false)
      liverModelRef.current.setSelectedInscription(inscription.id)
      setSelectedInscription(inscription)
      setInscriptionHash(inscription.id)
      const scaledCameraPos = getScaledCameraPosition(
        inscription.cameraPosition,
        inscription.cameraTarget,
      )
      cameraControllerRef.current.focusOn(
        inscription.cameraTarget,
        scaledCameraPos,
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

    if (cameraControllerRef.current && liverModelRef.current) {
      if (isSmallScreen || isPortrait) {
        cameraControllerRef.current.pullBack(
          SceneConfig.inscriptions.cameraDistance * 2.5,
          500,
        )
      } else {
        cameraControllerRef.current.resetToDefault(
          liverModelRef.current as LiverModel,
          800,
        )
      }
    }

    if (liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
    }
  }, [setInteractionMode, isSmallScreen, isPortrait])

  const handleZoomDetected = useCallback(() => {
    if (interactionMode === InteractionMode.About) return
    setHasInteracted(true)
    setTitleVisible(false)
  }, [interactionMode, setHasInteracted, setTitleVisible])

  const handleModelRotate = useCallback(() => {
    if (interactionMode === InteractionMode.About) return
    if (!hasInteracted) {
      setHasInteracted(true)
    }
    setHasViewChanged(true)
  }, [hasInteracted, setHasInteracted, interactionMode])

  // Keep tooltip position on the DOM — avoid re-rendering the scene tree
  // on every mousemove.
  const handleMouseMove = useCallback(
    (position: { x: number; y: number }, isOverCanvas: boolean) => {
      hoverTooltipRef.current?.setPointer(position.x, position.y, isOverCanvas)
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
      if (hasInteracted) {
        container.classList.add("interacted")
      } else {
        container.classList.remove("interacted")
      }
    }
  }, [hasInteracted])

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
      stencil: false,
      depth: true,
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    // PCFSoftShadowMap is the heaviest option (multi-tap PCF). PCFShadowMap
    // produces nearly identical results with the soft radius we already use,
    // and is dramatically cheaper on integrated GPUs.
    renderer.shadowMap.type = THREE.PCFShadowMap
    // Cap DPR more aggressively — DPR 2 quadruples fragment cost on 4K screens
    // for no perceptible benefit on this scene (mostly dark background +
    // textured liver). Hard cap at 1.5 is the sweet spot for older machines.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    if (import.meta.env.DEV) {
      ;(
        window as unknown as { __threeRenderer?: THREE.WebGLRenderer }
      ).__threeRenderer = renderer
    }
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = false
    controls.maxPolarAngle = Math.PI
    controls.minDistance = 1.5
    controls.maxDistance = 10
    controls.target.copy(SceneConfig.model.position)
    controls.enabled = true
    controlsRef.current = controls
    setupLighting(scene)

    const cameraFillLight = new THREE.SpotLight(
      SceneConfig.lighting.lightColor,
      SceneConfig.lighting.cameraFillIntensity,
    )
    cameraFillLight.angle = SceneConfig.lighting.cameraFillAngle
    cameraFillLight.penumbra = SceneConfig.lighting.cameraFillPenumbra
    cameraFillLight.distance = SceneConfig.lighting.cameraFillDistance
    cameraFillLight.decay = 2
    cameraFillLight.castShadow = false
    scene.add(cameraFillLight)

    const cameraFillTarget = new THREE.Object3D()
    scene.add(cameraFillTarget)
    cameraFillLight.target = cameraFillTarget
    cameraFillLightRef.current = cameraFillLight
    cameraFillTargetRef.current = cameraFillTarget

    const cameraFillDirection = new THREE.Vector3()

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
      const liverModel = new LiverModel(scene, setLoadingProgress, () => {
        setErrorMsg(
          "The 3D model could not be loaded. Please refresh the page or try again later.",
        )
        setIsLoading(false)
      })
      liverModelRef.current = liverModel
      liverModel.setOnRenderRequired(() => {
        renderRequestedRef.current = true
      })
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
      setViewportKey((current) => current + 1)
      renderRequestedRef.current = true
    }
    window.addEventListener("resize", handleResize)

    // Track camera/controls movement so we can skip frames when idle.
    // We render on demand: if nothing moved AND particles aren't visible
    // (very small with low opacity at >5 units), drop down to a low-fps tick.
    const prevCamPos = camera.position.clone()
    const prevCamQuat = camera.quaternion.clone()
    const prevTarget = controls.target.clone()
    let staticFrames = 0
    // Particle update is independent of camera movement, but the user can
    // barely see them anyway. Keep animating but at a real ~30 fps using
    // accumulated dt instead of Math.random()-based stochastic skipping
    // (random skipping wastes cycles half the time and gives jittery motion).
    let particleAccumulator = 0
    let lastFrameTime = performance.now()

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      const now = performance.now()
      const dt = now - lastFrameTime
      lastFrameTime = now

      // OrbitControls applies user input directly, and camera animations call
      // update themselves. With damping disabled, no per-frame update is needed.
      const moved =
        prevCamPos.distanceToSquared(camera.position) > 1e-8 ||
        prevTarget.distanceToSquared(controls.target) > 1e-8 ||
        prevCamQuat.angleTo(camera.quaternion) > 1e-5
      const renderRequested = renderRequestedRef.current
      renderRequestedRef.current = false
      if (moved) {
        prevCamPos.copy(camera.position)
        prevCamQuat.copy(camera.quaternion)
        prevTarget.copy(controls.target)
        staticFrames = 0
      } else {
        staticFrames++
      }

      // Particles animate only while the scene is actively rendering.
      particleAccumulator += dt
      let particlesUpdated = false
      if (
        (moved || renderRequested || staticFrames < 30) &&
        particleAccumulator >= 33 &&
        particleRefs.current.particles
      ) {
        particleAccumulator = 0
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
          particlesUpdated = true
        }
      }

      const cameraFillLight = cameraFillLightRef.current
      const cameraFillTarget = cameraFillTargetRef.current
      // Camera fill light only needs updating when the camera moved.
      if (moved && cameraFillLight && cameraFillTarget) {
        cameraFillLight.position.copy(camera.position)
        camera.getWorldDirection(cameraFillDirection)
        cameraFillTarget.position
          .copy(camera.position)
          .add(
            cameraFillDirection.multiplyScalar(
              SceneConfig.lighting.cameraFillTargetDistance,
            ),
          )

        // Adjust intensity based on camera distance to target
        const distanceToTarget = camera.position.distanceTo(controls.target)
        const {
          cameraFillDistanceMin,
          cameraFillDistanceMax,
          cameraFillIntensity,
          cameraFillIntensityClose,
        } = SceneConfig.lighting
        const t = Math.max(
          0,
          Math.min(
            1,
            (distanceToTarget - cameraFillDistanceMin) /
              (cameraFillDistanceMax - cameraFillDistanceMin),
          ),
        )
        cameraFillLight.intensity =
          cameraFillIntensityClose +
          t * (cameraFillIntensity - cameraFillIntensityClose)
      }

      const needsRender =
        moved || renderRequested || particlesUpdated || staticFrames < 30
      if (needsRender) {
        renderer.render(scene, camera)
      }
    }
    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLoss,
      )
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestore,
      )

      cameraController?.dispose()
      liverModelRef.current?.dispose()
      interactionManagerRef.current?.dispose()
      controls.dispose()

      cameraControllerRef.current = null
      liverModelRef.current = null
      interactionManagerRef.current = null
      controlsRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      sceneRef.current = null
      cameraFillLightRef.current = null
      cameraFillTargetRef.current = null

      renderer.dispose()
      scene.clear()

      window.removeEventListener("resize", handleResize)
      if (import.meta.env.DEV) {
        delete (window as unknown as { __threeRenderer?: THREE.WebGLRenderer })
          .__threeRenderer
      }

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [setIsLoading, setLoadingProgress])
  useEffect(() => {
    if (
      !isSceneReady ||
      !rendererRef.current ||
      !cameraRef.current ||
      !controlsRef.current ||
      !liverModelRef.current
    ) {
      return
    }

    const callbacks = {
      onInscriptionClick: handleInscriptionClick,
      onBackgroundClick: handleBackgroundClick,
      onMarkerHover: handleMarkerHover,
      onZoomDetected: handleZoomDetected,
      onModelRotate: handleModelRotate,
      onMouseMove: handleMouseMove,
      onModifierKeyChange: handleModifierKeyChange,
      onReset: handleReset,
      onViewChange: handleViewChange,
      onRenderRequired: () => {
        renderRequestedRef.current = true
      },
    }

    const isInteractive =
      interactionMode === InteractionMode.ThreeD ||
      interactionMode === InteractionMode.Inscription

    if (interactionManagerRef.current) {
      interactionManagerRef.current.updateCallbacks(callbacks)
      interactionManagerRef.current.setInteractionEnabled(isInteractive)
      interactionManagerRef.current.setHoverEnabled(isInteractive)
      interactionManagerRef.current.setClickEnabled(true)
      return
    }

    const interactionManager = new InteractionManager(
      rendererRef.current,
      cameraRef.current,
      controlsRef.current,
      liverModelRef.current,
      liverInscriptions,
      callbacks,
    )
    interactionManager.setInteractionEnabled(isInteractive)
    interactionManager.setHoverEnabled(isInteractive)
    interactionManager.setClickEnabled(true)
    interactionManagerRef.current = interactionManager
  }, [
    isSceneReady,
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

  // Ensure title is always visible when in About mode
  useEffect(() => {
    if (isAboutMode) {
      setTitleVisible(true)
    }
  }, [isAboutMode, setTitleVisible])

  // Clear highlighted inscription when entering About mode
  useEffect(() => {
    if (isAboutMode && liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
      setHoveredSection(null)
    }
  }, [isAboutMode])

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
        if (hashNavigationTimeoutRef.current) {
          clearTimeout(hashNavigationTimeoutRef.current)
        }
        hashNavigationTimeoutRef.current = window.setTimeout(() => {
          handleInscriptionClick({
            inscriptionId,
            cameraLocalPosition: inscription.cameraPosition,
            cameraLocalTarget: inscription.cameraTarget,
            modelMatrix,
          })
          hashNavigationTimeoutRef.current = null
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
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      if (hashNavigationTimeoutRef.current) {
        clearTimeout(hashNavigationTimeoutRef.current)
        hashNavigationTimeoutRef.current = null
      }
    }
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
          />
          <InscriptionList
            onInscriptionSelect={handleInscriptionListClick}
            selectedInscription={selectedInscription}
            isLoading={isLoading}
            hasInteracted={hasInteracted}
          />
        </section>

        <HoverTooltip
          ref={hoverTooltipRef}
          hoveredSection={hoveredSection}
          isPanelOpen={isInscriptionMode}
          isModifierKeyPressed={isModifierKeyPressed}
          isMouseOverPanel={isMouseOverPanel}
        />

        <ResetInstruction
          isPanelOpen={isInscriptionMode}
          hasViewChanged={hasViewChanged}
          isAboutMode={isAboutMode}
        />
        {isSceneReady && isAboutMode && (
          <Box
            className="back-button-container"
            onClick={startInteraction}
            aria-label="Back to 3D scene"
            title="Back to 3D scene"
            style={{
              position: "fixed",
              left: isSmallScreen ? "16px" : "24px",
              bottom: isSmallScreen ? "16px" : "24px",
              zIndex: 30,
            }}
          >
            <FiArrowLeft size={32} />
          </Box>
        )}
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
                <ActionButtons
                  onAboutClick={handleReturnToIntro}
                  onExploreClick={() => navigate(inscriptionsPath)}
                  showLanguageSwitcher={true}
                  disableAnimation={false}
                  align="right"
                  hideControls={false}
                />
              </Box>
            )}
            <ActionMenu
              onAboutClick={handleReturnToIntro}
              onExploreClick={() => navigate(inscriptionsPath)}
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

export default function Scene({
  isLoading,
  setIsLoading,
  setLoadingProgress,
  hasInteracted,
  setHasInteracted,
  setTitleVisible,
}: SceneProps) {
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
