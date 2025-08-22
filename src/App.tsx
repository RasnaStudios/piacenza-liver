import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Data
import { liverInscriptions } from './scene/LiverData'
// import { getLiverModelMatrix } from './camera/InscriptionPositions'

// Core 3D logic
import { CameraController } from './camera/Controller'
import { LiverModel } from './scene/LiverModel'
import { InteractionManager } from './scene/InteractionManager'


// UI Components
import { DeityPanel } from './ui/DeityPanel'
import { HoverTooltip } from './ui/HoverTooltip'
import { Legend } from './ui/Legend'
import { LoadingScreen } from './ui/LoadingScreen'
import { SceneConfig } from './config/SceneConfig'

import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import './styles/global.css'

function PiacenzaLiverScene() {
  // State management
  const [selectedInscription, setSelectedInscription] = useState<any>(null)
  const [hoveredSection, setHoveredSection] = useState<any>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
  
  // Title hiding timeout
  const titleTimeoutRef = useRef<number | null>(null)
  
  // Zoom detection refs
  const initialCameraDistance = useRef<number | null>(null)
  const hasZoomedRef = useRef(false)
  const isIntroAnimationRef = useRef(false) // Flag to disable zoom detection during intro

  // Optimized callback handlers
  const handleMarkerHover = useCallback((section: any) => {
    setHoveredSection(section)
    if (liverModelRef.current && section?.id) {
      liverModelRef.current.setHoveredInscription(section.id)
    }
  }, [])

  const handleInscriptionClick = useCallback((payload: {
    inscriptionId: number
    clickedUV: THREE.Vector2
    cameraWorldPosition: THREE.Vector3
    cameraWorldTarget: THREE.Vector3
    cameraLocalPosition: THREE.Vector3
    cameraLocalTarget: THREE.Vector3
    modelMatrix: THREE.Matrix4
  }) => {
    const { inscriptionId, cameraWorldPosition, cameraWorldTarget, cameraLocalPosition, cameraLocalTarget, modelMatrix } = payload
    const inscription = liverInscriptions.find(ins => ins.id === inscriptionId)
    if (!inscription) return
    setHasInteracted(true)
    hasZoomedRef.current = true

    // Log copy-paste friendly camera data for saving
    console.log(`Inscription ${inscriptionId} clicked`)
    console.log(`Camera world position: [${cameraWorldPosition.x.toFixed(3)}, ${cameraWorldPosition.y.toFixed(3)}, ${cameraWorldPosition.z.toFixed(3)}], target: [${cameraWorldTarget.x.toFixed(3)}, ${cameraWorldTarget.y.toFixed(3)}, ${cameraWorldTarget.z.toFixed(3)}]`)
    console.log(`cameraPosition: new THREE.Vector3(${cameraLocalPosition.x.toFixed(3)}, ${cameraLocalPosition.y.toFixed(3)}, ${cameraLocalPosition.z.toFixed(3)}), cameraTarget: new THREE.Vector3(${cameraLocalTarget.x.toFixed(3)}, ${cameraLocalTarget.y.toFixed(3)}, ${cameraLocalTarget.z.toFixed(3)})`)

    // Re-enable camera focus using stored poses
    const data = inscription as any
    if (cameraControllerRef.current && data.cameraPosition && data.cameraTarget) {
      cameraControllerRef.current.focusOnTransformed(
        data.cameraPosition,
        data.cameraTarget,
        modelMatrix,
        1000
      )
      // Wait for camera animation to complete before opening panel
      setTimeout(() => {
        setSelectedInscription(inscription)
      }, 1000)
    } else {
      // No camera animation, open panel immediately
      setSelectedInscription(inscription)
    }
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedInscription(null)
    
    // Clear hover effect
    if (liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
    }
  }, [])

  const handlePanelClose = useCallback(() => {
    setSelectedInscription(null)
    
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Use camera controller for smooth animation back to default (only on desktop)
    if (cameraControllerRef.current && !isMobile) {
      cameraControllerRef.current.resetToDefault(800)
    }
    
    // Clear hover effect
    if (liverModelRef.current) {
      liverModelRef.current.setHoveredInscription(0)
    }
    
    // Don't reset title visibility if user has already interacted
    // Only reset interaction state, not the permanent interacted state
    setIsInteracting(false)
    
    // Keep hasInteracted and hasZoomedRef as they are
    // This prevents title from reappearing when closing panels
  }, [])

  // Handle camera interaction for title visibility
  const handleInteractionStart = useCallback(() => {
    setIsInteracting(true)
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }
  }, [])

  const handleInteractionEnd = useCallback(() => {
    // Show title again after 2 seconds of no interaction
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }
    titleTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false)
    }, 2000)
  }, [])

  // Check for zoom and hide title if user zoomed in
  const checkForZoom = useCallback((camera: THREE.PerspectiveCamera) => {
    // Skip zoom detection during intro animation
    if (isIntroAnimationRef.current) {
      return
    }

    if (initialCameraDistance.current === null) {
      // Store initial distance
      initialCameraDistance.current = camera.position.length()
      return
    }

    const currentDistance = camera.position.length()
    const initialDistance = initialCameraDistance.current
    
    // If user has zoomed in significantly and hasn't already marked as zoomed
    if (currentDistance < initialDistance * 0.8 && !hasZoomedRef.current) {
      hasZoomedRef.current = true
      setHasInteracted(true) // Hide title permanently only on zoom
    }
  }, [])

  // Update container class based on interaction state
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      if (isInteracting) {
        container.classList.add('interacting')
      } else {
        container.classList.remove('interacting')
      }
      
      // Add or remove interacted class based on state
      if (hasInteracted) {
        container.classList.add('interacted')
      } else {
        container.classList.remove('interacted')
      }
    }
  }, [isInteracting, hasInteracted])

  // Initialize 3D scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
            camera.position.copy(SceneConfig.camera.initial)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI * 0.8
    // Allow very close zooming without arbitrary limits
    controls.minDistance = 0.2
    controls.maxDistance = 20
    
    // Set initial camera target (where camera looks at)
            controls.target.copy(SceneConfig.camera.target)
    
    controlsRef.current = controls

    // Add event listeners for pan/rotate detection
    const handleControlsStart = () => {
      setIsInteracting(true)
      handleInteractionStart()
      
      // Stop any ongoing camera animation immediately when user starts interacting
      if (cameraControllerRef.current) {
        cameraControllerRef.current.stopAnimation()
      }
    }
    
    const handleControlsEnd = () => {
      setIsInteracting(false)
      
      handleInteractionEnd()
    }
    
    controls.addEventListener('start', handleControlsStart)
    controls.addEventListener('end', handleControlsEnd)

    // Store initial camera distance after setup
    setTimeout(() => {
      if (camera) {
        initialCameraDistance.current = camera.position.length()
      }
    }, 100)

    // Set up lighting
    setupLighting(scene)

    // Mouse wheel handling for zoom detection
    const handleWheel = (_event: WheelEvent) => {
      checkForZoom(camera)
      
      // Always mark as interacting on wheel
      handleInteractionStart()
      
      // Debounced interaction end
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
      titleTimeoutRef.current = window.setTimeout(() => {
        handleInteractionEnd()
      }, 100)
    }
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: true })

    // Loading progress handler (readiness-driven UI will hide overlay)
    const handleLoadingProgress = (progress: number) => {
      setLoadingProgress(progress)
    }

    // Initialize controllers and models
    const cameraController = new CameraController(camera, controls)
    cameraControllerRef.current = cameraController

    try {
      const liverModel = new LiverModel(scene, handleLoadingProgress)
      liverModelRef.current = liverModel
    } catch (e: any) {
      console.error('Failed to initialize LiverModel:', e)
      setErrorMsg('Your browser or device does not support the required 3D features (WebGL). Please try updating your browser or using a different device.')
      setIsLoading(false)
    }

    // Set up callback for when liver model is ready
    liverModelRef.current?.setOnModelReady(() => {
      // Hide loader based on readiness
      setIsLoading(false)
      // Start intro camera animation shortly after overlay fades out
      setTimeout(() => {
        if (cameraRef.current && controlsRef.current) {
          isIntroAnimationRef.current = true // Disable zoom detection during intro
          
          // Simple camera lerp animation using config (initial + offset)
          const startPos = SceneConfig.camera.initial
          const startTarget = SceneConfig.camera.target
          const endPos = startPos.clone().add(SceneConfig.animation.camera.positionOffset)
          const endTarget = startTarget.clone().add(SceneConfig.animation.camera.targetOffset)
          const duration = SceneConfig.animation.camera.duration
          const startTime = Date.now()
          
          const animateCamera = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Smooth step easing
            const t = progress * progress * (3 - 2 * progress)
            
            if (cameraRef.current && controlsRef.current) {
              // Animate camera position
              cameraRef.current.position.x = startPos.x + (endPos.x - startPos.x) * t
              cameraRef.current.position.y = startPos.y + (endPos.y - startPos.y) * t
              cameraRef.current.position.z = startPos.z + (endPos.z - startPos.z) * t
              
              // Animate camera target (pan)
              controlsRef.current.target.x = startTarget.x + (endTarget.x - startTarget.x) * t
              controlsRef.current.target.y = startTarget.y + (endTarget.y - startTarget.y) * t
              controlsRef.current.target.z = startTarget.z + (endTarget.z - startTarget.z) * t
              
              controlsRef.current.update()
            }
            
            if (progress < 1) {
              requestAnimationFrame(animateCamera)
            } else {
              isIntroAnimationRef.current = false // Re-enable zoom detection after intro
            }
          }
          
          requestAnimationFrame(animateCamera)
        }
      }, 800) // Wait for loading screen fade
    })

    // Add WebGL context loss handling
    const handleContextLoss = (event: Event) => {
      event.preventDefault()
      console.warn('WebGL context lost')
      setErrorMsg('3D rendering context was lost. Please refresh the page.')
    }

    const handleContextRestore = () => {
      console.log('WebGL context restored')
      setErrorMsg(null)
      // Reload the scene
      window.location.reload()
    }

    renderer.domElement.addEventListener('webglcontextlost', handleContextLoss)
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestore)

    // Mouse wheel handling for zoom detection
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
    
    // Add event listeners
    renderer.domElement.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Double-click handler for reset
    const handleDoubleClick = (event: MouseEvent) => {
      event.preventDefault()
      
      // Enable intro animation mode to prevent checkForZoom from hiding title
      isIntroAnimationRef.current = true
      
      cameraController.resetToDefault(800)
      
      // Smoothly reset model POSITION AND ROTATION to default
      if (liverModelRef.current) {
        const liverObject = liverModelRef.current.getObject()
        if (liverObject) {
          const startPosition = {
            x: liverObject.position.x,
            y: liverObject.position.y,
            z: liverObject.position.z
          }
          const startRotation = {
            x: liverObject.rotation.x,
            y: liverObject.rotation.y, 
            z: liverObject.rotation.z
          }
          const endPosition = SceneConfig.model.position
          const endRotation = SceneConfig.model.rotation
          const duration = SceneConfig.reset.duration
          const startTime = Date.now()
          
          const animateModel = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Smooth step easing
            const t = progress * progress * (3 - 2 * progress)
            
            if (liverObject) {
              // Animate POSITION
              liverObject.position.x = startPosition.x + (endPosition.x - startPosition.x) * t
              liverObject.position.y = startPosition.y + (endPosition.y - startPosition.y) * t
              liverObject.position.z = startPosition.z + (endPosition.z - startPosition.z) * t
              
              // Animate ROTATION
              liverObject.rotation.x = startRotation.x + (endRotation.x - startRotation.x) * t
              liverObject.rotation.y = startRotation.y + (endRotation.y - startRotation.y) * t
              liverObject.rotation.z = startRotation.z + (endRotation.z - startRotation.z) * t
            }
            
            if (progress < 1) {
              requestAnimationFrame(animateModel)
            } else {
              // Animation complete - re-enable zoom detection
              isIntroAnimationRef.current = false
            }
          }
          
          animateModel()
        } else {
          // No model object - re-enable zoom detection immediately
          isIntroAnimationRef.current = false
        }
      } else {
        // No liver model - re-enable zoom detection immediately  
        isIntroAnimationRef.current = false
      }
      
      setSelectedInscription(null)
      setHasInteracted(false)
      setIsInteracting(false)
      hasZoomedRef.current = false
      if (camera) {
        initialCameraDistance.current = camera.position.length()
      }
    }
    renderer.domElement.addEventListener('dblclick', handleDoubleClick)

    // Resize handler
    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop with shader updates
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      
      // Check for zoom changes
      checkForZoom(camera)

      // Update shader uniforms with time
      if (liverModelRef.current) {
        liverModelRef.current.updateShaderUniforms(performance.now() * 0.001)
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      cameraController?.dispose()
      liverModelRef.current?.dispose()
      interactionManagerRef.current?.dispose()

      // Remove event listeners
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick)

      renderer.dispose()
      scene.clear()

      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [handleMarkerHover, handleInscriptionClick, handleBackgroundClick, checkForZoom, handleInteractionStart, handleInteractionEnd])

  // Initialize InteractionManager after 3D scene is set up
  useEffect(() => {
    if (rendererRef.current && cameraRef.current && controlsRef.current && liverModelRef.current) {
      // Dispose of existing interaction manager if it exists
      if (interactionManagerRef.current) {
        interactionManagerRef.current.dispose()
      }

      // Create new interaction manager
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
          onInteractionStart: handleInteractionStart,
          onInteractionEnd: handleInteractionEnd
        }
      )
      interactionManagerRef.current = interactionManager
    }
  }, [handleInscriptionClick, handleBackgroundClick, handleMarkerHover, handleInteractionStart, handleInteractionEnd])

  return (
    <div className="piacenza-liver-app">
      <div className="scene-container">
        <div ref={containerRef} className="three-container" />
        
        {/* Modular UI components */}
        <DeityPanel 
          selectedInscription={selectedInscription} 
          onClose={handlePanelClose} 
        />
        
        <HoverTooltip 
          hoveredSection={hoveredSection}
          mousePosition={mousePosition}
        />
        
        <Legend hasInteracted={hasInteracted} />
        
        {/* Loading Screen */}
        <LoadingScreen 
          progress={loadingProgress} 
          isLoading={isLoading} 
        />

        {/* Compatibility/Error Banner */}
        {errorMsg && (
          <div
            style={{
              position: 'fixed',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 14,
              zIndex: 10000,
              maxWidth: '90vw',
              textAlign: 'center' as const,
              border: '1px solid #333',
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
  // Clean spotlight setup
  const spotlight = new THREE.SpotLight(0xfff4e6, 100.0)
  spotlight.position.set(0, 6, 3)
  spotlight.target.position.set(0, 0, 0)
  spotlight.angle = Math.PI / 6
  spotlight.penumbra = 0.5
  spotlight.decay = 2
  spotlight.distance = 15
  
  // High quality shadows
  spotlight.castShadow = true
  spotlight.shadow.mapSize.width = 4096
  spotlight.shadow.mapSize.height = 4096
  spotlight.shadow.camera.near = 0.1
  spotlight.shadow.camera.far = 15
  spotlight.shadow.camera.fov = 30
  spotlight.shadow.bias = -0.0001
  
  scene.add(spotlight)
  scene.add(spotlight.target)
  
  // Bottom lights for reading inscriptions on underside
  const bottomLight1 = new THREE.PointLight(0xfff4e6, 25, 15, 2)
  bottomLight1.position.set(-6, -8, 4)
  bottomLight1.castShadow = false
  scene.add(bottomLight1)
  
  const bottomLight2 = new THREE.PointLight(0xfff4e6, 25, 15, 2)
  bottomLight2.position.set(6, -8, -4)
  bottomLight2.castShadow = false
  scene.add(bottomLight2)
  
  const bottomLight3 = new THREE.PointLight(0xfff4e6, 25, 15, 2)
  bottomLight3.position.set(-2, -10, -5)
  bottomLight3.castShadow = false
  scene.add(bottomLight3)
  
  const bottomLight4 = new THREE.PointLight(0xfff4e6, 25, 15, 2)
  bottomLight4.position.set(2, -10, 5)
  bottomLight4.castShadow = false
  scene.add(bottomLight4)
  
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
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xfff4e6,
    size: 0.005,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)
  
  const animateParticles = () => {
    const positions = particles.geometry.attributes.position.array
    const velocities = particles.geometry.attributes.velocity.array
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      positions[i3] += velocities[i3]
      positions[i3 + 1] += velocities[i3 + 1]
      positions[i3 + 2] += velocities[i3 + 2]
      
      if (positions[i3 + 1] < -1 || Math.abs(positions[i3]) > 2 || Math.abs(positions[i3 + 2] - 1.5) > 2) {
        const height = Math.random() * 6
        const radius = (height / 6) * 1.8 * Math.random()
        const angle = Math.random() * Math.PI * 2
        
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = 6 - height
        positions[i3 + 2] = Math.sin(angle) * radius + 1.5
      }
    }
    
    particles.geometry.attributes.position.needsUpdate = true
    requestAnimationFrame(animateParticles)
  }
  animateParticles()
  
    // Minimal ambient light for dramatic museum effect
  const ambientLight = new THREE.AmbientLight(0x1a1611, 1)
  scene.add(ambientLight)
  
  // Large museum floor plane (invisible edges)
  const floorGeometry = new THREE.PlaneGeometry(50, 50)
  const floorMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2a2a2a,
    transparent: true,
    opacity: 0.9
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2 // Rotate to be horizontal
  floor.position.set(0, -3.0, 0)
  floor.receiveShadow = true
  scene.add(floor)
  
 
}

export default function App() {
  return (
    <MantineProvider>
      <PiacenzaLiverScene />
    </MantineProvider>
  )
}
