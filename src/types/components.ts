/**
 * Component interfaces for Valentine's Day interactive webpage
 * Defines contracts for all major system components
 */

import { StateType } from './state-machine.js';

// Asset Management Types
export interface Asset {
  url: string;
  type: 'video' | 'image' | 'audio';
  priority: 'critical' | 'high' | 'normal';
  fallback?: string;
}

export interface PreloadResult {
  success: boolean;
  loadedAssets: Asset[];
  failedAssets: Asset[];
  totalLoadTime: number;
}

export type FallbackStrategy = 'retry' | 'skip' | 'alternative';

export interface AssetPreloader {
  preloadAssets(assetList: Asset[]): Promise<PreloadResult>;
  getLoadingProgress(): number;
  handleLoadingFailure(asset: Asset): FallbackStrategy;
}

// Progress Tracking Types
export interface ParallaxElement {
  id: string;
  element: HTMLElement;
  startPosition: Position;
  endPosition: Position;
  scrollRange: ScrollRange;
  easing: EasingFunction;
}

export interface Position {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface ScrollRange {
  start: number;
  end: number;
}

export type EasingFunction = (t: number) => number;

export interface ProgressTracker {
  enableScrollProgression(): void;
  disableScrollProgression(): void;
  getCurrentScrollProgress(): number;
  registerScrollThreshold(threshold: number, callback: () => void): void;
  applyParallaxEffects(elements: ParallaxElement[]): void;
}

// Text and Content Types
export interface TypingOptions {
  speed: number;
  pauseAfter: number;
  showCursor: boolean;
  fadeIn: boolean;
}

export interface FormattedContent {
  text: string;
  formatting: TextFormatting;
  accessibility: AccessibilityText;
}

export interface TextFormatting {
  emphasis: boolean;
  lineBreaks: number[];
  specialCharacters: boolean;
}

export interface AccessibilityText {
  screenReaderText?: string;
  ariaLabel?: string;
  description?: string;
}

export interface MemoryRevealer {
  revealText(content: string, options: TypingOptions): Promise<void>;
  setTextVariant(variant: 'ultra-minimal' | 'warm-controlled'): void;
  parseContent(rawContent: string): FormattedContent;
  showCursor(visible: boolean): void;
}

// Video and Media Types
export interface TextEvent {
  timestamp: number;
  text: string;
  duration: number;
  position: OverlayPosition;
}

export interface OverlayPosition {
  x: number;
  y: number;
  alignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'middle' | 'bottom';
}

export interface VideoPlayer {
  loadVideo(videoPath: string): Promise<void>;
  playWithDuration(targetDuration: number): Promise<void>;
  synchronizeTextOverlay(textEvents: TextEvent[]): void;
  handlePlaybackFailure(): void;
  respectAutoplayPreferences(): boolean;
}

// Decision and Interaction Types
export interface DecisionOption {
  id: string;
  text: string;
  action: () => Promise<void>;
  emotionalSafety: boolean;
}

export interface DecisionHandler {
  presentChoices(options: DecisionOption[]): void;
  handleYesPath(): Promise<void>;
  handleGentleExit(): Promise<void>;
  preserveEmotionalSafety(): void;
  avoidPressureTactics(): boolean;
}

// Accessibility Types
export type AnimationType = 'particles' | 'parallax' | 'gradients' | 'typing' | 'fade';

export interface Content {
  text: string;
  media?: string;
  interactive?: boolean;
}

export interface AlternativeContent {
  text: string;
  description: string;
  controls?: string[];
}

export interface AccessibilityController {
  detectReducedMotionPreference(): boolean;
  disableAnimations(animationTypes: AnimationType[]): void;
  provideAlternativePresentation(content: Content): AlternativeContent;
  respectAutoplayPreferences(): void;
  announceStateChanges(state: StateType): void;
}

// Visual Effects and Animation Types
export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  opacity: { min: number; max: number };
  colors: string[];
}

export interface GradientConfig {
  colors: string[];
  duration: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface AmbientEffectsController {
  startAmbientEffects(): void;
  stopAmbientEffects(): void;
  updateGradientShift(config: GradientConfig): void;
  createFloatingParticles(config: ParticleConfig): void;
  disableAnimations(types: AnimationType[]): void;
  isAnimationEnabled(type: AnimationType): boolean;
}

export interface ParallaxConfig {
  elements: ParallaxElementConfig[];
  scrollContainer?: HTMLElement;
  smoothing: number;
  threshold: number;
}

export interface ParallaxElementConfig {
  selector: string;
  startPosition: Position;
  endPosition: Position;
  scrollRange: ScrollRange;
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
}

export interface ParallaxController {
  initialize(config: ParallaxConfig): void;
  addElement(elementConfig: ParallaxElementConfig): void;
  removeElement(selector: string): void;
  updateScrollPosition(scrollY: number): void;
  enableParallax(): void;
  disableParallax(): void;
  isParallaxEnabled(): boolean;
  getCurrentScrollProgress(): number;
}