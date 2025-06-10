import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Modular imports
import { liverInscriptions } from './data/liverData'
import { CameraController } from './controllers/CameraController'
import { InteractionHandler } from './controllers/InteractionHandler'
import { LiverModel } from './models/LiverModel'
import { DeityMarkers } from './models/DeityMarkers'
import { DeityPanel } from './components/DeityPanel'
import { HoverTooltip } from './components/HoverTooltip'
import { Legend } from './components/Legend'

import './App.css'

function PiacenzaLiverScene() {
  // State management
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [hoveredSection, setHoveredSection] = useState(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Refs for 3D objects and controllers
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  
  // Controller refs
  const cameraControllerRef = useRef(null)
  const interactionHandlerRef = useRef(null)
  const liverModelRef = useRef(null)
  const deityMarkersRef = useRef(null)
  
  // Animation frame ref
  const animationIdRef = useRef(null)
  
  // Title hiding timeout
  const titleTimeoutRef = useRef(null)
  
  // Zoom detection refs
  const initialCameraDistance = useRef(null)
  const hasZoomedRef = useRef(false)

  // Optimized callback handlers
  const handleMarkerHover = useCallback((section) => {
    setHoveredSection(section)
  }, [])

  const handleMarkerClick = useCallback((inscription) => {
    setSelectedInscription(inscription)
    
    // Hide title when panel opens
    setHasInteracted(true)
    hasZoomedRef.current = true
    
    // Focus camera on the selected deity using the text marker's orientation for optimal positioning
    // Pass isPanelOpen=true since panel will be open after selection
    if (cameraControllerRef.current && deityMarkersRef.current) {
      const marker = deityMarkersRef.current.getMarkerBySection(inscription.id)
      cameraControllerRef.current.focusOn(inscription.position, 600, marker, true) // Panel will be open
    }
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedInscription(null)
    
    // Return camera to manual position
    if (cameraControllerRef.current) {
      cameraControllerRef.current.returnToManualPosition()
    }
  }, [])

  const handlePanelClose = useCallback(() => {
    setSelectedInscription(null)
    
    // Use camera controller for smooth animation back to default (same as double-click)
    if (cameraControllerRef.current) {
      cameraControllerRef.current.resetToDefault(800)
    }
    
    // Reset title visibility and zoom state (same as double-click)
    setHasInteracted(false)
    setIsInteracting(false)
    hasZoomedRef.current = false
    if (cameraRef.current) {
      initialCameraDistance.current = cameraRef.current.position.length()
    }
  }, [])

  // Handle camera interaction for title visibility
  const handleInteractionStart = useCallback(() => {
    setIsInteracting(true)
    // Don't set hasInteracted here - only on zoom
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }
  }, [])

  const handleInteractionEnd = useCallback(() => {
    // Show title again after 2 seconds of no interaction
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }
    titleTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false)
    }, 2000)
  }, [])

  // Check for zoom and hide title if user zoomed in
  const checkForZoom = useCallback((camera) => {
    if (initialCameraDistance.current === null) {
      // Store initial distance
      initialCameraDistance.current = camera.position.length()
      return
    }

    const currentDistance = camera.position.length()
    const initialDistance = initialCameraDistance.current
    
    // If user has zoomed in significantly (closer to the liver) and hasn't already marked as zoomed
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
    // Pure black museum background
    scene.background = new THREE.Color(0x000000)
    
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 2, 3)
    cameraRef.current = camera

    // Renderer setup - fully transparent
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true, // Enable transparency
      powerPreference: "high-performance"
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0) // Fully transparent background
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Optimize for performance
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI * 0.8
    controls.minDistance = 1
    controls.maxDistance = 10
    controlsRef.current = controls

    // Store initial camera distance after setup
    initialCameraDistance.current = camera.position.length()

    // Add wheel event listener for immediate zoom detection
    const handleWheel = (event) => {
      // Mark as zoomed immediately when user starts scrolling (zooming)
      if (!hasZoomedRef.current) {
        hasZoomedRef.current = true
        setHasInteracted(true)
      }
    }
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: true })

    // Add interaction detection for title hiding
    controls.addEventListener('start', handleInteractionStart)
    controls.addEventListener('end', handleInteractionEnd)

    // Lighting setup
    setupLighting(scene)

    // Create 3D models
    const liverModel = new LiverModel(scene)
    liverModelRef.current = liverModel

    // Pass liver model to markers for surface positioning
    const deityMarkers = new DeityMarkers(scene, liverInscriptions, liverModel)
    deityMarkersRef.current = deityMarkers

    // Initialize controllers
    const cameraController = new CameraController(camera, controls)
    cameraControllerRef.current = cameraController

    // Double-click to reset camera position and show title
    const handleDoubleClick = (event) => {
      // Use camera controller for smooth animation back to default
      cameraController.resetToDefault(800)
      
      // Reset title visibility and zoom state
      setHasInteracted(false)
      setIsInteracting(false)
      hasZoomedRef.current = false
      initialCameraDistance.current = camera.position.length()
      
      // Close any open panel
      setSelectedInscription(null)
    }
    
    renderer.domElement.addEventListener('dblclick', handleDoubleClick)

    // Only pass markers to interaction handler (no labels)
    const interactionHandler = new InteractionHandler(camera, renderer, deityMarkers, null)
    interactionHandler.setMarkerHoverCallback(handleMarkerHover)
    interactionHandler.setMarkerClickCallback(handleMarkerClick)
    interactionHandler.setBackgroundClickCallback(handleBackgroundClick)
    interactionHandlerRef.current = interactionHandler

    // Resize handler
    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Optimized animation loop with visibility updates
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      
      // Check for zoom changes
      checkForZoom(camera)
      
      // Update marker visibility based on camera position
      if (deityMarkers) {
        deityMarkers.updateVisibility(camera)
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    return () => {
      // Stop animation loop
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      // Cleanup controllers
      cameraController?.dispose()
      interactionHandler?.dispose()
      liverModel?.dispose()
      deityMarkers?.dispose()

      // Cleanup Three.js objects
      renderer.dispose()
      scene.clear()

      // Remove event listeners
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      
      // Remove renderer from DOM
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [handleMarkerHover, handleMarkerClick, handleBackgroundClick, checkForZoom])

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
          hoveredSection={hoveredSection && !selectedInscription ? hoveredSection : null} 
      />
        
        <Legend />
      </div>
    </div>
  )
}

// Lighting setup function
function setupLighting(scene) {
  // Clean spotlight setup
  const spotlight = new THREE.SpotLight(0xfff4e6, 60.0)
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
  
  // Minimal ambient light
  const ambientLight = new THREE.AmbientLight(0x1a1611, 0.08)
  scene.add(ambientLight)
  
  // Simple platform
  const platformGeometry = new THREE.CylinderGeometry(4, 4, -2, 32)
  const platformMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x222222,
    transparent: true,
    opacity: 0.8
  })
  const platform = new THREE.Mesh(platformGeometry, platformMaterial)
  platform.position.set(0, -0.8, 0)
  platform.receiveShadow = true
  scene.add(platform)
}

export default function App() {
  return <PiacenzaLiverScene />
}
