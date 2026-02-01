/**
 * Core state machine types and interfaces for Valentine's Day interactive webpage
 * Implements Requirements 1.1, 1.2 - State machine architecture with precise timing controls
 */

export enum StateType {
  PAGE_LOAD = 'page_load',
  AMBIENT_IDLE = 'ambient_idle',
  INTRO_TEXT = 'intro_text',
  PRESENCE_ACKNOWLEDGEMENT = 'presence_acknowledgement',
  DISTANCE_VISUALIZATION = 'distance_visualization',
  PERSONAL_MEMORY = 'personal_memory',
  VALENTINE_QUESTION = 'valentine_question',
  DECISION_STATE = 'decision_state',
  CONFIRMATION_STATE = 'confirmation_state',
  GENTLE_EXIT_STATE = 'gentle_exit_state'
}

export interface TransitionOptions {
  force?: boolean;
  skipTimingConstraints?: boolean;
  preserveUserAgency?: boolean;
}

export interface TimingConstraints {
  blockUserInteraction: boolean;
  enforceMinimumDuration: boolean;
  allowEarlyExit: boolean;
  temporalSpacing: number;
}

export interface StateConfig {
  name: StateType;
  minDuration?: number;
  maxDuration?: number;
  allowedTransitions: StateType[];
  requiredAssets?: string[];
  accessibilityAlternatives?: AccessibilityConfig;
  timingConstraints: TimingConstraints;
}

export interface AccessibilityConfig {
  reducedMotionAlternative?: string;
  screenReaderDescription?: string;
  keyboardNavigation?: boolean;
  alternativeControls?: boolean;
}

export type StateHandler = (state: StateType, options?: TransitionOptions) => Promise<void>;

export interface StateMachineController {
  currentState: StateType;
  transitionTo(newState: StateType, options?: TransitionOptions): Promise<void>;
  registerStateHandler(state: StateType, handler: StateHandler): void;
  enforceTimingConstraints(state: StateType, minDuration: number): void;
  preserveUserAgency(): boolean;
  validateTransitionSequence(sequence: StateType[]): boolean;
  getStateConfig(state: StateType): StateConfig;
  isValidTransition(from: StateType, to: StateType): boolean;
}