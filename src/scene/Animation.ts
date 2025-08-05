import * as THREE from 'three'

// Optimized easing functions for smooth animations
export const easingFunctions = {
  // Balanced ease in out - same speed for acceleration and deceleration
  easeInOutBalanced: (t: number) => {
    if (t < 0.5) {
      // First half: ease in with quadratic curve
      return 2 * t * t
    } else {
      // Second half: ease out with quadratic curve (mirrored)
      const u = 2 * t - 2
      return 1 - 0.5 * u * u
    }
  }
}

// High-performance animation class using requestAnimationFrame
export class OptimizedAnimator {
  private animations: Map<string, any> = new Map()
  private isRunning: boolean = false
  private boundUpdate: (currentTime: number) => void
  
  constructor() {
    this.boundUpdate = this.update.bind(this)
  }

  // Add a new animation
  animate(id: string, duration: number, updateFunction: (progress: number) => void, easing = easingFunctions.easeInOutBalanced, onComplete: (() => void) | null = null) {
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
  stop(id: string) {
    return this.animations.delete(id)
  }

  // Start the animation loop
  start() {
    if (!this.isRunning && this.animations.size > 0) {
      this.isRunning = true
      requestAnimationFrame(this.boundUpdate)
    }
  }

  // Main update loop - optimized for performance
  update(currentTime: number) {
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
}

// Global animator instance for shared use
export const globalAnimator = new OptimizedAnimator()

// Utility function for vector interpolation
export const lerpVector3 = (start: THREE.Vector3, end: THREE.Vector3, t: number, target: THREE.Vector3) => {
  target.x = start.x + (end.x - start.x) * t
  target.y = start.y + (end.y - start.y) * t
  target.z = start.z + (end.z - start.z) * t
  return target
} 