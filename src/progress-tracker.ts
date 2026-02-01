/**
 * Progress Tracker Component
 * Implements scroll-based progression detection with upward drift visual effects
 * Creates smooth scroll-to-state mapping for emotional journey control
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

import { ProgressTracker, ParallaxElement } from './types/components.js';

interface ScrollThreshold {
  threshold: number;
  callback: () => void;
  triggered: boolean;
}

interface DriftParticle {
  id: string;
  element: HTMLElement;
  x: number;
  y: number;
  velocity: { x: number; y: number };
  opacity: number;
  size: number;
}

export class ProgressTrackerController implements ProgressTracker {
  private scrollProgressionEnabled = false;
  private scrollThresholds: ScrollThreshold[] = [];
  private parallaxElements: ParallaxElement[] = [];
  private driftParticles: DriftParticle[] = [];
  private animationFrameId: number | null = null;
  private lastScrollY = 0;
  private scrollContainer: HTMLElement;
  private driftContainer: HTMLElement | null = null;
  private smoothScrollProgress = 0;
  private targetScrollProgress = 0;
  private smoothingFactor = 0.1;

  constructor(scrollContainer?: HTMLElement) {
    this.scrollContainer = scrollContainer || document.documentElement;
    this.initializeDriftContainer();
    this.bindScrollEvents();
  }

  private initializeDriftContainer(): void {
    // Create container for drift particles
    this.driftContainer = document.createElement('div');
    this.driftContainer.id = 'progress-drift-container';
    this.driftContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    `;
    document.body.appendChild(this.driftContainer);

    // Add drift particle styles
    if (!document.getElementById('progress-tracker-styles')) {
      const style = document.createElement('style');
      style.id = 'progress-tracker-styles';
      style.textContent = `
        .drift-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%);
          pointer-events: none;
          will-change: transform, opacity;
        }
        .drift-particle.fading {
          transition: opacity 0.5s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private bindScrollEvents(): void {
    const handleScroll = () => {
      if (this.scrollProgressionEnabled) {
        this.updateScrollProgress();
        this.checkScrollThresholds();
        this.updateParallaxElements();
        this.triggerDriftEffects();
      }
    };

    // Use passive listener for better performance
    this.scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  enableScrollProgression(): void {
    this.scrollProgressionEnabled = true;
    this.startAnimationLoop();
  }

  disableScrollProgression(): void {
    this.scrollProgressionEnabled = false;
    this.stopAnimationLoop();
    this.clearDriftParticles();
  }

  getCurrentScrollProgress(): number {
    return this.smoothScrollProgress;
  }

  registerScrollThreshold(threshold: number, callback: () => void): void {
    // Validate threshold
    if (threshold < 0 || threshold > 1) {
      throw new Error('Scroll threshold must be between 0 and 1');
    }

    this.scrollThresholds.push({
      threshold,
      callback,
      triggered: false
    });

    // Sort thresholds by value for efficient checking
    this.scrollThresholds.sort((a, b) => a.threshold - b.threshold);
  }

  applyParallaxEffects(elements: ParallaxElement[]): void {
    this.parallaxElements = [...elements];
    
    // Validate parallax elements
    this.parallaxElements.forEach((element, index) => {
      if (!element.element || !element.element.style) {
        console.warn(`Invalid parallax element at index ${index}: missing DOM element`);
      }
      if (element.scrollRange.start >= element.scrollRange.end) {
        console.warn(`Invalid scroll range for element ${element.id}: start must be less than end`);
      }
    });
  }

  private updateScrollProgress(): void {
    const scrollTop = this.scrollContainer.scrollTop || window.pageYOffset;
    const scrollHeight = this.scrollContainer.scrollHeight || document.documentElement.scrollHeight;
    const clientHeight = this.scrollContainer.clientHeight || window.innerHeight;
    
    const maxScroll = scrollHeight - clientHeight;
    this.targetScrollProgress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
    
    // Smooth the scroll progress for better visual experience
    this.smoothScrollProgress += (this.targetScrollProgress - this.smoothScrollProgress) * this.smoothingFactor;
    
    // Clamp to prevent floating point precision issues
    this.smoothScrollProgress = Math.max(0, Math.min(1, this.smoothScrollProgress));
  }

  private checkScrollThresholds(): void {
    this.scrollThresholds.forEach(threshold => {
      if (!threshold.triggered && this.smoothScrollProgress >= threshold.threshold) {
        threshold.triggered = true;
        try {
          threshold.callback();
        } catch (error) {
          console.error('Error executing scroll threshold callback:', error);
        }
      } else if (threshold.triggered && this.smoothScrollProgress < threshold.threshold - 0.05) {
        // Reset threshold if scrolled back significantly (with hysteresis)
        threshold.triggered = false;
      }
    });
  }

  private updateParallaxElements(): void {
    this.parallaxElements.forEach(element => {
      try {
        this.updateParallaxElement(element);
      } catch (error) {
        console.error(`Error updating parallax element ${element.id}:`, error);
      }
    });
  }

  private updateParallaxElement(element: ParallaxElement): void {
    const { scrollRange, startPosition, endPosition, easing } = element;
    
    // Calculate progress within the element's scroll range
    let progress = 0;
    if (this.smoothScrollProgress >= scrollRange.start && this.smoothScrollProgress <= scrollRange.end) {
      const rangeProgress = (this.smoothScrollProgress - scrollRange.start) / (scrollRange.end - scrollRange.start);
      progress = easing ? easing(rangeProgress) : rangeProgress;
    } else if (this.smoothScrollProgress > scrollRange.end) {
      progress = 1;
    }

    // Interpolate position values
    const currentPosition = {
      x: this.lerp(startPosition.x, endPosition.x, progress),
      y: this.lerp(startPosition.y, endPosition.y, progress),
      scale: this.lerp(startPosition.scale, endPosition.scale, progress),
      opacity: this.lerp(startPosition.opacity, endPosition.opacity, progress)
    };

    // Apply transforms
    element.element.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px) scale(${currentPosition.scale})`;
    element.element.style.opacity = currentPosition.opacity.toString();
  }

  private triggerDriftEffects(): void {
    const currentScrollY = this.scrollContainer.scrollTop || window.pageYOffset;
    const scrollDelta = currentScrollY - this.lastScrollY;
    
    // Only create particles when scrolling down
    if (scrollDelta > 0 && Math.random() < 0.3) {
      this.createDriftParticle();
    }
    
    this.lastScrollY = currentScrollY;
  }

  private createDriftParticle(): void {
    if (!this.driftContainer) return;

    const particle: DriftParticle = {
      id: `drift-${Date.now()}-${Math.random()}`,
      element: document.createElement('div'),
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 20,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: -2 - Math.random() * 3
      },
      opacity: 0.6 + Math.random() * 0.4,
      size: 3 + Math.random() * 5
    };

    // Configure particle element
    particle.element.className = 'drift-particle';
    particle.element.style.cssText = `
      left: ${particle.x}px;
      top: ${particle.y}px;
      width: ${particle.size}px;
      height: ${particle.size}px;
      opacity: ${particle.opacity};
    `;

    this.driftContainer.appendChild(particle.element);
    this.driftParticles.push(particle);

    // Limit number of particles for performance
    if (this.driftParticles.length > 20) {
      this.removeDriftParticle(this.driftParticles[0]);
    }
  }

  private updateDriftParticles(): void {
    this.driftParticles.forEach((particle, index) => {
      // Update position
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.opacity *= 0.995; // Gradual fade

      // Apply position
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
      particle.element.style.opacity = particle.opacity.toString();

      // Remove particles that are off-screen or too faded
      if (particle.y < -20 || particle.opacity < 0.1 || particle.x < -20 || particle.x > window.innerWidth + 20) {
        this.removeDriftParticle(particle);
      }
    });
  }

  private removeDriftParticle(particle: DriftParticle): void {
    const index = this.driftParticles.indexOf(particle);
    if (index > -1) {
      this.driftParticles.splice(index, 1);
      if (this.driftContainer && particle.element.parentNode) {
        this.driftContainer.removeChild(particle.element);
      }
    }
  }

  private clearDriftParticles(): void {
    this.driftParticles.forEach(particle => {
      if (this.driftContainer && particle.element.parentNode) {
        this.driftContainer.removeChild(particle.element);
      }
    });
    this.driftParticles = [];
  }

  private startAnimationLoop(): void {
    if (this.animationFrameId) return;

    const animate = () => {
      if (this.scrollProgressionEnabled) {
        this.updateDriftParticles();
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  // Utility methods
  resetScrollThresholds(): void {
    this.scrollThresholds.forEach(threshold => {
      threshold.triggered = false;
    });
  }

  removeScrollThreshold(callback: () => void): void {
    this.scrollThresholds = this.scrollThresholds.filter(threshold => threshold.callback !== callback);
  }

  getScrollVelocity(): number {
    return this.targetScrollProgress - this.smoothScrollProgress;
  }

  isScrollingDown(): boolean {
    return this.getScrollVelocity() > 0;
  }

  // Clean up resources
  destroy(): void {
    this.disableScrollProgression();
    this.scrollThresholds = [];
    this.parallaxElements = [];
    
    if (this.driftContainer && this.driftContainer.parentNode) {
      this.driftContainer.parentNode.removeChild(this.driftContainer);
    }
    this.driftContainer = null;
  }
}