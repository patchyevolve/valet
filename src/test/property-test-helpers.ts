/**
 * Property-based testing helpers and generators for Valentine's Day interactive webpage
 * Provides fast-check generators for testing state machine and component properties
 */

import * as fc from 'fast-check';
import { StateType } from '../types/state-machine.js';

// State Machine Generators
export const stateTypeArbitrary = fc.constantFrom(...Object.values(StateType));

export const validStateSequenceArbitrary = fc.array(stateTypeArbitrary, { 
  minLength: 1, 
  maxLength: 10 
});

export const timingConstraintsArbitrary = fc.record({
  blockUserInteraction: fc.boolean(),
  enforceMinimumDuration: fc.boolean(),
  allowEarlyExit: fc.boolean(),
  temporalSpacing: fc.integer({ min: 0, max: 5000 })
});

export const transitionOptionsArbitrary = fc.record({
  force: fc.option(fc.boolean()),
  skipTimingConstraints: fc.option(fc.boolean()),
  preserveUserAgency: fc.option(fc.boolean())
});

// Asset and Content Generators
export const assetTypeArbitrary = fc.constantFrom('video', 'image', 'audio');
export const assetPriorityArbitrary = fc.constantFrom('critical', 'high', 'normal');

export const assetArbitrary = fc.record({
  url: fc.webUrl(),
  type: assetTypeArbitrary,
  priority: assetPriorityArbitrary,
  fallback: fc.option(fc.webUrl())
});

export const assetListArbitrary = fc.array(assetArbitrary, { 
  minLength: 1, 
  maxLength: 10 
});

// Text and Content Generators
export const textVariantArbitrary = fc.constantFrom('ultra-minimal', 'warm-controlled');

export const typingOptionsArbitrary = fc.record({
  speed: fc.integer({ min: 10, max: 200 }),
  pauseAfter: fc.integer({ min: 0, max: 3000 }),
  showCursor: fc.boolean(),
  fadeIn: fc.boolean()
});

export const textContentArbitrary = fc.string({ minLength: 1, maxLength: 500 });

// Video and Media Generators
export const overlayPositionArbitrary = fc.record({
  x: fc.integer({ min: 0, max: 100 }),
  y: fc.integer({ min: 0, max: 100 }),
  alignment: fc.constantFrom('left', 'center', 'right'),
  verticalAlignment: fc.constantFrom('top', 'middle', 'bottom')
});

export const textEventArbitrary = fc.record({
  timestamp: fc.integer({ min: 0, max: 8000 }),
  text: fc.string({ minLength: 1, maxLength: 100 }),
  duration: fc.integer({ min: 100, max: 2000 }),
  position: overlayPositionArbitrary
});

// Accessibility Generators
export const animationTypeArbitrary = fc.constantFrom(
  'particles', 'parallax', 'gradients', 'typing', 'fade'
);

export const animationTypesArbitrary = fc.array(animationTypeArbitrary, {
  minLength: 1,
  maxLength: 5
});

// Scroll and Position Generators
export const positionArbitrary = fc.record({
  x: fc.integer({ min: -1000, max: 1000 }),
  y: fc.integer({ min: -1000, max: 1000 }),
  scale: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
  opacity: fc.float({ min: Math.fround(0), max: Math.fround(1) })
});

export const scrollProgressArbitrary = fc.float({ min: Math.fround(0), max: Math.fround(1) });

// Helper function to create property test configurations
export const createPropertyTestConfig = (numRuns: number = 100): object => ({
  numRuns,
  verbose: false,
  seed: undefined, // Let fast-check choose random seed
  path: undefined, // No specific path
  endOnFailure: true
});

// Helper function to validate state machine sequences
export const isValidStateSequence = (sequence: StateType[]): boolean => {
  if (sequence.length === 0) return false;
  
  // Define valid state transitions based on design document
  const validTransitions: Record<StateType, StateType[]> = {
    [StateType.PAGE_LOAD]: [StateType.AMBIENT_IDLE],
    [StateType.AMBIENT_IDLE]: [StateType.INTRO_TEXT],
    [StateType.INTRO_TEXT]: [StateType.PRESENCE_ACKNOWLEDGEMENT],
    [StateType.PRESENCE_ACKNOWLEDGEMENT]: [StateType.DISTANCE_VISUALIZATION],
    [StateType.DISTANCE_VISUALIZATION]: [StateType.PERSONAL_MEMORY],
    [StateType.PERSONAL_MEMORY]: [StateType.VALENTINE_QUESTION],
    [StateType.VALENTINE_QUESTION]: [StateType.DECISION_STATE],
    [StateType.DECISION_STATE]: [StateType.CONFIRMATION_STATE, StateType.GENTLE_EXIT_STATE],
    [StateType.CONFIRMATION_STATE]: [],
    [StateType.GENTLE_EXIT_STATE]: []
  };
  
  for (let i = 0; i < sequence.length - 1; i++) {
    const currentState = sequence[i];
    const nextState = sequence[i + 1];
    
    const allowedTransitions = validTransitions[currentState as StateType];
    if (!allowedTransitions || !allowedTransitions.includes(nextState as StateType)) {
      return false;
    }
  }
  
  return true;
};