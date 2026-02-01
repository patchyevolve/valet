/**
 * StateMachineController implementation for Valentine's Day interactive webpage
 * Implements Requirements 1.1, 1.2, 1.3, 1.4 - State machine architecture with precise timing controls
 */

import { 
  StateType, 
  StateMachineController as IStateMachineController,
  TransitionOptions, 
  StateHandler, 
  StateConfig
} from './types/state-machine.js';

export class StateMachineController implements IStateMachineController {
  private _currentState: StateType = StateType.PAGE_LOAD;
  private stateHandlers: Map<StateType, StateHandler> = new Map();
  private stateConfigs: Map<StateType, StateConfig> = new Map();
  private transitionStartTime: number = 0;
  private persistenceKey = 'valentine-state-machine';
  
  constructor() {
    this.initializeStateConfigs();
    this.loadPersistedState();
    // Set initial transition time for PAGE_LOAD state
    this.transitionStartTime = Date.now();
  }

  get currentState(): StateType {
    return this._currentState;
  }

  /**
   * Requirement 1.1: Manage exactly 10 distinct states in sequential order
   * Requirement 1.2: Enforce precise timing controls for each transition
   */
  async transitionTo(newState: StateType, options: TransitionOptions = {}): Promise<void> {
    // Validate transition is allowed
    if (!options.force && !this.isValidTransition(this._currentState, newState)) {
      throw new Error(`Invalid transition from ${this._currentState} to ${newState}`);
    }

    const currentConfig = this.getStateConfig(this._currentState);
    
    // Requirement 1.3: Block user interaction until timing requirements are met
    if (!options.skipTimingConstraints && currentConfig.timingConstraints.enforceMinimumDuration) {
      const elapsedTime = Date.now() - this.transitionStartTime;
      const minDuration = currentConfig.minDuration || 0;
      
      if (elapsedTime < minDuration) {
        const remainingTime = minDuration - elapsedTime;
        await this.delay(remainingTime);
      }
    }

    // Preserve user agency check - only enforce if explicitly requested
    if (options.preserveUserAgency === true && !this.preserveUserAgency()) {
      throw new Error('Transition blocked to preserve user agency');
    }

    const previousState = this._currentState;
    this._currentState = newState;
    this.transitionStartTime = Date.now();

    // Requirement 1.4: Maintain state persistence
    this.persistState();

    // Execute state handler if registered
    const handler = this.stateHandlers.get(newState);
    if (handler) {
      try {
        await handler(newState, options);
      } catch (error) {
        // Rollback on handler failure
        this._currentState = previousState;
        this.persistState();
        throw error;
      }
    }
  }

  /**
   * Register handlers for state transitions
   */
  registerStateHandler(state: StateType, handler: StateHandler): void {
    this.stateHandlers.set(state, handler);
  }

  /**
   * Requirement 1.2: Enforce timing constraints for states
   */
  enforceTimingConstraints(state: StateType, minDuration: number): void {
    const config = this.getStateConfig(state);
    config.minDuration = minDuration;
    config.timingConstraints.enforceMinimumDuration = true;
    this.stateConfigs.set(state, config);
  }

  /**
   * Requirement 1.1: Preserve user agency throughout the journey
   */
  preserveUserAgency(): boolean {
    const currentConfig = this.getStateConfig(this._currentState);
    
    // Always allow gentle exit from decision states
    if (this._currentState === StateType.DECISION_STATE) {
      return true;
    }
    
    // Check if current state allows early exit
    return currentConfig.timingConstraints.allowEarlyExit;
  }

