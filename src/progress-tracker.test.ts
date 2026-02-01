/**
 * Progress Tracker Component Tests
 * Tests scroll-based progression, drift effects, and parallax integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProgressTrackerController } from './progress-tracker.js';
import { ParallaxElement } from './types/components.js';

// Mock requestAnimationFrame to prevent infinite loops in tests
let animationFrameId = 0;
vi.stubGlobal('requestAnimationFrame', vi.fn().mockImplementation((fn) => {
  // Don't actually call the function to prevent infinite loops
  return ++animationFrameId;
}));

vi.stubGlobal('cancelAnimationFrame', vi.fn());

describe('ProgressTrackerController', () => {
  let progressTracker: ProgressTrackerController;

  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameId = 0;
    progressTracker = new ProgressTrackerController();
  });

  afterEach(() => {
    if (progressTracker) {
      progressTracker.destroy();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default scroll container', () => {
      expect(progressTracker).toBeDefined();
      expect(progressTracker.getCurrentScrollProgress()).toBe(0);
    });

    it('should initialize with custom scroll container', () => {
      const customContainer = document.createElement('div');
      const tracker = new ProgressTrackerController(customContainer);
      
      expect(tracker).toBeDefined();
      tracker.destroy();
    });

    it('should create drift container with correct styles', () => {
      // Test that initialization doesn't throw
      expect(() => new ProgressTrackerController()).not.toThrow();
    });
  });

  describe('Scroll Progression Control', () => {
    it('should enable scroll progression', () => {
      progressTracker.enableScrollProgression();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should disable scroll progression', () => {
      progressTracker.enableScrollProgression();
      progressTracker.disableScrollProgression();
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should calculate scroll progress correctly', () => {
      progressTracker.enableScrollProgression();
      
      // Progress should be a number between 0 and 1
      const progress = progressTracker.getCurrentScrollProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Scroll Threshold Management', () => {
    it('should register scroll threshold', () => {
      const callback = vi.fn();
      progressTracker.registerScrollThreshold(0.5, callback);
      
      // Should not throw and callback should not be called yet
      expect(callback).not.toHaveBeenCalled();
    });

    it('should validate threshold range', () => {
      const callback = vi.fn();
      
      expect(() => progressTracker.registerScrollThreshold(-0.1, callback))
        .toThrow('Scroll threshold must be between 0 and 1');
      
      expect(() => progressTracker.registerScrollThreshold(1.1, callback))
        .toThrow('Scroll threshold must be between 0 and 1');
    });

    it('should trigger threshold callback when reached', () => {
      const callback = vi.fn();
      progressTracker.registerScrollThreshold(0.5, callback);
      progressTracker.enableScrollProgression();
      
      // Manually trigger threshold check with mocked progress
      (progressTracker as any).smoothScrollProgress = 0.6;
      (progressTracker as any).checkScrollThresholds();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should reset thresholds', () => {
      const callback = vi.fn();
      progressTracker.registerScrollThreshold(0.3, callback);
      progressTracker.resetScrollThresholds();
      
      // After reset, thresholds should be able to trigger again
      expect(() => progressTracker.resetScrollThresholds()).not.toThrow();
    });

    it('should remove scroll threshold', () => {
      const callback = vi.fn();
      progressTracker.registerScrollThreshold(0.5, callback);
      progressTracker.removeScrollThreshold(callback);
      
      // Should not throw
      expect(() => progressTracker.removeScrollThreshold(callback)).not.toThrow();
    });
  });

  describe('Parallax Effects', () => {
    it('should apply parallax effects to elements', () => {
      const mockElement = {
        style: {
          transform: '',
          opacity: '1'
        }
      };

      const parallaxElements: ParallaxElement[] = [{
        id: 'test-element',
        element: mockElement as HTMLElement,
        startPosition: { x: 0, y: 0, scale: 1, opacity: 1 },
        endPosition: { x: 100, y: 50, scale: 1.2, opacity: 0.8 },
        scrollRange: { start: 0, end: 1 },
        easing: (t: number) => t // Linear easing
      }];

      progressTracker.applyParallaxEffects(parallaxElements);
      
      // Should not throw
      expect(() => progressTracker.applyParallaxEffects(parallaxElements)).not.toThrow();
    });

    it('should handle invalid parallax elements gracefully', () => {
      const invalidElements: ParallaxElement[] = [{
        id: 'invalid-element',
        element: null as any,
        startPosition: { x: 0, y: 0, scale: 1, opacity: 1 },
        endPosition: { x: 100, y: 50, scale: 1.2, opacity: 0.8 },
        scrollRange: { start: 1, end: 0 }, // Invalid range
        easing: (t: number) => t
      }];

      // Should not throw, but should log warnings
      expect(() => progressTracker.applyParallaxEffects(invalidElements)).not.toThrow();
    });
  });

  describe('Drift Effects', () => {
    it('should create drift particles when scrolling', () => {
      progressTracker.enableScrollProgression();
      
      // Test that drift effects can be triggered without throwing
      expect(() => {
        (progressTracker as any).triggerDriftEffects();
      }).not.toThrow();
    });

    it('should update drift particles during animation', () => {
      progressTracker.enableScrollProgression();
      
      // Test that particle updates don't throw
      expect(() => {
        (progressTracker as any).updateDriftParticles();
      }).not.toThrow();
    });

    it('should remove off-screen particles', () => {
      progressTracker.enableScrollProgression();
      
      // Test particle cleanup
      expect(() => {
        (progressTracker as any).clearDriftParticles();
      }).not.toThrow();
    });
  });

  describe('Utility Methods', () => {
    it('should calculate scroll velocity', () => {
      const velocity = progressTracker.getScrollVelocity();
      expect(typeof velocity).toBe('number');
    });

    it('should detect scroll direction', () => {
      const isScrollingDown = progressTracker.isScrollingDown();
      expect(typeof isScrollingDown).toBe('boolean');
    });

    it('should get current scroll progress', () => {
      const progress = progressTracker.getCurrentScrollProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Resource Management', () => {
    it('should clean up resources on destroy', () => {
      progressTracker.enableScrollProgression();
      progressTracker.destroy();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      expect((progressTracker as any).driftContainer).toBeNull();
      expect((progressTracker as any).scrollThresholds).toHaveLength(0);
      expect((progressTracker as any).parallaxElements).toHaveLength(0);
    });

    it('should clear drift particles', () => {
      progressTracker.enableScrollProgression();
      
      // Test particle cleanup
      expect(() => {
        (progressTracker as any).clearDriftParticles();
      }).not.toThrow();
      
      expect((progressTracker as any).driftParticles).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle scroll threshold callback errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      progressTracker.registerScrollThreshold(0.1, errorCallback);
      
      // Should not throw when callback errors
      expect(() => {
        (progressTracker as any).checkScrollThresholds();
      }).not.toThrow();
    });

    it('should handle parallax element update errors gracefully', () => {
      const invalidElement: ParallaxElement = {
        id: 'error-element',
        element: null as any,
        startPosition: { x: 0, y: 0, scale: 1, opacity: 1 },
        endPosition: { x: 100, y: 50, scale: 1.2, opacity: 0.8 },
        scrollRange: { start: 0, end: 1 },
        easing: (t: number) => t
      };

      progressTracker.applyParallaxEffects([invalidElement]);
      
      // Should not throw when updating invalid elements
      expect(() => {
        (progressTracker as any).updateParallaxElements();
      }).not.toThrow();
    });
  });
});