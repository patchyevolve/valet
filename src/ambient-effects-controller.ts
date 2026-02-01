/**
 * Ambient Effects Controller for Valentine's Day interactive webpage
 * Implements Requirements 3.1, 3.2, 3.3, 3.5 - Ambient visual effects with gradient shifts and floating particles
 */

import { AnimationType } from './types/components.js';

export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  opacity: { min: number; max: number };
  colors: string[];
}

export interface GradientConfig {
  colors: string[];
  duration: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface AmbientEffectsController {
  startAmbientEffects(): void;
  stopAmbientEffects(): void;
  updateGradientShift(config: GradientConfig): void;
  createFloatingParticles(config: ParticleConfig): void;
  disableAnimations(types: AnimationType[]): void;
  isAnimationEnabled(type: AnimationType): boolean;
}

interface Particle {
  id: string;
  element: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export class AmbientEffectsControllerImpl implements AmbientEffectsController {
  private container: HTMLElement;
  private particles: Particle[] = [];
  private gradientElement: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private gradientAnimationId: NodeJS.Timeout | null = null;
  private disabledAnimations: Set<AnimationType> = new Set();
  private isRunning: boolean = false;

  private defaultParticleConfig: ParticleConfig = {
    count: 20,
    size: { min: 2, max: 6 },
    speed: { min: 0.5, max: 2 },
    opacity: { min: 0.3, max: 0.8 },
    colors: ['#ff6b9d', '#ffc3e0', '#ff8fab', '#ffb3d1']
  };

  private defaultGradientConfig: GradientConfig = {
    colors: ['#ff6b9d', '#ffc3e0', '#ff8fab', '#ffb3d1', '#ff6b9d'],
    duration: 8000,
    direction: 'diagonal'
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupContainer();
    this.detectReducedMotionPreference();
  }

  /**
   * Requirement 3.1: Display gradient shifts and floating particles when entering Ambient Idle State
   */
  startAmbientEffects(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Start gradient shift animations if not disabled
    if (!this.disabledAnimations.has('gradients')) {
      this.updateGradientShift(this.defaultGradientConfig);
    }
    
    // Create floating particles if not disabled
    if (!this.disabledAnimations.has('particles')) {
      this.createFloatingParticles(this.defaultParticleConfig);
    }
    
    // Start continuous animation loop
    this.startAnimationLoop();
  }

  /**
   * Requirement 3.5: Maintain ambient effects until explicit state transition
   */
  stopAmbientEffects(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Stop animation loops
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.gradientAnimationId) {
      clearInterval(this.gradientAnimationId);
      this.gradientAnimationId = null;
    }
    
    // Clean up particles
    this.particles.forEach(particle => {
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    this.particles = [];
    
    // Clean up gradient element
    if (this.gradientElement && this.gradientElement.parentNode) {
      this.gradientElement.parentNode.removeChild(this.gradientElement);
      this.gradientElement = null;
    }
  }

  /**
   * Requirement 3.2: Continuously animate background gradients
   */
  updateGradientShift(config: GradientConfig): void {
    if (this.disabledAnimations.has('gradients')) return;
    
    // Create or update gradient element
    if (!this.gradientElement) {
      this.gradientElement = document.createElement('div');
      this.gradientElement.className = 'ambient-gradient';
      this.gradientElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        transition: background 2s ease-in-out;
      `;
      this.container.appendChild(this.gradientElement);
    }
    
    // Start gradient animation cycle
    let colorIndex = 0;
    const animateGradient = () => {
      if (!this.gradientElement || this.disabledAnimations.has('gradients')) return;
      
      const currentColor = config.colors[colorIndex];
      const nextColor = config.colors[(colorIndex + 1) % config.colors.length];
      
      let gradientDirection = '';
      switch (config.direction) {
        case 'horizontal':
          gradientDirection = 'to right';
          break;
        case 'vertical':
          gradientDirection = 'to bottom';
          break;
        case 'diagonal':
          gradientDirection = '45deg';
          break;
        default:
          gradientDirection = 'to bottom'; // Default direction
          break;
      }
      
      // Always include direction in gradient
      this.gradientElement.style.background = 
        `linear-gradient(${gradientDirection}, ${currentColor}, ${nextColor})`;
      
      colorIndex = (colorIndex + 1) % config.colors.length;
    };
    
    // Initial gradient
    animateGradient();
    
    // Set up continuous gradient shifting
    if (this.gradientAnimationId) {
      clearInterval(this.gradientAnimationId);
    }
    
    this.gradientAnimationId = setInterval(animateGradient, config.duration / config.colors.length);
  }

  /**
   * Requirement 3.3: Animate floating particle effects
   */
  createFloatingParticles(config: ParticleConfig): void {
    if (this.disabledAnimations.has('particles')) return;
    
    // Clear existing particles
    this.particles.forEach(particle => {
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    this.particles = [];
    
    // Create new particles
    for (let i = 0; i < config.count; i++) {
      const particle = this.createParticle(config);
      this.particles.push(particle);
      this.container.appendChild(particle.element);
    }
  }

  /**
   * Disable specific animation types for accessibility
   */
  disableAnimations(types: AnimationType[]): void {
    types.forEach(type => this.disabledAnimations.add(type));
    
    // Stop disabled animations immediately
    if (types.includes('particles')) {
      this.particles.forEach(particle => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
      this.particles = [];
    }
    
    if (types.includes('gradients') && this.gradientElement) {
      if (this.gradientAnimationId) {
        clearInterval(this.gradientAnimationId);
        this.gradientAnimationId = null;
      }
      this.gradientElement.style.background = '#ff6b9d'; // Static fallback
    }
  }

  /**
   * Check if specific animation type is enabled
   */
  isAnimationEnabled(type: AnimationType): boolean {
    return !this.disabledAnimations.has(type);
  }

  /**
   * Set up container for ambient effects
   */
  private setupContainer(): void {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
  }

  /**
   * Detect reduced motion preference and disable animations accordingly
   */
  private detectReducedMotionPreference(): void {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disableAnimations(['particles', 'gradients']);
    }
  }

  /**
   * Create a single particle with random properties
   */
  private createParticle(config: ParticleConfig): Particle {
    const element = document.createElement('div');
    const size = config.size.min + Math.random() * (config.size.max - config.size.min);
    const opacity = config.opacity.min + Math.random() * (config.opacity.max - config.opacity.min);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)] || '#ff6b9d';
    
    const x = Math.random() * this.container.clientWidth;
    const y = Math.random() * this.container.clientHeight;
    const vx = (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min;
    const vy = (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min;
    
    element.style.position = 'absolute';
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.background = color;
    element.style.borderRadius = '50%';
    element.style.opacity = opacity.toString();
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      element,
      x,
      y,
      vx,
      vy,
      size,
      opacity,
      color
    };
  }

  /**
   * Main animation loop for particle movement
   */
  private startAnimationLoop(): void {
    const animate = () => {
      if (!this.isRunning) return;
      
      // Update particle positions
      this.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen edges
        if (particle.x < -particle.size) {
          particle.x = this.container.clientWidth + particle.size;
        } else if (particle.x > this.container.clientWidth + particle.size) {
          particle.x = -particle.size;
        }
        
        if (particle.y < -particle.size) {
          particle.y = this.container.clientHeight + particle.size;
        } else if (particle.y > this.container.clientHeight + particle.size) {
          particle.y = -particle.size;
        }
        
        // Update element position
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
      });
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }
}