  /**
   * Validate state transition sequences for sequential integrity
   */
  validateTransitionSequence(sequence: StateType[]): boolean {
    if (sequence.length === 0) return false;
    
    for (let i = 0; i < sequence.length - 1; i++) {
      const currentState = sequence[i];
      const nextState = sequence[i + 1];
      
      if (!currentState || !nextState || !this.isValidTransition(currentState, nextState)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get configuration for a specific state
   */
  getStateConfig(state: StateType): StateConfig {
    const config = this.stateConfigs.get(state);
    if (!config) {
      throw new Error(`No configuration found for state: ${state}`);
    }
    return config;
  }

  /**
   * Check if transition from one state to another is valid
   */
  isValidTransition(from: StateType, to: StateType): boolean {
    const config = this.getStateConfig(from);
    return config.allowedTransitions.includes(to);
  }

  /**
   * Initialize state configurations with timing constraints and allowed transitions
   */
  private initializeStateConfigs(): void {
    // Define state configurations based on design document
    const configs: Array<[StateType, StateConfig]> = [
      [StateType.PAGE_LOAD, {
        name: StateType.PAGE_LOAD,
        minDuration: 1500, // 1.5 seconds as per requirement 2.1
        allowedTransitions: [StateType.AMBIENT_IDLE],
        requiredAssets: ['video', 'images'],
        timingConstraints: {
          blockUserInteraction: true,
          enforceMinimumDuration: true,
          allowEarlyExit: false,
          temporalSpacing: 1500
        }
      }],
      [StateType.AMBIENT_IDLE, {
        name: StateType.AMBIENT_IDLE,
        allowedTransitions: [StateType.INTRO_TEXT],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: false,
          allowEarlyExit: true,
          temporalSpacing: 0
        }
      }],
      [StateType.INTRO_TEXT, {
        name: StateType.INTRO_TEXT,
        allowedTransitions: [StateType.PRESENCE_ACKNOWLEDGEMENT],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: true,
          allowEarlyExit: false,
          temporalSpacing: 2000
        }
      }],
      [StateType.PRESENCE_ACKNOWLEDGEMENT, {
        name: StateType.PRESENCE_ACKNOWLEDGEMENT,
        allowedTransitions: [StateType.DISTANCE_VISUALIZATION],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: false,
          allowEarlyExit: true,
          temporalSpacing: 1000
        }
      }],
      [StateType.DISTANCE_VISUALIZATION, {
        name: StateType.DISTANCE_VISUALIZATION,
        allowedTransitions: [StateType.PERSONAL_MEMORY],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: false,
          allowEarlyExit: true,
          temporalSpacing: 1500
        }
      }],
      [StateType.PERSONAL_MEMORY, {
        name: StateType.PERSONAL_MEMORY,
        allowedTransitions: [StateType.VALENTINE_QUESTION],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: true,
          allowEarlyExit: false,
          temporalSpacing: 2500
        }
      }],
      [StateType.VALENTINE_QUESTION, {
        name: StateType.VALENTINE_QUESTION,
        allowedTransitions: [StateType.DECISION_STATE],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: false,
          allowEarlyExit: true,
          temporalSpacing: 1000
        }
      }],
      [StateType.DECISION_STATE, {
        name: StateType.DECISION_STATE,
        allowedTransitions: [StateType.CONFIRMATION_STATE, StateType.GENTLE_EXIT_STATE],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: false,
          allowEarlyExit: true,
          temporalSpacing: 0
        }
      }],
      [StateType.CONFIRMATION_STATE, {
        name: StateType.CONFIRMATION_STATE,
        minDuration: 8000, // 8 seconds for video playback
        allowedTransitions: [],
        requiredAssets: ['confirmation-video'],
        timingConstraints: {
          blockUserInteraction: true,
          enforceMinimumDuration: true,
          allowEarlyExit: false,
          temporalSpacing: 8000
        }
      }],
      [StateType.GENTLE_EXIT_STATE, {
        name: StateType.GENTLE_EXIT_STATE,
        allowedTransitions: [],
        timingConstraints: {
          blockUserInteraction: false,
          enforceMinimumDuration: false,
          allowEarlyExit: true,
          temporalSpacing: 0
        }
      }]
    ];

    configs.forEach(([state, config]) => {
      this.stateConfigs.set(state, config);
    });
  }

  /**
   * Requirement 1.4: Load persisted state without requiring hard reloads
   */
  private loadPersistedState(): void {
    try {
      const persistedData = localStorage.getItem(this.persistenceKey);
      if (persistedData) {
        const { state, timestamp } = JSON.parse(persistedData);
        
        // Only restore state if it's valid and recent (within 1 hour)
        const oneHour = 60 * 60 * 1000;
        if (Object.values(StateType).includes(state) && 
            Date.now() - timestamp < oneHour) {
          this._currentState = state;
          this.transitionStartTime = timestamp;
        }
      }
    } catch (error) {
      // Ignore persistence errors and start fresh
      console.warn('Failed to load persisted state:', error);
    }
  }

  /**
   * Requirement 1.4: Persist current state for recovery
   */
  private persistState(): void {
    try {
      const stateData = {
        state: this._currentState,
        timestamp: this.transitionStartTime
      };
      localStorage.setItem(this.persistenceKey, JSON.stringify(stateData));
    } catch (error) {
      // Ignore persistence errors
      console.warn('Failed to persist state:', error);
    }
  }

  /**
   * Utility method for timing delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}