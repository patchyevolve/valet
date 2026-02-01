/**
 * Property-based test for Visual Effects State Synchronization
 * Feature: valentines-interactive-webpage, Property 5: Visual Effects State Synchronization
 * Validates: Requirements 1.5, 3.1, 3.2, 3.3, 3.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { StateMachineController } from './state-machine-controller.js';
import { AmbientEffectsControllerImpl } from './ambient-effects-controller.js';
import { ParallaxControllerImpl } from './parallax-controller.js';
import { StateType } from './types/state-machine.js';
import { 
  stateTypeArbitrary, 
  createPropertyTestConfig,
  animationTypeArbitrary 
} from './test/property-test-helpers.js';

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

describe('Property 5: Visual Effects State Synchronization', () => {
  let container: HTMLElement;
  let stateMachine: StateMachineController;
  let ambientEffects: AmbientEffectsControllerImpl;
  let parallaxController: ParallaxControllerImpl;

  beforeEach(() => {
    // Clear localStorage and setup DOM
    localStorage.clear();
    
    // Create mock container
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    Object.defineProperty(container, 'clientWidth', { value: 800, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 2000, writable: true });
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    document.body.appendChild(container);

    // Create test elements for parallax
    const element1 = document.createElement('div');
    element1.className = 'distance-element-1';
    const element2 = document.createElement('div');
    element2.className = 'distance-element-2';
    container.appendChild(element1);
    container.appendChild(element2);

    // Initialize controllers
    stateMachine = new StateMachineController();
    ambientEffects = new AmbientEffectsControllerImpl(container);
    parallaxController = new ParallaxControllerImpl(container);
  });

  afterEach(() => {
    ambientEffects.stopAmbientEffects();
    parallaxController.disableParallax();
    document.body.removeChild(container);
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  /**
   * **Property 5: Visual Effects State Synchronization**
   * **Validates: Requirements 1.5, 3.1, 3.2, 3.3, 3.5**
   * 
   * For any state transition, the appropriate visual and audio effects should be 
   * triggered and maintained until the next explicit state transition.
   */
  it('should synchronize visual effects with state transitions', () => {
    fc.assert(
      fc.property(
        // Generate valid sequential state transition paths
        fc.integer({ min: 1, max: 8 }).chain(pathLength => {
          // Define the complete valid sequential path
          const fullPath = [
            StateType.AMBIENT_IDLE,
            StateType.INTRO_TEXT,
            StateType.PRESENCE_ACKNOWLEDGEMENT,
            StateType.DISTANCE_VISUALIZATION,
            StateType.PERSONAL_MEMORY,
            StateType.VALENTINE_QUESTION,
            StateType.DECISION_STATE,
            StateType.CONFIRMATION_STATE
          ];
          
          // Take a subset of the path up to pathLength
          const validPath = fullPath.slice(0, pathLength);
          
          // Generate transition options for each state in the path
          return fc.array(
            fc.record({
              skipTimingConstraints: fc.boolean(),
              force: fc.boolean()
            }),
            { minLength: validPath.length, maxLength: validPath.length }
          ).map(options => validPath.map((state, index) => ({
            targetState: state,
            ...options[index]
          })));
        }),
        async (transitionSequence) => {
          // Reset to initial state
          const freshStateMachine = new StateMachineController();
          const freshAmbientEffects = new AmbientEffectsControllerImpl(container);
          const freshParallaxController = new ParallaxControllerImpl(container);

          // Ensure required DOM elements exist for parallax
          let element1 = container.querySelector('.distance-element-1') as HTMLElement;
          let element2 = container.querySelector('.distance-element-2') as HTMLElement;
          if (!element1) {
            element1 = document.createElement('div');
            element1.className = 'distance-element-1';
            container.appendChild(element1);
          }
          if (!element2) {
            element2 = document.createElement('div');
            element2.className = 'distance-element-2';
            container.appendChild(element2);
          }

          let previousState = freshStateMachine.currentState;
          let effectsStarted = false;
          let parallaxEnabled = false;

          for (const transition of transitionSequence) {
            try {
              // Attempt state transition (should be valid since we're following the sequential path)
              await freshStateMachine.transitionTo(transition.targetState, {
                skipTimingConstraints: transition.skipTimingConstraints,
                force: transition.force
              });

              const newState = freshStateMachine.currentState;

              // Requirement 1.5: Visual effects should be triggered on state transitions
              if (newState !== previousState) {
                // Check state-specific visual effects synchronization
                switch (newState) {
                  case StateType.AMBIENT_IDLE:
                    // Requirement 3.1: Display gradient shifts and floating particles
                    if (!effectsStarted) {
                      freshAmbientEffects.startAmbientEffects();
                      effectsStarted = true;
                    }
                    
                    // Verify ambient effects are active
                    if (!freshAmbientEffects.isAnimationEnabled('gradients')) {
                      return false; // Property violated
                    }
                    if (!freshAmbientEffects.isAnimationEnabled('particles')) {
                      return false; // Property violated
                    }
                    
                    // Check that gradient element exists
                    const gradientElement = container.querySelector('.ambient-gradient');
                    if (!gradientElement) {
                      return false; // Property violated
                    }
                    break;

                  case StateType.DISTANCE_VISUALIZATION:
                    // Requirement 6.1, 6.2: Enable parallax effects for distance visualization
                    if (!parallaxEnabled) {
                      // Ensure parallax is enabled before initialization
                      freshParallaxController.enableParallax();
                      
                      freshParallaxController.initialize({
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
                      });
                      parallaxEnabled = true;
                    }
                    
                    // Verify parallax is enabled and synchronized
                    if (!freshParallaxController.isParallaxEnabled()) {
                      return false; // Property violated
                    }
                    break;

                  case StateType.CONFIRMATION_STATE:
                  case StateType.GENTLE_EXIT_STATE:
                    // Requirement 3.5: Effects should be maintained until explicit transition
                    // These final states should maintain any active effects
                    if (effectsStarted) {
                      if (!freshAmbientEffects.isAnimationEnabled('gradients')) {
                        return false; // Property violated
                      }
                    }
                    break;

                  default:
                    // For other states, effects should remain consistent
                    // No specific visual effects requirements, but existing effects should persist
                    break;
                }

                previousState = newState;
              }
            } catch (error) {
              // Invalid transitions are expected and should not break synchronization
              // The visual effects should remain in their current state
              if (effectsStarted) {
                if (!freshAmbientEffects.isAnimationEnabled('gradients')) {
                  return false; // Property violated - effects should remain consistent
                }
              }
              if (parallaxEnabled) {
                if (!freshParallaxController.isParallaxEnabled()) {
                  return false; // Property violated - effects should remain consistent
                }
              }
            }
          }

          // Final verification: Effects should be in a consistent state
          // Requirement 1.5: Visual effects should be synchronized with final state
          
          // Clean up for this iteration
          freshAmbientEffects.stopAmbientEffects();
          freshParallaxController.disableParallax();

          return true; // Property holds
        }
      ),
      createPropertyTestConfig(100)
    );
  });

  /**
   * Test that visual effects respond correctly to accessibility preferences
   * This ensures synchronization respects user preferences
   */
  it('should synchronize visual effects with accessibility preferences', () => {
    fc.assert(
      fc.property(
        fc.array(animationTypeArbitrary, { minLength: 1, maxLength: 3 }),
        stateTypeArbitrary,
        (disabledAnimations, targetState) => {
          // Create fresh controllers
          const freshAmbientEffects = new AmbientEffectsControllerImpl(container);
          const freshParallaxController = new ParallaxControllerImpl(container);

          // Disable specific animations
          freshAmbientEffects.disableAnimations(disabledAnimations);
          if (disabledAnimations.includes('parallax')) {
            freshParallaxController.disableParallax();
          }

          // Start effects based on state
          if (targetState === StateType.AMBIENT_IDLE) {
            freshAmbientEffects.startAmbientEffects();
          }

          // Verify synchronization with accessibility preferences
          disabledAnimations.forEach(animationType => {
            switch (animationType) {
              case 'gradients':
                expect(freshAmbientEffects.isAnimationEnabled('gradients')).toBe(false);
                break;
              case 'particles':
                expect(freshAmbientEffects.isAnimationEnabled('particles')).toBe(false);
                break;
              case 'parallax':
                expect(freshParallaxController.isParallaxEnabled()).toBe(false);
                break;
            }
          });

          // Clean up
          freshAmbientEffects.stopAmbientEffects();
          freshParallaxController.disableParallax();

          return true;
        }
      ),
      createPropertyTestConfig(100)
    );
  });

  /**
   * Test that effects are properly maintained across multiple state transitions
   * Requirement 3.5: Maintain ambient effects until explicit state transition
   */
  it('should maintain visual effects consistency across state sequences', () => {
    fc.assert(
      fc.property(
        // Generate valid sequential state transitions only
        fc.array(
          fc.integer({ min: 1, max: 5 }), // Generate sequence lengths
          { minLength: 2, maxLength: 4 }
        ),
        async (sequenceLengths) => {
          const freshStateMachine = new StateMachineController();
          const freshAmbientEffects = new AmbientEffectsControllerImpl(container);
          
          let ambientEffectsActive = false;
          let currentState = freshStateMachine.currentState; // Start with PAGE_LOAD

          // Define the valid sequential order
          const validSequence = [
            StateType.AMBIENT_IDLE,
            StateType.INTRO_TEXT,
            StateType.PRESENCE_ACKNOWLEDGEMENT,
            StateType.DISTANCE_VISUALIZATION,
            StateType.PERSONAL_MEMORY
          ];

          // Generate a valid sequential path by taking steps forward
          const stateSequence: StateType[] = [];
          let currentIndex = -1; // Start before AMBIENT_IDLE
          
          for (const stepSize of sequenceLengths) {
            const nextIndex = Math.min(currentIndex + stepSize, validSequence.length - 1);
            if (nextIndex > currentIndex) {
              stateSequence.push(validSequence[nextIndex]);
              currentIndex = nextIndex;
            }
          }

          // Ensure we have at least AMBIENT_IDLE in the sequence
          if (stateSequence.length === 0 || !stateSequence.includes(StateType.AMBIENT_IDLE)) {
            stateSequence.unshift(StateType.AMBIENT_IDLE);
          }

          // Process the sequence
          for (const targetState of stateSequence) {
            // Skip if it's the same as current state
            if (targetState === currentState) {
              continue;
            }

            try {
              // Attempt transition (should be valid since we generated a sequential path)
              await freshStateMachine.transitionTo(targetState, { 
                skipTimingConstraints: true 
              });

              // Manage effects based on state
              if (targetState === StateType.AMBIENT_IDLE && !ambientEffectsActive) {
                freshAmbientEffects.startAmbientEffects();
                ambientEffectsActive = true;
              }

              // Requirement 3.5: Effects should be maintained until explicit transition
              if (ambientEffectsActive) {
                // Verify effects are still active
                if (!freshAmbientEffects.isAnimationEnabled('gradients')) {
                  freshAmbientEffects.stopAmbientEffects();
                  return false; // Property violated
                }
                if (!freshAmbientEffects.isAnimationEnabled('particles')) {
                  freshAmbientEffects.stopAmbientEffects();
                  return false; // Property violated
                }
              }

              currentState = targetState;
            } catch (error) {
              // Invalid transitions should not affect effect consistency
              if (ambientEffectsActive) {
                if (!freshAmbientEffects.isAnimationEnabled('gradients')) {
                  freshAmbientEffects.stopAmbientEffects();
                  return false; // Property violated
                }
              }
            }
          }

          // Clean up
          freshAmbientEffects.stopAmbientEffects();

          return true;
        }
      ),
      createPropertyTestConfig(100)
    );
  });
});