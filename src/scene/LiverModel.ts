import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { type LiverShaderUniforms } from '../shaders/LiverInscriptionShader'
import { easingFunctions } from './Animation'
import { SceneConfig } from '../config/SceneConfig'

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
  private currentHoveredId: number = 0

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
      normalTexture: { value: null },
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
      
      this.onProgress?.(20)
      
      // Load segmentation map for interactions
      const segmentationTexture = await this.loadSegmentationMap()
      this.maskTexture = segmentationTexture
      this.shaderUniforms.maskTexture.value = segmentationTexture
      
      this.onProgress?.(40)

      // Load glTF model with PBR materials
      const gltfLoader = new GLTFLoader()
      const gltf = await gltfLoader.loadAsync('/liver-model-gltf/Fegato_Text.glb')
      const object = gltf.scene
      
      this.onProgress?.(90)

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // USE NATIVE glTF MATERIAL + Add inscription emissive with onBeforeCompile
          const originalMaterial = child.material as THREE.MeshStandardMaterial
          console.log('✅ Using native glTF material with inscriptions:', originalMaterial)
          
          // Clear existing emissive first
          if (originalMaterial.emissiveMap) {
            originalMaterial.emissiveMap = null
          }
          originalMaterial.emissive.setHex(0x000000)
          originalMaterial.emissiveIntensity = 0
          
          // Create custom ShaderMaterial with inscription highlighting
          const customMaterial = this.createInscriptionMaterial(originalMaterial)
          child.material = customMaterial
          
          console.log('🎨 Replaced with custom inscription material')
          
          // Configure shadows and metadata
          child.castShadow = !isMobile
          child.receiveShadow = !isMobile
          child.userData = { type: 'liver' }
          
          if (!this.mesh) {
            this.mesh = child
          }
        }
      })

      // Apply initial configuration
      object.scale.setScalar(SceneConfig.model.scale)
      object.position.copy(SceneConfig.model.position)
      object.rotation.setFromVector3(SceneConfig.model.rotation)

      this.scene.add(object)
      this.object = object

      this.onProgress?.(100)
      
      this.animateInitialRotation()
      
      
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
    
    // Debug: Log uniform values occasionally
    if (Math.random() < 0.01) { // 1% chance to log
      console.log('🔄 Shader uniforms:', {
        time: this.shaderUniforms.time.value,
        hoveredInscription: this.shaderUniforms.hoveredInscription.value,
        maskTexture: !!this.shaderUniforms.maskTexture.value
      })
    }
  }

  setHoveredInscription(inscriptionId: number) {
    console.log('✨ Setting hovered inscription:', inscriptionId, 'previous:', this.currentHoveredId)
    this.shaderUniforms.hoveredInscription.value = inscriptionId
    this.currentHoveredId = inscriptionId
    
    if (inscriptionId > 0) {
      console.log('🎨 Should highlight inscription', inscriptionId, 'with color group')
    }
  }

  getInscriptionAtUV(u: number, v: number): number {
    if (!this.textureData || !this.maskTexture) {
      return 0
    }

    const width = this.maskTexture.image.width
    const height = this.maskTexture.image.height
    
    const x = Math.floor(u * width)
    const y = Math.floor(v * height)
    
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return 0
    }
    
    const index = (y * width + x) * 4
    const inscriptionId = this.textureData[index]
    
    if (inscriptionId > 0) {
      console.log('🎯 Found inscription ID:', inscriptionId, 'at UV:', [u, v])
    }
    return inscriptionId
  }

  getMaskTexture() {
    return this.maskTexture
  }

  private createInscriptionMaterial(originalMaterial: THREE.MeshStandardMaterial): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vPosition = mvPosition.xyz;
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `
    
    const fragmentShader = `
      uniform vec3 diffuse;
      uniform sampler2D map;
      uniform sampler2D normalMap;
      uniform sampler2D aoMap;
      uniform sampler2D roughnessMap;
      uniform sampler2D metalnessMap;
      uniform sampler2D maskTexture;
      uniform int hoveredInscription;
      uniform float time;
      uniform float roughness;
      uniform float metalness;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      vec3 getInscriptionColor(int inscriptionId) {
        if (inscriptionId >= 1 && inscriptionId <= 4) return vec3(0.529, 0.808, 0.922); // sky
        else if (inscriptionId >= 5 && inscriptionId <= 8) return vec3(0.0, 0.545, 0.545); // water
        else if (inscriptionId >= 9 && inscriptionId <= 12) return vec3(0.804, 0.522, 0.247); // earth
        else if (inscriptionId >= 13 && inscriptionId <= 16) return vec3(0.502, 0.502, 0.0); // underworld
        else if (inscriptionId >= 17 && inscriptionId <= 24) return vec3(1.0, 0.0, 0.0); // pars_familiaris
        else if (inscriptionId >= 25 && inscriptionId <= 28) return vec3(1.0, 0.549, 0.0); // gall_bladder
        else if (inscriptionId >= 29 && inscriptionId <= 32) return vec3(1.0, 0.647, 0.0); // central_section
        else if (inscriptionId >= 33 && inscriptionId <= 38) return vec3(0.576, 0.439, 0.859); // pars_hostilis
        else if (inscriptionId >= 39 && inscriptionId <= 42) return vec3(0.502, 0.502, 0.502); // retro
        else return vec3(0.6, 0.6, 0.6);
      }
      
      // PBR lighting calculation
      vec3 calculatePBRLighting(vec3 normal, vec3 albedo, float roughnessValue, float metalnessValue, float ao) {
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfwayDir = normalize(lightDir + viewDir);
        
        float NdotL = max(dot(normal, lightDir), 0.0);
        float NdotV = max(dot(normal, viewDir), 0.0);
        float NdotH = max(dot(normal, halfwayDir), 0.0);
        float VdotH = max(dot(viewDir, halfwayDir), 0.0);
        
        // Fresnel (simplified Schlick approximation)
        vec3 F0 = mix(vec3(0.04), albedo, metalnessValue);
        vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);
        
        // Distribution (simplified)
        float alpha = roughnessValue * roughnessValue;
        float alpha2 = alpha * alpha;
        float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
        float D = alpha2 / (3.14159 * denom * denom);
        
        // Geometry (simplified)
        float k = (roughnessValue + 1.0) * (roughnessValue + 1.0) / 8.0;
        float G1L = NdotL / (NdotL * (1.0 - k) + k);
        float G1V = NdotV / (NdotV * (1.0 - k) + k);
        float G = G1L * G1V;
        
        // BRDF
        vec3 numerator = D * G * F;
        float denominator = 4.0 * NdotV * NdotL + 0.001;
        vec3 specular = numerator / denominator;
        
        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metalnessValue;
        
        vec3 diffuse = kD * albedo / 3.14159;
        
        // Ambient (increased for better visibility)
        vec3 ambient = albedo * 0.4 * ao;
        
        return ambient + (diffuse + specular) * NdotL * 1.2;
      }
      
      void main() {
        // Sample base textures
        vec4 baseColor = texture2D(map, vUv);
        vec3 albedo = diffuse * baseColor.rgb;
        
        // Sample ORM texture (Occlusion, Roughness, Metallic)
        vec3 orm = texture2D(aoMap, vUv).rgb; // Assuming ORM is in aoMap
        float ao = orm.r;           // Occlusion in Red channel
        float roughnessValue = orm.g * roughness; // Roughness in Green channel
        float metalnessValue = orm.b * metalness; // Metallic in Blue channel
        
        // Enhanced normal mapping
        vec3 normalMapColor = texture2D(normalMap, vUv).rgb;
        vec3 normalMapVector = normalize(normalMapColor * 2.0 - 1.0);
        // DirectX to OpenGL normal map conversion
        normalMapVector.y = -normalMapVector.y;
        
        // Transform normal to world space (simplified)
        vec3 finalNormal = normalize(vNormal + normalMapVector * 0.5);
        
        // Apply PBR lighting
        vec3 litColor = calculatePBRLighting(finalNormal, albedo, roughnessValue, metalnessValue, ao);
        
        // Sample segmentation mask
        vec4 maskColor = texture2D(maskTexture, vUv);
        float grayValue = maskColor.r;
        int inscriptionId = int(grayValue * 255.0 + 0.5);
        
        // Highlight specific inscription on hover
        if (inscriptionId > 0 && inscriptionId <= 42 && inscriptionId == hoveredInscription) {
          vec3 groupColor = getInscriptionColor(inscriptionId);
          
          // Subtle highlight with pulse
          float pulse = sin(time * 4.0) * 0.2 + 0.8;
          vec3 emissiveGlow = groupColor * 0.3 * pulse;
          litColor += emissiveGlow;
        }
        
        gl_FragColor = vec4(litColor, baseColor.a);
      }
    `
    
    const customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        diffuse: { value: originalMaterial.color.clone() },
        map: { value: originalMaterial.map },
        normalMap: { value: originalMaterial.normalMap },
        aoMap: { value: originalMaterial.aoMap || originalMaterial.map }, // Use ORM or fallback to diffuse
        roughnessMap: { value: originalMaterial.roughnessMap || originalMaterial.aoMap },
        metalnessMap: { value: originalMaterial.metalnessMap || originalMaterial.aoMap },
        roughness: { value: originalMaterial.roughness || 0.5 },
        metalness: { value: originalMaterial.metalness || 0.0 },
        maskTexture: this.shaderUniforms.maskTexture,
        hoveredInscription: this.shaderUniforms.hoveredInscription,
        time: this.shaderUniforms.time
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      side: THREE.FrontSide
    })
    
    console.log('🔧 Created custom PBR inscription material with uniforms:', {
      diffuse: customMaterial.uniforms.diffuse.value,
      map: !!customMaterial.uniforms.map.value,
      normalMap: !!customMaterial.uniforms.normalMap.value,
      aoMap: !!customMaterial.uniforms.aoMap.value,
      roughness: customMaterial.uniforms.roughness.value,
      metalness: customMaterial.uniforms.metalness.value,
      maskTexture: !!customMaterial.uniforms.maskTexture.value
    })
    
    return customMaterial
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

    const config = SceneConfig.animation.model.scaleAnimation
    const startTime = Date.now()

    target.scale.setScalar(config.startScale)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / config.duration, 1)
      
      const easedProgress = easingFunctions.easeInOutBalanced(progress)
      
      // Only scale the model - no movement
      const currentScale = config.startScale + (config.endScale - config.startScale) * easedProgress
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
    if (this.shaderUniforms.normalTexture.value) {
      this.shaderUniforms.normalTexture.value.dispose()
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
        '/liver-model-gltf/segmentation.png',
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
    
    console.log('Found inscription IDs in segmentation:', Array.from(uniqueValues).sort((a, b) => a - b))
    
    // Process inscriptions 1-42 (current segmentation map range)
    for (let inscriptionId = 1; inscriptionId <= 42; inscriptionId++) {
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
        console.log(`Inscription ${inscriptionId} position: U=${centerU.toFixed(3)}, V=${centerV.toFixed(3)}`)
      }
    }
    
    console.log(`Processed ${this.inscriptionPositions.size} inscriptions from segmentation map`)
  }
} 