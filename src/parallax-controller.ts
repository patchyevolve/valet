/**
 * Parallax Controller for Valentine's Day interactive webpage
 * Implements Requirements 6.1, 6.2, 6.3, 6.4, 6.5 - Distance visualization with parallax effects
 */

import { ParallaxElement, Position, ScrollRange, EasingFunction } from './types/components.js';
import { AnimationType } from './types/components.js';

export interface ParallaxConfig {
  elements: ParallaxElementConfig[];
  scrollContainer?: HTMLElement;
  smoothing: number;
  threshold: number;
}

export interface ParallaxElementConfig {
  selector: string;
  startPosition: Position;
  endPosition: Position;
  scrollRange: ScrollRange;
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
}

export interface ParallaxController {
  initialize(config: ParallaxConfig): void;
  addElement(elementConfig: ParallaxElementConfig): void;
  removeElement(selector: string): void;
  updateScrollPosition(scrollY: number): void;
  enableParallax(): void;
  disableParallax(): void;
  isParallaxEnabled(): boolean;
  getCurrentScrollProgress(): number;
}

export class ParallaxControllerImpl implements ParallaxController {
  private elements: Map<string, ParallaxElement> = new Map();
  private scrollContainer: HTMLElement;
  private isEnabled: boolean = true;
  private currentScrollY: number = 0;
  private smoothing: number = 0.1;
  private threshold: number = 0.01;
  private animationFrameId: number | null = null;
  private targetScrollY: number = 0;
  private disabledAnimations: Set<AnimationType> = new Set();

