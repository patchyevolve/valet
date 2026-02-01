/**
 * Tests for Accessibility Controller
 * Validates Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessibilityControllerImpl } from './accessibility-controller.js';
import { StateType } from './types/state-machine.js';
import { Content } from './types/components.js';

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AccessibilityController', () => {
  let controller: AccessibilityControllerImpl;
  let mockMediaQuery: { matches: boolean; addEventListener: vi.Mock };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock media query
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Clear DOM
    document.body.innerHTML = '';
    document.title = '';
    
    controller = new AccessibilityControllerImpl();
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  describe('Reduced Motion Detection (Requirement 9.1)', () => {
    it('should detect reduced motion preference from media query', () => {
      // Arrange
      mockMediaQuery.matches = true;
      mockMatchMedia.mockReturnValue(mockMediaQuery);
      
      // Act
      const result = controller.detectReducedMotionPreference();
      
      // Assert
      expect(result).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should fall back to localStorage when matchMedia is not available', () => {
      // Arrange
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });
      mockLocalStorage.getItem.mockReturnValue('true');
      
      // Create new controller after matchMedia is undefined
      const newController = new AccessibilityControllerImpl();
      
      // Act
      const result = newController.detectReducedMotionPreference();
      
      // Assert
      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('accessibility-reduced-motion');
      
      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });
    });

    it('should disable animations when reduced motion is preferred', () => {
      // Arrange
      const animationTypes = ['particles', 'parallax'];
      
      // Act
      controller.disableAnimations(animationTypes);
      
      // Assert
      expect(document.body.classList.contains('no-particles')).toBe(true);
      expect(document.body.classList.contains('no-parallax')).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'accessibility-disabled-animations',
        JSON.stringify(animationTypes)
      );
    });
  });

  describe('Alternative Content Presentation (Requirement 9.2)', () => {
    it('should provide alternative text descriptions for visual effects', () => {
      // Arrange
      const content: Content = {
        text: 'Welcome to Valentine\'s Day',
        media: 'video-romantic.mp4',
        interactive: false
      };
      
      // Act
      const alternative = controller.provideAlternativePresentation(content);
      
      // Assert
      expect(alternative.text).toBe(content.text);
      expect(alternative.description).toContain('romantic video');
      expect(alternative.description).toContain('synchronized text overlays');
    });

    it('should generate manual controls for interactive content', () => {
      // Arrange
      const content: Content = {
        text: 'Choose your response',
        interactive: true
      };
      
      // Act
      const alternative = controller.provideAlternativePresentation(content);
      
      // Assert
      expect(alternative.controls).toContain('Continue');
      expect(alternative.controls).toContain('Go Back');
      expect(alternative.controls).toContain('Exit Gently');
    });

    it('should generate video controls for media content', () => {
      // Arrange
      const content: Content = {
        text: 'Video content',
        media: 'video-romantic.mp4',
        interactive: true
      };
      
      // Act
      const alternative = controller.provideAlternativePresentation(content);
      
      // Assert
      expect(alternative.controls).toContain('Play Video');
      expect(alternative.controls).toContain('Pause Video');
      expect(alternative.controls).toContain('Skip Video');
    });
  });

  describe('Autoplay Preferences (Requirement 9.2)', () => {
    it('should respect autoplay preferences and create manual controls', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue('true');
      
      // Act
      controller.respectAutoplayPreferences();
      
      // Assert
      const controls = document.querySelector('.manual-video-controls');
      expect(controls).toBeTruthy();
      expect(controls?.getAttribute('role')).toBe('group');
      expect(controls?.getAttribute('aria-label')).toBe('Video controls');
    });

    it('should show and hide manual video controls', () => {
      // Arrange - Set autoplay disabled to create controls
      controller.setAccessibilityPreference('autoplay', false);
      
      // Act & Assert - Show controls
      controller.showManualVideoControls();
      const controls = document.querySelector('.manual-video-controls') as HTMLElement;
      expect(controls?.style.display).toBe('block');
      
      // Act & Assert - Hide controls
      controller.hideManualVideoControls();
      expect(controls?.style.display).toBe('none');
    });
  });

  describe('State Change Announcements (Requirement 9.4)', () => {
    it('should announce state changes to screen readers', () => {
      // Act
      controller.announceStateChanges(StateType.AMBIENT_IDLE);
      
      // Assert
      const announceElement = document.querySelector('[aria-live="polite"]');
      expect(announceElement).toBeTruthy();
      expect(announceElement?.textContent).toContain('Welcome to a gentle Valentine\'s experience');
      expect(document.title).toContain('Ambient Idle');
    });

    it('should handle all state types with appropriate descriptions', () => {
      // Test a few key states
      const testStates = [
        StateType.PAGE_LOAD,
        StateType.VALENTINE_QUESTION,
        StateType.GENTLE_EXIT_STATE
      ];
      
      testStates.forEach(state => {
        // Act
        controller.announceStateChanges(state);
        
        // Assert
        const announceElement = document.querySelector('[aria-live="polite"]');
        expect(announceElement?.textContent).toBeTruthy();
        // Check that the title contains the formatted state name
        const formattedState = state.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        expect(document.title).toContain(formattedState);
      });
    });
  });

  describe('Accessibility Settings Management', () => {
    it('should get current accessibility settings', () => {
      // Act
      const settings = controller.getAccessibilitySettings();
      
      // Assert
      expect(settings).toHaveProperty('reducedMotion');
      expect(settings).toHaveProperty('autoplayDisabled');
      expect(settings).toHaveProperty('screenReaderEnabled');
      expect(settings).toHaveProperty('highContrast');
    });

    it('should set reduced motion preference', () => {
      // Act
      controller.setAccessibilityPreference('reducedMotion', true);
      
      // Assert
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessibility-reduced-motion', 'true');
      expect(document.body.classList.contains('no-particles')).toBe(true);
    });

    it('should set autoplay preference', () => {
      // Act
      controller.setAccessibilityPreference('autoplay', false);
      
      // Assert
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessibility-autoplay-disabled', 'true');
      const controls = document.querySelector('.manual-video-controls');
      expect(controls).toBeTruthy();
    });

    it('should set high contrast preference', () => {
      // Act
      controller.setAccessibilityPreference('highContrast', true);
      
      // Assert
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessibility-high-contrast', 'true');
      expect(document.body.classList.contains('high-contrast')).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle escape key for gentle exit', () => {
      // Arrange
      const eventSpy = vi.fn();
      document.addEventListener('gentle-exit-requested', eventSpy);
      
      // Act
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      // Assert
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle space bar for video control when autoplay is disabled', () => {
      // Arrange
      controller.setAccessibilityPreference('autoplay', false);
      const eventSpy = vi.fn();
      document.addEventListener('manual-video-play-requested', eventSpy);
      
      // Act
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(spaceEvent);
      
      // Assert
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Media Query Listeners', () => {
    it('should set up media query listeners for dynamic changes', () => {
      // The constructor already calls setupMediaQueryListeners
      // Assert that matchMedia was called during initialization
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should respond to reduced motion preference changes', () => {
      // Arrange - Get the change handler that was registered
      const calls = mockMediaQuery.addEventListener.mock.calls;
      const changeCall = calls.find(call => call[0] === 'change');
      expect(changeCall).toBeDefined();
      
      const changeHandler = changeCall![1];
      
      // Act
      changeHandler({ matches: true });
      
      // Assert
      expect(document.body.classList.contains('no-particles')).toBe(true);
      expect(document.body.classList.contains('no-parallax')).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing matchMedia gracefully', () => {
      // Arrange
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });
      
      // Act & Assert - Should not throw
      expect(() => {
        const newController = new AccessibilityControllerImpl();
        newController.detectReducedMotionPreference();
      }).not.toThrow();
      
      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });
    });

    it('should handle empty animation types array', () => {
      // Act & Assert - Should not throw
      expect(() => {
        controller.disableAnimations([]);
      }).not.toThrow();
    });

    it('should handle content without media or interactive properties', () => {
      // Arrange
      const content: Content = {
        text: 'Simple text content'
      };
      
      // Act
      const alternative = controller.provideAlternativePresentation(content);
      
      // Assert
      expect(alternative.text).toBe(content.text);
      expect(alternative.description).toBe(content.text);
      expect(alternative.controls).toEqual([]);
    });
  });
});