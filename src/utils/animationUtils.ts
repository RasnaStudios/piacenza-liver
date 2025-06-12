// Optimized easing functions for smooth animations
export const easingFunctions = {
  // Cubic ease out - smooth deceleration
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  
  // Cubic ease in out - smooth acceleration and deceleration
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  
  // Quartic ease out - more dramatic deceleration
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  
  // Quartic ease in out - snappy acceleration and deceleration
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  
  // Linear - constant speed
  linear: (t) => t
}

// High-performance animation class using requestAnimationFrame
export class OptimizedAnimator {
  constructor() {
    this.animations = new Map()
    this.isRunning = false
    this.boundUpdate = this.update.bind(this)
  }

  // Add a new animation
  animate(id, duration, updateFunction, easing = easingFunctions.easeOutCubic, onComplete = null) {
    const animation = {
      id,
      startTime: performance.now(),
      duration,
      updateFunction,
      easing,
      onComplete
    }

    this.animations.set(id, animation)
    
    if (!this.isRunning) {
      this.start()
    }

    return id
  }

  // Remove an animation
  stop(id) {
    return this.animations.delete(id)
  }

  // Stop all animations
  stopAll() {
    this.animations.clear()
    this.isRunning = false
  }

  // Start the animation loop
  start() {
    if (!this.isRunning && this.animations.size > 0) {
      this.isRunning = true
      requestAnimationFrame(this.boundUpdate)
    }
  }

  // Main update loop - optimized for performance
  update(currentTime) {
    if (this.animations.size === 0) {
      this.isRunning = false
      return
    }

    const completedAnimations = []

    // Process all animations
    for (const [id, animation] of this.animations) {
      const elapsed = currentTime - animation.startTime
      const progress = Math.min(elapsed / animation.duration, 1)
      const easedProgress = animation.easing(progress)

      // Update the animation
      animation.updateFunction(easedProgress, progress)

      // Check if animation is complete
      if (progress >= 1) {
        completedAnimations.push(id)
        if (animation.onComplete) {
          animation.onComplete()
        }
      }
    }

    // Remove completed animations
    for (const id of completedAnimations) {
      this.animations.delete(id)
    }

    // Continue the loop if there are still animations
    if (this.animations.size > 0) {
      requestAnimationFrame(this.boundUpdate)
    } else {
      this.isRunning = false
    }
  }

  // Check if a specific animation is running
  isAnimating(id) {
    return this.animations.has(id)
  }

  // Check if any animations are running
  hasActiveAnimations() {
    return this.animations.size > 0
  }
}

// Global animator instance for shared use
export const globalAnimator = new OptimizedAnimator()

// Utility function for vector interpolation
export const lerpVector3 = (start, end, t, target) => {
  target.x = start.x + (end.x - start.x) * t
  target.y = start.y + (end.y - start.y) * t
  target.z = start.z + (end.z - start.z) * t
  return target
}

// Utility function for smooth camera transitions
export const createCameraAnimation = (camera, controls, startPos, endPos, startTarget, endTarget, duration = 1500) => {
  const tempVector = { x: 0, y: 0, z: 0 }
  
  return {
    duration,
    update: (progress) => {
      // Interpolate camera position
      lerpVector3(startPos, endPos, progress, tempVector)
      camera.position.set(tempVector.x, tempVector.y, tempVector.z)
      
      // Interpolate camera target
      lerpVector3(startTarget, endTarget, progress, tempVector)
      controls.target.set(tempVector.x, tempVector.y, tempVector.z)
      
      controls.update()
    }
  }
} 