  // Easing functions
  private easingFunctions: Record<string, EasingFunction> = {
    linear: (t: number) => t,
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t)
  };

  constructor(scrollContainer: HTMLElement = document.documentElement) {
    this.scrollContainer = scrollContainer;
    this.detectReducedMotionPreference();
    this.setupScrollListener();
  }

  /**
   * Requirement 6.1: Display exactly two visual elements during Distance Visualization
   */
  initialize(config: ParallaxConfig): void {
    this.smoothing = config.smoothing;
    this.threshold = config.threshold;
    
    if (config.scrollContainer) {
      this.scrollContainer = config.scrollContainer;
      this.setupScrollListener();
    }

    // Clear existing elements
    this.elements.clear();

    // Add configured elements
    config.elements.forEach(elementConfig => {
      this.addElement(elementConfig);
    });
  }

  /**
   * Add a parallax element to the controller
   */
  addElement(elementConfig: ParallaxElementConfig): void {
    const element = document.querySelector(elementConfig.selector) as HTMLElement;
    if (!element) {
      console.warn(`Parallax element not found: ${elementConfig.selector}`);
      return;
    }

    const easingFunction = this.easingFunctions[elementConfig.easing || 'easeInOut'] || this.easingFunctions['easeInOut'];

    const parallaxElement: ParallaxElement = {
      id: elementConfig.selector,
      element,
      startPosition: { ...elementConfig.startPosition },
      endPosition: { ...elementConfig.endPosition },
      scrollRange: { ...elementConfig.scrollRange },
      easing: easingFunction!
    };

    this.elements.set(elementConfig.selector, parallaxElement);
    
    // Set initial position
    this.updateElementPosition(parallaxElement, 0);
  }

  /**
   * Remove a parallax element from the controller
   */
  removeElement(selector: string): void {
    const element = this.elements.get(selector);
    if (element) {
      // Reset element to original position
      this.resetElementPosition(element);
      this.elements.delete(selector);
    }
  }

  /**
   * Requirement 6.2: Apply parallax effects based on scroll position
   */
  updateScrollPosition(scrollY: number): void {
    if (!this.isEnabled || this.disabledAnimations.has('parallax')) {
      return;
    }

    this.targetScrollY = scrollY;
    this.currentScrollY = scrollY; // Update current position immediately for progress calculation
    
    // Start smooth animation if not already running
    if (!this.animationFrameId) {
      this.startSmoothAnimation();
    }
  }

  /**
   * Enable parallax effects
   */
  enableParallax(): void {
    this.isEnabled = true;
  }

  /**
   * Disable parallax effects for accessibility
   */
  disableParallax(): void {
    this.isEnabled = false;
    
    // Stop animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset all elements to start position
    this.elements.forEach(element => {
      this.resetElementPosition(element);
    });
  }

  /**
   * Check if parallax is currently enabled
   */
  isParallaxEnabled(): boolean {
    return this.isEnabled && !this.disabledAnimations.has('parallax');
  }

  /**
   * Get current scroll progress as a percentage
   */
  getCurrentScrollProgress(): number {
    const maxScroll = this.scrollContainer.scrollHeight - this.scrollContainer.clientHeight;
    return maxScroll > 0 ? Math.min(this.currentScrollY / maxScroll, 1) : 0;
  }

  /**
   * Disable specific animation types for accessibility
   */
  disableAnimations(types: AnimationType[]): void {
    types.forEach(type => this.disabledAnimations.add(type));
    
    if (types.includes('parallax')) {
      this.disableParallax();
    }
  }

  /**
   * Detect reduced motion preference and disable parallax accordingly
   */
  private detectReducedMotionPreference(): void {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disableAnimations(['parallax']);
    }
  }

  /**
   * Set up scroll event listener
   */
  private setupScrollListener(): void {
    const handleScroll = () => {
      const scrollY = this.scrollContainer.scrollTop || window.pageYOffset;
      this.updateScrollPosition(scrollY);
    };

    // Remove existing listener if any
    this.scrollContainer.removeEventListener('scroll', handleScroll);
    
    // Add new listener
    this.scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial scroll position
    handleScroll();
  }

  /**
   * Requirement 6.3: Animate elements moving closer together based on scroll position
   * Requirement 6.5: Provide visual feedback indicating progression through distance states
   */
  private startSmoothAnimation(): void {
    const animate = () => {
      if (!this.isEnabled || this.disabledAnimations.has('parallax')) {
        this.animationFrameId = null;
        return;
      }

      // Smooth scroll interpolation
      const diff = this.targetScrollY - this.currentScrollY;
      
      if (Math.abs(diff) > this.threshold) {
        this.currentScrollY += diff * this.smoothing;
        
        // Update all parallax elements
        this.elements.forEach(element => {
          this.updateElementBasedOnScroll(element);
        });
        
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.currentScrollY = this.targetScrollY;
        this.elements.forEach(element => {
          this.updateElementBasedOnScroll(element);
        });
        this.animationFrameId = null;
      }
    };

    animate();
  }

  /**
   * Update element position based on current scroll position
   */
  private updateElementBasedOnScroll(parallaxElement: ParallaxElement): void {
    const { scrollRange } = parallaxElement;
    
    // Calculate progress within the element's scroll range
    let progress = 0;
    if (this.currentScrollY >= scrollRange.start && this.currentScrollY <= scrollRange.end) {
      const rangeSize = scrollRange.end - scrollRange.start;
      progress = rangeSize > 0 ? (this.currentScrollY - scrollRange.start) / rangeSize : 0;
    } else if (this.currentScrollY > scrollRange.end) {
      progress = 1;
    }

    // Apply easing function
    const easedProgress = parallaxElement.easing(Math.max(0, Math.min(1, progress)));
    
    // Update element position
    this.updateElementPosition(parallaxElement, easedProgress);
  }

  /**
   * Requirement 6.4: Transition to Personal Memory Reveal when maximum closeness is achieved
   */
  private updateElementPosition(parallaxElement: ParallaxElement, progress: number): void {
    const { element, startPosition, endPosition } = parallaxElement;
    
    // Interpolate position values
    const currentPosition: Position = {
      x: this.lerp(startPosition.x, endPosition.x, progress),
      y: this.lerp(startPosition.y, endPosition.y, progress),
      scale: this.lerp(startPosition.scale, endPosition.scale, progress),
      opacity: this.lerp(startPosition.opacity, endPosition.opacity, progress)
    };

    // Apply transforms
    const transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0) scale(${currentPosition.scale})`;
    
    element.style.transform = transform;
    element.style.opacity = currentPosition.opacity.toString();
    
    // Add data attribute for progress tracking
    element.setAttribute('data-parallax-progress', progress.toString());
    
    // Trigger custom event when maximum closeness is achieved
    if (progress >= 1 && !element.hasAttribute('data-max-closeness-reached')) {
      element.setAttribute('data-max-closeness-reached', 'true');
      
      const event = new CustomEvent('parallax-max-closeness', {
        detail: { element: parallaxElement, progress }
      });
      element.dispatchEvent(event);
    } else if (progress < 1) {
      element.removeAttribute('data-max-closeness-reached');
    }
  }

  /**
   * Reset element to its original position
   */
  private resetElementPosition(parallaxElement: ParallaxElement): void {
    const { element } = parallaxElement;
    
    element.style.transform = '';
    element.style.opacity = '';
    element.removeAttribute('data-parallax-progress');
    element.removeAttribute('data-max-closeness-reached');
  }

  /**
   * Linear interpolation utility
   */
  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }
}

/**
 * Factory function to create distance visualization parallax configuration
 * Requirement 6.1: Display exactly two visual elements
 */
export function createDistanceVisualizationConfig(): ParallaxConfig {
  return {
    elements: [
      {
        selector: '.distance-element-1',
        startPosition: { x: -200, y: 0, scale: 0.8, opacity: 0.7 },
        endPosition: { x: -50, y: 0, scale: 1.2, opacity: 1 },
        scrollRange: { start: 0, end: 500 },
        easing: 'easeInOut'
      },
      {
        selector: '.distance-element-2',
        startPosition: { x: 200, y: 0, scale: 0.8, opacity: 0.7 },
        endPosition: { x: 50, y: 0, scale: 1.2, opacity: 1 },
        scrollRange: { start: 0, end: 500 },
        easing: 'easeInOut'
      }
    ],
    smoothing: 0.1,
    threshold: 0.5
  };
}