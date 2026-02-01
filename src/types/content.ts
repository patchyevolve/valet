/**
 * Content and configuration types for Valentine's Day interactive webpage
 * Defines data structures for text variants, video configuration, and content management
 */

import { TextEvent, AccessibilityText } from './components.js';

// Content Variant Types
export interface ContentVariant {
  type: 'ultra-minimal' | 'warm-controlled';
  introSequences: TextSequence[];
  memoryReveal: string;
  valentineQuestion: string;
  confirmationText: TextEvent[];
  gentleExitMessage: string;
}

export interface TextSequence {
  id: string;
  content: string;
  timing: SequenceTiming;
  accessibility: AccessibilityText;
}

export interface SequenceTiming {
  typingSpeed: number;
  pauseAfter: number;
  fadeInDuration: number;
  temporalSpacing: number;
}

// Video Configuration Types
export interface VideoConfig {
  filePath: string;
  targetDuration: number;
  textOverlays: TextEvent[];
  fallbackContent: string;
  accessibilityDescription: string;
  networkOptimization: NetworkConfig;
}

export interface NetworkConfig {
  mobileQuality: string;
  throttledFallback: string;
  preloadStrategy: 'aggressive' | 'conservative';
}

// Application Configuration
export interface AppConfig {
  contentVariants: {
    ultraMinimal: ContentVariant;
    warmControlled: ContentVariant;
  };
  videoConfig: VideoConfig;
  stateConfigs: StateConfigMap;
  accessibility: GlobalAccessibilityConfig;
}

export interface StateConfigMap {
  [key: string]: {
    minDuration: number;
    maxDuration?: number;
    allowedTransitions: string[];
    requiredAssets: string[];
  };
}

export interface GlobalAccessibilityConfig {
  respectSystemPreferences: boolean;
  defaultReducedMotion: boolean;
  defaultAutoplay: boolean;
  keyboardNavigationEnabled: boolean;
}