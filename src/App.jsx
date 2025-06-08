import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './App.css'

function LiverScene() {
  const containerRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const panel = panelRef.current

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 2, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = true
    controls.enableDamping = true

    const light = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(light)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
    dirLight.position.set(5, 10, 7.5)
    scene.add(dirLight)

    const geometry = new THREE.SphereGeometry(1.5, 32, 32)
    const material = new THREE.MeshStandardMaterial({ color: 0xff5555, flatShading: true })
    const liver = new THREE.Mesh(geometry, material)
    scene.add(liver)

    const dotData = [
      { position: new THREE.Vector3(1, 0.5, 0), info: 'Dot 1: sample info' },
      { position: new THREE.Vector3(-0.5, -0.5, 1), info: 'Dot 2: sample info' },
      { position: new THREE.Vector3(0, 0.8, -0.8), info: 'Dot 3: sample info' }
    ]
    const dots = []
    const dotGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff })
    dotData.forEach(data => {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone())
      dot.position.copy(data.position)
      dot.userData.info = data.info
      scene.add(dot)
      dots.push(dot)
    })

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(dots)
      if (intersects.length > 0) {
        const dot = intersects[0].object
        controls.target.copy(dot.position)
        camera.position.copy(dot.position.clone().add(new THREE.Vector3(0, 0.2, 0.5)))
        controls.update()
        panel.textContent = dot.userData.info
        panel.style.display = 'block'
      }
    }

    renderer.domElement.addEventListener('click', onClick)

    function onResize() {
      camera.aspect = container.clientWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('click', onClick)
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={containerRef}
        style={{ width: 'calc(100% - 300px)', height: '100vh' }}
      />
      <div
        ref={panelRef}
        style={{
          width: '300px',
          padding: '20px',
          display: 'none',
          background: 'rgba(255,255,255,0.9)'
        }}
      />
    </div>
  )
}

export default function App() {
  return <LiverScene />
}
