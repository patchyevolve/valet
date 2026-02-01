/**
 * Unit tests for Decision Handler Component
 * Tests Requirements 8.1, 8.2, 8.3, 8.4 - Decision handling with emotional safety
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DecisionHandler } from './decision-handler.js';
import { DecisionOption } from './types/components.js';

describe('DecisionHandler', () => {
  let decisionHandler: DecisionHandler;
  let container: HTMLElement;
  let mockYesCallback: () => Promise<void>;
  let mockGentleExitCallback: () => Promise<void>;

  beforeEach(() => {
    // Create test container
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Initialize decision handler
    decisionHandler = new DecisionHandler(container);
    
    // Create mock callbacks
    mockYesCallback = vi.fn().mockResolvedValue(undefined);
    mockGentleExitCallback = vi.fn().mockResolvedValue(undefined);
    
    decisionHandler.setYesCallback(mockYesCallback);
    decisionHandler.setGentleExitCallback(mockGentleExitCallback);
  });

  afterEach(() => {
    decisionHandler.dispose();
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('presentChoices', () => {
    it('should display exactly one CTA button as per Requirement 8.1', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes, I feel the same way',
          action: mockYesCallback,
          emotionalSafety: true
        },
        {
          id: 'gentle-exit',
          text: 'I need some time to think',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);

      const ctaButtons = container.querySelectorAll('.cta-button');
      expect(ctaButtons).toHaveLength(1);
      expect(ctaButtons[0].textContent).toBe('Yes, I feel the same way');
    });

    it('should provide Gentle Exit option as per Requirement 8.3', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes, I feel the same way',
          action: mockYesCallback,
          emotionalSafety: true
        },
        {
          id: 'gentle-exit',
          text: 'I need some time to think',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);

      const gentleExitElement = container.querySelector('.gentle-exit-link');
      expect(gentleExitElement).toBeTruthy();
      expect(gentleExitElement?.textContent).toBe('I need some time to think');
    });

    it('should include supportive messaging without pressure as per Requirement 8.4', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        },
        {
          id: 'gentle-exit',
          text: 'Not right now',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);

      const supportMessage = container.querySelector('.support-message');
      expect(supportMessage).toBeTruthy();
      expect(supportMessage?.textContent).toContain('Take your time');
      expect(supportMessage?.textContent).toContain('no pressure');
    });

    it('should set proper accessibility attributes', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        },
        {
          id: 'gentle-exit',
          text: 'Not right now',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);

      const decisionContainer = container.querySelector('.decision-container');
      expect(decisionContainer?.getAttribute('role')).toBe('region');
      expect(decisionContainer?.getAttribute('aria-label')).toBe('Decision options');

      const ctaButton = container.querySelector('.cta-button');
      expect(ctaButton?.getAttribute('aria-label')).toContain('Continue to confirmation');

      const gentleExitLink = container.querySelector('.gentle-exit-link');
      expect(gentleExitLink?.getAttribute('aria-label')).toContain('Exit gracefully');
    });

    it('should clear previous choices when presenting new ones', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      // Present choices twice
      decisionHandler.presentChoices(options);
      decisionHandler.presentChoices(options);

      // Should only have one decision container
      const decisionContainers = container.querySelectorAll('.decision-container');
      expect(decisionContainers).toHaveLength(1);
    });
  });

  describe('handleYesPath', () => {
    it('should call yes callback and clear choices as per Requirement 8.2', async () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      expect(decisionHandler.isChoicesPresented()).toBe(true);

      await decisionHandler.handleYesPath();

      expect(mockYesCallback).toHaveBeenCalledOnce();
      expect(decisionHandler.isChoicesPresented()).toBe(false);
    });

    it('should handle callback errors gracefully', async () => {
      const errorCallback = vi.fn().mockRejectedValue(new Error('Test error'));
      decisionHandler.setYesCallback(errorCallback);

      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: errorCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);

      // Should not throw error
      await expect(decisionHandler.handleYesPath()).resolves.toBeUndefined();
      expect(errorCallback).toHaveBeenCalledOnce();
    });
  });

  describe('handleGentleExit', () => {
    it('should call gentle exit callback and clear choices as per Requirement 8.3', async () => {
      const options: DecisionOption[] = [
        {
          id: 'gentle-exit',
          text: 'Not right now',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      expect(decisionHandler.isChoicesPresented()).toBe(true);

      await decisionHandler.handleGentleExit();

      expect(mockGentleExitCallback).toHaveBeenCalledOnce();
      expect(decisionHandler.isChoicesPresented()).toBe(false);
    });

    it('should handle callback errors gracefully', async () => {
      const errorCallback = vi.fn().mockRejectedValue(new Error('Test error'));
      decisionHandler.setGentleExitCallback(errorCallback);

      const options: DecisionOption[] = [
        {
          id: 'gentle-exit',
          text: 'Not right now',
          action: errorCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);

      // Should not throw error
      await expect(decisionHandler.handleGentleExit()).resolves.toBeUndefined();
      expect(errorCallback).toHaveBeenCalledOnce();
    });
  });

  describe('preserveEmotionalSafety', () => {
    it('should remove pressure tactics as per Requirement 8.4', () => {
      // Add a pressure tactic element
      const pressureElement = document.createElement('div');
      pressureElement.className = 'pressure-tactic';
      pressureElement.textContent = 'Limited time offer!';
      container.appendChild(pressureElement);

      expect(container.querySelector('.pressure-tactic')).toBeTruthy();

      decisionHandler.preserveEmotionalSafety();

      expect(container.querySelector('.pressure-tactic')).toBeFalsy();
    });

    it('should add supportive messaging if not present', () => {
      expect(container.querySelector('.support-message')).toBeFalsy();

      decisionHandler.preserveEmotionalSafety();

      const supportMessage = container.querySelector('.support-message');
      expect(supportMessage).toBeTruthy();
      expect(supportMessage?.textContent).toContain('Your feelings are valid');
    });

    it('should not duplicate support messages', () => {
      decisionHandler.preserveEmotionalSafety();
      decisionHandler.preserveEmotionalSafety();

      const supportMessages = container.querySelectorAll('.support-message');
      expect(supportMessages).toHaveLength(1);
    });
  });

  describe('avoidPressureTactics', () => {
    it('should return true when no pressure tactics are present as per Requirement 8.4', () => {
      container.textContent = 'Take your time to decide. No pressure here.';
      
      const result = decisionHandler.avoidPressureTactics();
      
      expect(result).toBe(true);
    });

    it('should return false when pressure tactics are detected', () => {
      container.textContent = 'Limited time offer! Act now or miss out!';
      
      const result = decisionHandler.avoidPressureTactics();
      
      expect(result).toBe(false);
    });

    it('should detect various pressure indicators', () => {
      const pressureTexts = [
        'limited time',
        'act now',
        'don\'t miss out',
        'hurry up',
        'urgent decision',
        'last chance'
      ];

      pressureTexts.forEach(pressureText => {
        container.textContent = `This is a ${pressureText} situation.`;
        expect(decisionHandler.avoidPressureTactics()).toBe(false);
      });
    });
  });

  describe('button interactions', () => {
    it('should handle CTA button click', async () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      
      const ctaButton = container.querySelector('.cta-button') as HTMLButtonElement;
      expect(ctaButton).toBeTruthy();

      // Simulate click
      ctaButton.click();
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockYesCallback).toHaveBeenCalledOnce();
    });

    it('should handle gentle exit link click', async () => {
      const options: DecisionOption[] = [
        {
          id: 'gentle-exit',
          text: 'Not right now',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      
      const gentleExitLink = container.querySelector('.gentle-exit-link') as HTMLButtonElement;
      expect(gentleExitLink).toBeTruthy();

      // Simulate click
      gentleExitLink.click();
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockGentleExitCallback).toHaveBeenCalledOnce();
    });

    it('should disable button during action execution', async () => {
      let resolveCallback: () => void;
      const slowCallback = vi.fn().mockImplementation(() => {
        return new Promise<void>(resolve => {
          resolveCallback = resolve;
        });
      });

      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: slowCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      
      const ctaButton = container.querySelector('.cta-button') as HTMLButtonElement;
      
      // Click button
      ctaButton.click();
      
      // Button should be disabled
      expect(ctaButton.disabled).toBe(true);
      expect(ctaButton.style.opacity).toBe('0.7');
      
      // Resolve the callback
      resolveCallback!();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('component lifecycle', () => {
    it('should track presentation status correctly', () => {
      expect(decisionHandler.isChoicesPresented()).toBe(false);

      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      expect(decisionHandler.isChoicesPresented()).toBe(true);

      decisionHandler.dispose();
      expect(decisionHandler.isChoicesPresented()).toBe(false);
    });

    it('should clean up properly on dispose', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      expect(container.querySelector('.decision-container')).toBeTruthy();

      decisionHandler.dispose();
      
      expect(container.querySelector('.decision-container')).toBeFalsy();
      expect(decisionHandler.isChoicesPresented()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty options array', () => {
      decisionHandler.presentChoices([]);
      
      const decisionContainer = container.querySelector('.decision-container');
      expect(decisionContainer).toBeTruthy();
      
      const ctaButton = container.querySelector('.cta-button');
      const gentleExitLink = container.querySelector('.gentle-exit-link');
      
      expect(ctaButton).toBeFalsy();
      expect(gentleExitLink).toBeFalsy();
    });

    it('should handle missing yes option', () => {
      const options: DecisionOption[] = [
        {
          id: 'gentle-exit',
          text: 'Not right now',
          action: mockGentleExitCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      
      const ctaButton = container.querySelector('.cta-button');
      const gentleExitLink = container.querySelector('.gentle-exit-link');
      
      expect(ctaButton).toBeFalsy();
      expect(gentleExitLink).toBeTruthy();
    });

    it('should handle missing gentle exit option', () => {
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      decisionHandler.presentChoices(options);
      
      const ctaButton = container.querySelector('.cta-button');
      const gentleExitLink = container.querySelector('.gentle-exit-link');
      
      expect(ctaButton).toBeTruthy();
      expect(gentleExitLink).toBeFalsy();
    });

    it('should work with default container when none provided', () => {
      const defaultHandler = new DecisionHandler();
      
      const options: DecisionOption[] = [
        {
          id: 'yes',
          text: 'Yes',
          action: mockYesCallback,
          emotionalSafety: true
        }
      ];

      defaultHandler.presentChoices(options);
      
      const decisionContainer = document.body.querySelector('.decision-container');
      expect(decisionContainer).toBeTruthy();
      
      defaultHandler.dispose();
    });
  });
});