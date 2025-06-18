import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import { 
  liverInscriptionVertexShader, 
  liverInscriptionFragmentShader, 
  type LiverShaderUniforms 
} from '../shaders/liverInscriptionShader'
import { easingFunctions } from './Animation'

export class LiverModel {
  private scene: THREE.Scene
  private mesh: THREE.Mesh | null = null
  private object: THREE.Object3D | null = null
  private onProgress?: (progress: number) => void
  
  private shaderUniforms!: LiverShaderUniforms
  private maskTexture: THREE.Texture | null = null
  private inscriptionPositions: Map<number, THREE.Vector2> = new Map()
  private onModelReady?: () => void
  private textureData: Uint8Array | null = null

  constructor(scene: THREE.Scene, onProgress?: (progress: number) => void) {
    this.scene = scene
    this.onProgress = onProgress
    
    if (!this.checkWebGLSupport()) {
      console.error('WebGL not supported on this device')
      throw new Error('WebGL not supported')
    }
    
    this.shaderUniforms = {
      time: { value: 0.0 },
      diffuseTexture: { value: null },
      maskTexture: { value: null },
      hoveredInscription: { value: 0 }
    }
    
    this.loadLiverModel()
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  async loadLiverModel() {
    try {
      this.onProgress?.(10)

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      const textureLoader = new THREE.TextureLoader()
      
      if (isMobile) {
        textureLoader.setCrossOrigin('anonymous')
      }
      
      const texturePromises = [
        textureLoader.loadAsync('/liver-model/Pbr/texture_diffuse.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_normal.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_metallic.png'),
        textureLoader.loadAsync('/liver-model/Pbr/texture_roughness.png')
      ]
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Texture loading timeout')), isMobile ? 15000 : 30000)
      })
      
      const textures = await Promise.race([
        Promise.all(texturePromises),
        timeoutPromise
      ]) as THREE.Texture[]

      this.onProgress?.(40)

      const [diffuseTexture, normalTexture, metallicTexture, roughnessTexture] = textures

      textures.forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.flipY = true
        texture.generateMipmaps = true
        
        if (isMobile) {
          texture.minFilter = THREE.LinearMipmapNearestFilter
          texture.magFilter = THREE.NearestFilter
        } else {
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
        }
      })

      this.maskTexture = await Promise.race([
        this.loadSegmentationMap(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Segmentation map timeout')), 8000))
      ]) as THREE.Texture

      this.onProgress?.(60)

      this.shaderUniforms.diffuseTexture.value = diffuseTexture
      this.shaderUniforms.maskTexture.value = this.maskTexture

      const material = new THREE.ShaderMaterial({
        uniforms: this.shaderUniforms,
        vertexShader: liverInscriptionVertexShader,
        fragmentShader: liverInscriptionFragmentShader,
        side: THREE.FrontSide,
        transparent: false,
        precision: isMobile ? 'mediump' : 'highp'
      })

      this.onProgress?.(75)

      const objLoader = new OBJLoader()
      const object = await Promise.race([
        objLoader.loadAsync('/liver-model/Pbr/base.obj'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('OBJ loading timeout')), 15000))
      ]) as THREE.Object3D
      
      this.onProgress?.(90)

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material
          child.castShadow = !isMobile
          child.receiveShadow = !isMobile
          child.userData = { type: 'liver' }
          
          if (!this.mesh) {
            this.mesh = child
          }
        }
      })

      object.scale.setScalar(1.0)
      object.position.set(0, 0, 0)
      object.rotation.set(0, 0, 0)

      this.scene.add(object)
      this.object = object

      this.onProgress?.(95)
      
      this.animateInitialRotation()
      
      this.onProgress?.(100)
      
      if (this.onModelReady) {
        this.onModelReady()
      }
      
    } catch (error) {
      console.error('Error loading liver model:', error)
      throw error
    }
  }

  getPosition() {
    const target = this.object || this.mesh
    return target ? target.position.clone() : new THREE.Vector3()
  }

  setPosition(position: THREE.Vector3) {
    const target = this.object || this.mesh
    if (target) {
      target.position.copy(position)
    }
  }

  updateMaterial(properties: any) {
    if (this.mesh && this.mesh.material) {
      Object.assign(this.mesh.material, properties)
    }
  }

  getMesh() {
    return this.mesh
  }

  getObject() {
    return this.object
  }

  updateShaderUniforms(time: number) {
    this.shaderUniforms.time.value = time
  }

  setHoveredInscription(inscriptionId: number) {
    this.hoveredInscription = inscriptionId
    this.shaderUniforms.hoveredInscription.value = inscriptionId
  }

  getInscriptionAtUV(u: number, v: number): number {
    if (!this.textureData || !this.maskTexture) return 0

    const width = this.maskTexture.image.width
    const height = this.maskTexture.image.height
    
    const x = Math.floor(u * width)
    const y = Math.floor((1 - v) * height)
    
    if (x < 0 || x >= width || y < 0 || y >= height) return 0
    
    const index = (y * width + x) * 4
    return this.textureData[index]
  }

  getMaskTexture() {
    return this.maskTexture
  }

  getInscriptionPositions(): Map<number, THREE.Vector2> {
    return this.inscriptionPositions
  }

  setOnModelReady(callback: () => void) {
    this.onModelReady = callback
  }

  animateInitialRotation() {
    const target = this.object || this.mesh
    if (!target) return

    const startRotation = target.rotation.y
    const endRotation = startRotation - Math.PI / 2
    const startScale = 0.3
    const endScale = 1.0
    const duration = 1000
    const startTime = Date.now()

    target.scale.setScalar(startScale)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easedProgress = easingFunctions.easeInOutBalanced(progress)
      
      target.rotation.y = startRotation + (endRotation - startRotation) * easedProgress
      
      const currentScale = startScale + (endScale - startScale) * easedProgress
      target.scale.setScalar(currentScale)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  dispose() {
    if (this.shaderUniforms.diffuseTexture.value) {
      this.shaderUniforms.diffuseTexture.value.dispose()
    }
    if (this.shaderUniforms.maskTexture.value) {
      this.shaderUniforms.maskTexture.value.dispose()
    }
    if (this.maskTexture) {
      this.maskTexture.dispose()
    }
    
    if (this.mesh && this.mesh.material) {
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(material => material.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }
    
    if (this.mesh && this.mesh.geometry) {
      this.mesh.geometry.dispose()
    }
    
    if (this.object) {
      this.scene.remove(this.object)
    }
    if (this.mesh && this.mesh !== this.object) {
      this.scene.remove(this.mesh)
    }
    
    this.mesh = null
    this.object = null
    this.maskTexture = null
    this.inscriptionPositions.clear()
  }

  private loadSegmentationMap(): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader()
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        textureLoader.setCrossOrigin('anonymous')
      }
      
      textureLoader.load(
        '/liver-model/Pbr/segmentation.png',
        (texture) => {
          texture.magFilter = THREE.NearestFilter
          texture.minFilter = THREE.NearestFilter
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.flipY = false
          texture.needsUpdate = true
          
          if (texture.image.complete) {
            this.extractInscriptionPositionsFromTexture(texture)
            resolve(texture)
          } else {
            texture.image.onload = () => {
              this.extractInscriptionPositionsFromTexture(texture)
              resolve(texture)
            }
            texture.image.onerror = (error: Event) => {
              reject(error)
            }
          }
        },
        undefined,
        (error) => {
          reject(error)
        }
      )
    })
  }

  private extractInscriptionPositionsFromTexture(texture: THREE.Texture) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    
    canvas.width = texture.image.width
    canvas.height = texture.image.height
    
    ctx.drawImage(texture.image, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    this.textureData = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i += 4) {
      this.textureData[i] = data[i]
    }
    
    this.inscriptionPositions = new Map()
    
    const sampleStep = 4
    const uniqueValues = new Set<number>()
    
    for (let i = 0; i < data.length; i += sampleStep * 4) {
      const r = data[i]
      uniqueValues.add(r)
    }
    
    for (let inscriptionId = 1; inscriptionId <= 40; inscriptionId++) {
      let found = false
      let totalX = 0
      let totalY = 0
      let pixelCount = 0
      
      for (let y = 0; y < canvas.height; y += sampleStep) {
        for (let x = 0; x < canvas.width; x += sampleStep) {
          const index = (y * canvas.width + x) * 4
          const r = data[index]
          
          if (r === inscriptionId) {
            found = true
            totalX += x
            totalY += y
            pixelCount++
          }
        }
      }
      
      if (found && pixelCount > 0) {
        const centerU = totalX / pixelCount / canvas.width
        const centerV = 1 - (totalY / pixelCount / canvas.height)
        this.inscriptionPositions.set(inscriptionId, new THREE.Vector2(centerU, centerV))
      }
    }
  }
} 