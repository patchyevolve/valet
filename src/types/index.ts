/**
 * Main type exports for Valentine's Day interactive webpage
 * Centralizes all type definitions for easy importing
 */

// State Machine Types
export * from './state-machine.js';

// Component Types  
export * from './components.js';

// Content Types
export * from './content.js';

// Re-export commonly used types for convenience
export type { StateType, StateMachineController, TransitionOptions } from './state-machine.js';
export type { AssetPreloader, ProgressTracker, MemoryRevealer, VideoPlayer, DecisionHandler, AccessibilityController } from './components.js';
export type { ContentVariant, VideoConfig, AppConfig } from './content.js';