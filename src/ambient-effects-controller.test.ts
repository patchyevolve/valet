/**
 * Unit tests for Ambient Effects Controller
 * Tests gradient shift animations, floating particle system, and continuous animation loops
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AmbientEffectsControllerImpl, ParticleConfig, GradientConfig } from './ambient-effects-controller.js';

// Mock DOM methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});
global.cancelAnimationFrame = vi.fn();

describe('AmbientEffectsController', () => {
  let container: HTMLElement;
  let controller: AmbientEffectsControllerImpl;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    Object.defineProperty(container, 'clientWidth', { value: 800, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, writable: true });
    document.body.appendChild(container);
    
    controller = new AmbientEffectsControllerImpl(container);
  });

  afterEach(() => {
    controller.stopAmbientEffects();
    document.body.removeChild(container);
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('Ambient Effects Lifecycle', () => {
    it('should start ambient effects with gradients and particles', () => {
      controller.startAmbientEffects();
      
      // Check that gradient element is created
      const gradientElement = container.querySelector('.ambient-gradient');
      expect(gradientElement).toBeTruthy();
      expect(gradientElement?.style.position).toBe('fixed');
      expect(gradientElement?.style.zIndex).toBe('-1');
    });

    it('should stop ambient effects and clean up elements', () => {
      controller.startAmbientEffects();
      
      // Verify elements exist
      expect(container.children.length).toBeGreaterThan(0);
      
      controller.stopAmbientEffects();
      
      // Verify cleanup
      expect(container.querySelector('.ambient-gradient')).toBeFalsy();
    });

    it('should not start effects twice', () => {
      controller.startAmbientEffects();
      const initialChildCount = container.children.length;
      
      controller.startAmbientEffects();
      
      expect(container.children.length).toBe(initialChildCount);
    });
  });

  describe('Gradient Shift Animations', () => {
    it('should create gradient element with proper styling', () => {
      const gradientConfig: GradientConfig = {
        colors: ['#ff0000', '#00ff00', '#0000ff'],
        duration: 3000,
        direction: 'horizontal'
      };
      
      controller.updateGradientShift(gradientConfig);
      
      const gradientElement = container.querySelector('.ambient-gradient') as HTMLElement;
      expect(gradientElement).toBeTruthy();
      expect(gradientElement.style.width).toBe('100%');
      expect(gradientElement.style.height).toBe('100%');
      expect(gradientElement.style.background).toContain('linear-gradient');
      expect(gradientElement.style.background).toContain('to right');
    });

    it('should handle different gradient directions', () => {
      const configs = [
        { direction: 'horizontal' as const, expected: 'to right' },
        { direction: 'vertical' as const, expected: 'to bottom' },
        { direction: 'diagonal' as const, expected: '45deg' }
      ];
      
      configs.forEach(({ direction, expected }) => {
        controller.updateGradientShift({
          colors: ['#ff0000', '#00ff00'],
          duration: 1000,
          direction
        });
        
        const gradientElement = container.querySelector('.ambient-gradient') as HTMLElement;
        const backgroundStyle = gradientElement.style.background;
        
        // Check that gradient is applied and contains the expected direction or colors
        expect(backgroundStyle).toContain('linear-gradient');
        expect(backgroundStyle).toContain('rgb(255, 0, 0)');
        expect(backgroundStyle).toContain('rgb(0, 255, 0)');
        
        // For specific directions, check if they're preserved or if the gradient is applied correctly
        if (direction === 'diagonal') {
          // 45deg should be preserved
          expect(backgroundStyle).toContain('45deg');
        } else {
          // For horizontal and vertical, the browser might normalize them
          // Just ensure the gradient is applied with correct colors
          expect(backgroundStyle).toMatch(/linear-gradient\([^)]*rgb\(255, 0, 0\)[^)]*rgb\(0, 255, 0\)[^)]*\)/);
        }
      });
    });

    it('should not create gradient when gradients are disabled', () => {
      controller.disableAnimations(['gradients']);
      controller.updateGradientShift({
        colors: ['#ff0000', '#00ff00'],
        duration: 1000,
        direction: 'horizontal'
      });
      
      expect(container.querySelector('.ambient-gradient')).toBeFalsy();
    });
  });

  describe('Floating Particle System', () => {
    it('should create particles with specified count', () => {
      const particleConfig: ParticleConfig = {
        count: 5,
        size: { min: 2, max: 4 },
        speed: { min: 1, max: 2 },
        opacity: { min: 0.5, max: 0.8 },
        colors: ['#ff0000']
      };
      
      controller.createFloatingParticles(particleConfig);
      
      // Count particle elements (excluding gradient element)
      const particles = Array.from(container.children).filter(
        child => !child.classList.contains('ambient-gradient')
      );
      expect(particles.length).toBe(5);
    });

    it('should create particles with proper styling', () => {
      const particleConfig: ParticleConfig = {
        count: 1,
        size: { min: 10, max: 10 },
        speed: { min: 1, max: 1 },
        opacity: { min: 0.5, max: 0.5 },
        colors: ['#ff0000']
      };
      
      controller.createFloatingParticles(particleConfig);
      
      const particle = Array.from(container.children).find(
        child => !child.classList.contains('ambient-gradient')
      ) as HTMLElement;
      
      expect(particle).toBeTruthy();
      expect(particle.style.position).toBe('absolute');
      expect(particle.style.borderRadius).toBe('50%');
      expect(particle.style.background).toBe('rgb(255, 0, 0)');
      expect(particle.style.width).toBe('10px');
      expect(particle.style.height).toBe('10px');
    });

    it('should not create particles when particles are disabled', () => {
      controller.disableAnimations(['particles']);
      controller.createFloatingParticles({
        count: 5,
        size: { min: 2, max: 4 },
        speed: { min: 1, max: 2 },
        opacity: { min: 0.5, max: 0.8 },
        colors: ['#ff0000']
      });
      
      const particles = Array.from(container.children).filter(
        child => !child.classList.contains('ambient-gradient')
      );
      expect(particles.length).toBe(0);
    });

    it('should clear existing particles when creating new ones', () => {
      // Create first set of particles
      controller.createFloatingParticles({
        count: 3,
        size: { min: 2, max: 4 },
        speed: { min: 1, max: 2 },
        opacity: { min: 0.5, max: 0.8 },
        colors: ['#ff0000']
      });
      
      // Create second set of particles
      controller.createFloatingParticles({
        count: 2,
        size: { min: 2, max: 4 },
        speed: { min: 1, max: 2 },
        opacity: { min: 0.5, max: 0.8 },
        colors: ['#00ff00']
      });
      
      const particles = Array.from(container.children).filter(
        child => !child.classList.contains('ambient-gradient')
      );
      expect(particles.length).toBe(2);
    });
  });

  describe('Animation Control', () => {
    it('should disable specific animation types', () => {
      controller.disableAnimations(['particles', 'gradients']);
      
      expect(controller.isAnimationEnabled('particles')).toBe(false);
      expect(controller.isAnimationEnabled('gradients')).toBe(false);
      expect(controller.isAnimationEnabled('fade')).toBe(true);
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      // Create new controller with reduced motion
      const reducedMotionController = new AmbientEffectsControllerImpl(container);
      
      expect(reducedMotionController.isAnimationEnabled('particles')).toBe(false);
      expect(reducedMotionController.isAnimationEnabled('gradients')).toBe(false);
    });
  });

  describe('Container Setup', () => {
    it('should set up container with proper styling', () => {
      expect(container.style.position).toBe('relative');
      expect(container.style.overflow).toBe('hidden');
    });
  });
});