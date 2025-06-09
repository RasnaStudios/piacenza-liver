import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Modular imports
import { liverSections } from './data/liverData'
import { CameraController } from './controllers/CameraController'
import { InteractionHandler } from './controllers/InteractionHandler'
import { LiverModel } from './models/LiverModel'
import { DeityMarkers } from './models/DeityMarkers'
import { DeityPanel } from './components/DeityPanel'
import { HoverTooltip } from './components/HoverTooltip'
import { Legend } from './components/Legend'

import './App.css'
import backgroundImage from './assets/background.png'

function PiacenzaLiverScene() {
  // State management
  const [selectedSection, setSelectedSection] = useState(null)
  const [hoveredSection, setHoveredSection] = useState(null)

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

  // Optimized callback handlers
  const handleMarkerHover = useCallback((section) => {
    setHoveredSection(section)
  }, [])

  const handleMarkerClick = useCallback((section) => {
    setSelectedSection(section)
    
    // Focus camera on the selected deity using the text marker's orientation for optimal positioning
    // Pass isPanelOpen=true since panel will be open after selection
    if (cameraControllerRef.current && deityMarkersRef.current) {
      const marker = deityMarkersRef.current.getMarkerBySection(section.id)
      cameraControllerRef.current.focusOn(section.position, 600, marker, true) // Panel will be open
    }
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedSection(null)
    
    // Return camera to manual position
    if (cameraControllerRef.current) {
      cameraControllerRef.current.returnToManualPosition()
    }
  }, [])

  const handlePanelClose = useCallback(() => {
    setSelectedSection(null)
    
    // Center liver in full screen when panel closes
    if (cameraControllerRef.current) {
      cameraControllerRef.current.centerLiver()
    }
  }, [])

  // Initialize 3D scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    
    // Load background texture with vignette
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(backgroundImage, (texture) => {
      const vignetteTexture = applyVignetteToTexture(texture)
      scene.background = vignetteTexture
    })
    
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

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
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

    // Lighting setup
    setupLighting(scene)

    // Create 3D models
    const liverModel = new LiverModel(scene)
    liverModelRef.current = liverModel

    // Pass liver model to markers for surface positioning
    const deityMarkers = new DeityMarkers(scene, liverSections, liverModel)
    deityMarkersRef.current = deityMarkers

    // Initialize controllers
    const cameraController = new CameraController(camera, controls)
    cameraControllerRef.current = cameraController

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
      
      // Remove renderer from DOM
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [handleMarkerHover, handleMarkerClick, handleBackgroundClick])

  return (
    <div className="piacenza-liver-app">
      <div className="scene-container">
        <div ref={containerRef} className="three-container" />
        
        {/* Modular UI components */}
        <DeityPanel 
          selectedSection={selectedSection} 
          onClose={handlePanelClose} 
        />
        
        <HoverTooltip 
          hoveredSection={hoveredSection && !selectedSection ? hoveredSection : null} 
        />
        
        <Legend />
      </div>
    </div>
  )
}

// Lighting setup function
function setupLighting(scene) {
  // Ambient light for base illumination
  const ambientLight = new THREE.AmbientLight(0x2a251c, 0.4)
  scene.add(ambientLight)
  
  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xfff8dc, 1)
  directionalLight.position.set(5, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 500
  scene.add(directionalLight)
}

// Apply vignette effect directly to background texture
function applyVignetteToTexture(backgroundTexture) {
  // Create canvas to combine background with vignette
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  // Set canvas size to match the background texture
  canvas.width = backgroundTexture.image.width
  canvas.height = backgroundTexture.image.height
  
  // Draw the background image
  context.drawImage(backgroundTexture.image, 0, 0, canvas.width, canvas.height)
  
  // Create vignette overlay
  const gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')      // Transparent center
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0)')    // Keep center area clear (smaller)
  gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.6)')  // Start darkening earlier and stronger
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')    // Very dark edges
  
  // Apply vignette overlay
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Add title text to background
  context.save()
  context.font = `300 ${Math.min(canvas.width, canvas.height) * 0.08}px "Papyrus", fantasy`
  context.strokeStyle = '#4a403a'
  context.lineWidth = 3
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.letterSpacing = '4px'
  
  // Create gradient for text fill
  const text = 'PIACENZA LIVER'
  const x = canvas.width * 0.08   // 8% from left (more to the left)
  const y = canvas.height * 0.10  // 10% from top
  
  // Measure text to create proper gradient
  const textMetrics = context.measureText(text)
  const textHeight = Math.min(canvas.width, canvas.height) * 0.08
  
  const textGradient = context.createLinearGradient(x, y, x, y + textHeight)
  textGradient.addColorStop(0, '#9d8b7a')    // Light pastel brown top
  textGradient.addColorStop(0.3, '#8a7766')  // Medium pastel brown
  textGradient.addColorStop(0.7, '#756352')  // Darker pastel brown
  textGradient.addColorStop(1, '#5a4d3e')    // Dark pastel brown bottom
  
  context.fillStyle = textGradient
  
  // Add text shadow effect
  context.shadowColor = 'rgba(0, 0, 0, 0.8)'
  context.shadowOffsetX = 4
  context.shadowOffsetY = 4
  context.shadowBlur = 8
  
  // Draw text with stroke and fill
  context.strokeText(text, x, y)
  context.fillText(text, x, y)
  context.restore()
  
  // Create new texture from the combined canvas
  const vignetteTexture = new THREE.CanvasTexture(canvas)
  vignetteTexture.needsUpdate = true
  
  return vignetteTexture
}

export default function App() {
  return <PiacenzaLiverScene />
}
