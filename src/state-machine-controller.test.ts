/**
 * Unit tests for StateMachineController implementation
 * Tests specific examples and edge cases for state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateMachineController } from './state-machine-controller.js';
import { StateType } from './types/state-machine.js';

describe('StateMachineController', () => {
  let controller: StateMachineController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    controller = new StateMachineController();
  });

  describe('Initialization', () => {
    it('should initialize with PAGE_LOAD state', () => {
      expect(controller.currentState).toBe(StateType.PAGE_LOAD);
    });

    it('should load state configurations for all 10 states', () => {
      const allStates = Object.values(StateType);
      expect(allStates).toHaveLength(10);
      
      // Verify each state has a configuration
      allStates.forEach(state => {
        expect(() => controller.getStateConfig(state)).not.toThrow();
      });
    });
  });

  describe('State Transitions', () => {
    it('should allow valid transitions', async () => {
      expect(controller.currentState).toBe(StateType.PAGE_LOAD);
      
      await controller.transitionTo(StateType.AMBIENT_IDLE);
      expect(controller.currentState).toBe(StateType.AMBIENT_IDLE);
    });

    it('should reject invalid transitions', async () => {
      expect(controller.currentState).toBe(StateType.PAGE_LOAD);
      
      await expect(
        controller.transitionTo(StateType.CONFIRMATION_STATE)
      ).rejects.toThrow('Invalid transition');
    });

    it('should allow forced transitions', async () => {
      expect(controller.currentState).toBe(StateType.PAGE_LOAD);
      
      // This should normally be invalid, but force should allow it
      await controller.transitionTo(StateType.CONFIRMATION_STATE, { force: true });
      expect(controller.currentState).toBe(StateType.CONFIRMATION_STATE);
    });

    it('should handle both decision paths', async () => {
      // Test confirmation path
      const controller2 = new StateMachineController();
      await controller2.transitionTo(StateType.DECISION_STATE, { 
        force: true, 
        skipTimingConstraints: true 
      });
      await controller2.transitionTo(StateType.CONFIRMATION_STATE, { 
        skipTimingConstraints: true 
      });
      expect(controller2.currentState).toBe(StateType.CONFIRMATION_STATE);
      
      // Test gentle exit path
      const controller3 = new StateMachineController();
      await controller3.transitionTo(StateType.DECISION_STATE, { 
        force: true, 
        skipTimingConstraints: true 
      });
      await controller3.transitionTo(StateType.GENTLE_EXIT_STATE);
      expect(controller3.currentState).toBe(StateType.GENTLE_EXIT_STATE);
    });
  });

  describe('Timing Constraints', () => {
    it('should enforce minimum duration for PAGE_LOAD state', async () => {
      // Create a fresh controller to ensure timing starts from transition
      const freshController = new StateMachineController();
      const startTime = Date.now();
      
      // PAGE_LOAD should have 1.5 second minimum duration
      await freshController.transitionTo(StateType.AMBIENT_IDLE);
      
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(1500);
    });

    it('should skip timing constraints when requested', async () => {
      const startTime = Date.now();
      
      // Skip timing constraints
      await controller.transitionTo(StateType.AMBIENT_IDLE, { 
        skipTimingConstraints: true 
      });
      
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeLessThan(100); // Should be nearly instant
    });

    it('should allow custom timing constraint enforcement', () => {
      controller.enforceTimingConstraints(StateType.AMBIENT_IDLE, 2000);
      
      const config = controller.getStateConfig(StateType.AMBIENT_IDLE);
      expect(config.minDuration).toBe(2000);
      expect(config.timingConstraints.enforceMinimumDuration).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should persist state to localStorage', async () => {
      await controller.transitionTo(StateType.AMBIENT_IDLE, { 
        skipTimingConstraints: true 
      });
      
      const persistedData = localStorage.getItem('valentine-state-machine');
      expect(persistedData).toBeTruthy();
      
      const parsed = JSON.parse(persistedData!);
      expect(parsed.state).toBe(StateType.AMBIENT_IDLE);
    });

    it('should restore persisted state on initialization', async () => {
      // Set up persisted state
      const stateData = {
        state: StateType.INTRO_TEXT,
        timestamp: Date.now()
      };
      localStorage.setItem('valentine-state-machine', JSON.stringify(stateData));
      
      // Create new controller - should restore state
      const newController = new StateMachineController();
      expect(newController.currentState).toBe(StateType.INTRO_TEXT);
    });

    it('should ignore old persisted state', () => {
      // Set up old persisted state (2 hours ago)
      const stateData = {
        state: StateType.INTRO_TEXT,
        timestamp: Date.now() - (2 * 60 * 60 * 1000)
      };
      localStorage.setItem('valentine-state-machine', JSON.stringify(stateData));
      
      // Create new controller - should start fresh
      const newController = new StateMachineController();
      expect(newController.currentState).toBe(StateType.PAGE_LOAD);
    });
  });

  describe('State Validation', () => {
    it('should validate complete valid sequences', () => {
      const validSequence = [
        StateType.PAGE_LOAD,
        StateType.AMBIENT_IDLE,
        StateType.INTRO_TEXT,
        StateType.PRESENCE_ACKNOWLEDGEMENT,
        StateType.DISTANCE_VISUALIZATION,
        StateType.PERSONAL_MEMORY,
        StateType.VALENTINE_QUESTION,
        StateType.DECISION_STATE,
        StateType.CONFIRMATION_STATE
      ];
      
      expect(controller.validateTransitionSequence(validSequence)).toBe(true);
    });

    it('should reject invalid sequences', () => {
      const invalidSequence = [
        StateType.PAGE_LOAD,
        StateType.CONFIRMATION_STATE // Invalid jump
      ];
      
      expect(controller.validateTransitionSequence(invalidSequence)).toBe(false);
    });

    it('should validate individual transitions', () => {
      expect(controller.isValidTransition(
        StateType.PAGE_LOAD, 
        StateType.AMBIENT_IDLE
      )).toBe(true);
      
      expect(controller.isValidTransition(
        StateType.PAGE_LOAD, 
        StateType.CONFIRMATION_STATE
      )).toBe(false);
    });
  });

  describe('User Agency Preservation', () => {
    it('should preserve user agency in decision state', async () => {
      await controller.transitionTo(StateType.DECISION_STATE, { 
        force: true, 
        skipTimingConstraints: true 
      });
      expect(controller.preserveUserAgency()).toBe(true);
    });

    it('should respect early exit allowance', async () => {
      await controller.transitionTo(StateType.AMBIENT_IDLE, { 
        force: true, 
        skipTimingConstraints: true 
      });
      
      const config = controller.getStateConfig(StateType.AMBIENT_IDLE);
      expect(config.timingConstraints.allowEarlyExit).toBe(true);
      expect(controller.preserveUserAgency()).toBe(true);
    });
  });

  describe('State Handlers', () => {
    it('should register and execute state handlers', async () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined);
      
      controller.registerStateHandler(StateType.AMBIENT_IDLE, mockHandler);
      
      await controller.transitionTo(StateType.AMBIENT_IDLE, { 
        skipTimingConstraints: true 
      });
      
      expect(mockHandler).toHaveBeenCalledWith(
        StateType.AMBIENT_IDLE, 
        { skipTimingConstraints: true }
      );
    });

    it('should rollback on handler failure', async () => {
      const failingHandler = vi.fn().mockRejectedValue(new Error('Handler failed'));
      
      controller.registerStateHandler(StateType.AMBIENT_IDLE, failingHandler);
      
      await expect(
        controller.transitionTo(StateType.AMBIENT_IDLE, { 
          skipTimingConstraints: true 
        })
      ).rejects.toThrow('Handler failed');
      
      // Should rollback to previous state
      expect(controller.currentState).toBe(StateType.PAGE_LOAD);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      // Should not throw when persisting fails
      expect(async () => {
        await controller.transitionTo(StateType.AMBIENT_IDLE, { 
          skipTimingConstraints: true 
        });
      }).not.toThrow();
      
      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });

    it('should handle invalid persisted data gracefully', () => {
      localStorage.setItem('valentine-state-machine', 'invalid json');
      
      // Should not throw and should start with default state
      const newController = new StateMachineController();
      expect(newController.currentState).toBe(StateType.PAGE_LOAD);
    });
  });
});