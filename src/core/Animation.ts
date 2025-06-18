// Optimized easing functions for smooth animations
export const easingFunctions = {
  // Balanced ease in out - same speed for acceleration and deceleration
  easeInOutBalanced: (t) => {
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
  constructor() {
    this.animations = new Map()
    this.isRunning = false
    this.boundUpdate = this.update.bind(this)
  }

  // Add a new animation
  animate(id, duration, updateFunction, easing = easingFunctions.easeInOutBalanced, onComplete = null) {
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