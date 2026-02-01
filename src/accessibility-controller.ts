/**
 * Accessibility Controller for Valentine's Day interactive webpage
 * Implements Requirements 9.1, 9.2, 9.3, 9.4, 9.5 - Accessibility support and preference handling
 */

import { 
  AccessibilityController, 
  AnimationType, 
  Content, 
  AlternativeContent 
} from './types/components.js';
import { StateType } from './types/state-machine.js';

export class AccessibilityControllerImpl implements AccessibilityController {
  private reducedMotionEnabled: boolean = false;
  private autoplayDisabled: boolean = false;
  private screenReaderEnabled: boolean = false;
  private highContrastEnabled: boolean = false;
  private announceElement: HTMLElement | null = null;
  private manualVideoControls: HTMLElement | null = null;
  private alternativeDescriptions: Map<string, string> = new Map();

  constructor() {
    this.initializeAccessibilityFeatures();
    this.setupScreenReaderAnnouncements();
    this.setupMediaQueryListeners();
  }

  /**
   * Requirement 9.1: Detect reduced motion preferences and disable animations accordingly
   */
  detectReducedMotionPreference(): boolean {
    // Check CSS media query for reduced motion preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery) {
        this.reducedMotionEnabled = mediaQuery.matches;
        return this.reducedMotionEnabled;
      }
    }
    
    // Fallback: check for manual accessibility setting
    const manualSetting = localStorage.getItem('accessibility-reduced-motion');
    this.reducedMotionEnabled = manualSetting === 'true';
    return this.reducedMotionEnabled;
  }

  /**
   * Requirement 9.1: Disable particle animations and parallax effects when reduced motion is preferred
   */
  disableAnimations(animationTypes: AnimationType[]): void {
    // Store disabled animation types for reference
    const disabledTypesStr = localStorage.getItem('accessibility-disabled-animations') || '[]';
    let disabledTypes: string[] = [];
    
    try {
      disabledTypes = JSON.parse(disabledTypesStr);
      if (!Array.isArray(disabledTypes)) {
        disabledTypes = [];
      }
    } catch (error) {
      disabledTypes = [];
    }
    
    animationTypes.forEach(type => {
      if (!disabledTypes.includes(type)) {
        disabledTypes.push(type);
      }
    });
    localStorage.setItem('accessibility-disabled-animations', JSON.stringify(disabledTypes));

    // Apply immediate visual changes for disabled animations
    animationTypes.forEach(type => {
      this.applyAnimationDisabling(type);
    });

    // Announce changes to screen readers
    if (animationTypes.length > 0) {
      this.announceToScreenReader(`Animations disabled: ${animationTypes.join(', ')}`);
    }
  }

  /**
   * Requirement 9.2: Provide alternative text descriptions for all visual effects
   */
  provideAlternativePresentation(content: Content): AlternativeContent {
    const alternative: AlternativeContent = {
      text: content.text,
      description: this.generateAlternativeDescription(content),
      controls: []
    };

    // Add manual controls for interactive content
    if (content.interactive) {
      alternative.controls = this.generateManualControls(content);
    }

    // Store alternative description for future reference
    if (content.media) {
      this.alternativeDescriptions.set(content.media, alternative.description);
    }

    return alternative;
  }

  /**
   * Requirement 9.2: Provide manual video controls when autoplay is disabled
   */
  respectAutoplayPreferences(): void {
    // Check browser autoplay policy
    this.autoplayDisabled = this.detectAutoplayPolicy();
    
    // Check user preference
    const userPreference = localStorage.getItem('accessibility-autoplay-disabled');
    if (userPreference === 'true') {
      this.autoplayDisabled = true;
    }

    if (this.autoplayDisabled) {
      this.createManualVideoControls();
      this.announceToScreenReader('Autoplay is disabled. Manual video controls are available.');
    }
  }

  /**
   * Requirement 9.4: Announce state changes to screen readers
   */
  announceStateChanges(state: StateType): void {
    const stateDescriptions: Record<StateType, string> = {
      [StateType.PAGE_LOAD]: 'Loading Valentine\'s Day experience. Please wait.',
      [StateType.AMBIENT_IDLE]: 'Welcome to a gentle Valentine\'s experience. Scroll or interact to continue.',
      [StateType.INTRO_TEXT]: 'Reading introductory message.',
      [StateType.PRESENCE_ACKNOWLEDGEMENT]: 'Acknowledging your presence. Scroll to continue your journey.',
      [StateType.DISTANCE_VISUALIZATION]: 'Visualizing emotional closeness. Continue scrolling to progress.',
      [StateType.PERSONAL_MEMORY]: 'Revealing personal memory.',
      [StateType.VALENTINE_QUESTION]: 'Valentine\'s question presented. Choose your response.',
      [StateType.DECISION_STATE]: 'Decision time. Select your preferred path.',
      [StateType.CONFIRMATION_STATE]: 'Confirmation experience beginning.',
      [StateType.GENTLE_EXIT_STATE]: 'Thank you for your time. You are valued regardless of your choice.'
    };

    const description = stateDescriptions[state] || `Transitioning to ${state} state`;
    this.announceToScreenReader(description);

    // Update page title for screen readers
    document.title = `Valentine's Experience - ${this.formatStateForTitle(state)}`;
  }

  /**
   * Get current accessibility settings
   */
  getAccessibilitySettings(): {
    reducedMotion: boolean;
    autoplayDisabled: boolean;
    screenReaderEnabled: boolean;
    highContrast: boolean;
  } {
    return {
      reducedMotion: this.reducedMotionEnabled,
      autoplayDisabled: this.autoplayDisabled,
      screenReaderEnabled: this.screenReaderEnabled,
      highContrast: this.highContrastEnabled
    };
  }

  /**
   * Manually enable/disable accessibility features
   */
  setAccessibilityPreference(feature: string, enabled: boolean): void {
    switch (feature) {
      case 'reducedMotion':
        this.reducedMotionEnabled = enabled;
        localStorage.setItem('accessibility-reduced-motion', enabled.toString());
        if (enabled) {
          this.disableAnimations(['particles', 'parallax', 'gradients', 'typing', 'fade']);
        }
        break;
      case 'autoplay':
        this.autoplayDisabled = !enabled;
        localStorage.setItem('accessibility-autoplay-disabled', (!enabled).toString());
        if (!enabled) {
          this.createManualVideoControls();
        }
        break;
      case 'highContrast':
        this.highContrastEnabled = enabled;
        localStorage.setItem('accessibility-high-contrast', enabled.toString());
        this.applyHighContrastMode(enabled);
        break;
    }
  }

  /**
   * Initialize accessibility features on startup
   */
  private initializeAccessibilityFeatures(): void {
    // Detect system preferences
    this.detectReducedMotionPreference();
    this.detectHighContrastPreference();
    this.detectScreenReaderUsage();
    
    // Apply stored user preferences
    this.applyStoredPreferences();
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
  }

  /**
   * Set up screen reader announcements
   */
  private setupScreenReaderAnnouncements(): void {
    // Create hidden element for screen reader announcements
    this.announceElement = document.createElement('div');
    this.announceElement.setAttribute('aria-live', 'polite');
    this.announceElement.setAttribute('aria-atomic', 'true');
    this.announceElement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announceElement);
  }

  /**
   * Set up media query listeners for dynamic preference changes
   */
  private setupMediaQueryListeners(): void {
    // Listen for reduced motion preference changes
    if (window.matchMedia) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reducedMotionQuery && reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', (e) => {
          this.reducedMotionEnabled = e.matches;
          if (e.matches) {
            this.disableAnimations(['particles', 'parallax', 'gradients']);
            this.announceToScreenReader('Reduced motion mode activated');
          }
        });
      }

      // Listen for high contrast preference changes
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      if (highContrastQuery && highContrastQuery.addEventListener) {
        highContrastQuery.addEventListener('change', (e) => {
          this.highContrastEnabled = e.matches;
          this.applyHighContrastMode(e.matches);
        });
      }
    }
  }

  /**
   * Apply animation disabling for specific types
   */
  private applyAnimationDisabling(type: AnimationType): void {
    const body = document.body;
    
    switch (type) {
      case 'particles':
        body.classList.add('no-particles');
        break;
      case 'parallax':
        body.classList.add('no-parallax');
        break;
      case 'gradients':
        body.classList.add('no-gradients');
        break;
      case 'typing':
        body.classList.add('no-typing-animation');
        break;
      case 'fade':
        body.classList.add('no-fade-animation');
        break;
    }
  }

  /**
   * Generate alternative description for content
   */
  private generateAlternativeDescription(content: Content): string {
    let description = content.text;
    
    if (content.media) {
      if (content.media.includes('video')) {
        description += ' A romantic video plays with synchronized text overlays.';
      } else if (content.media.includes('image')) {
        description += ' Visual elements create a romantic atmosphere.';
      }
    }
    
    if (content.interactive) {
      description += ' Interactive elements are available for your response.';
    }
    
    return description;
  }

  /**
   * Generate manual controls for interactive content
   */
  private generateManualControls(content: Content): string[] {
    const controls: string[] = [];
    
    if (content.media?.includes('video')) {
      controls.push('Play Video', 'Pause Video', 'Skip Video');
    }
    
    if (content.interactive) {
      controls.push('Continue', 'Go Back', 'Exit Gently');
    }
    
    return controls;
  }

  /**
   * Detect autoplay policy
   */
  private detectAutoplayPolicy(): boolean {
    // Check if autoplay is blocked by browser policy
    try {
      const video = document.createElement('video');
      video.muted = true;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          return true; // Autoplay blocked
        });
      }
    } catch (error) {
      return true; // Autoplay not supported
    }
    
    return false;
  }

  /**
   * Create manual video controls
   */
  private createManualVideoControls(): void {
    if (this.manualVideoControls) return;
    
    this.manualVideoControls = document.createElement('div');
    this.manualVideoControls.className = 'manual-video-controls';
    this.manualVideoControls.setAttribute('role', 'group');
    this.manualVideoControls.setAttribute('aria-label', 'Video controls');
    
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Video';
    playButton.setAttribute('aria-label', 'Play romantic video');
    playButton.className = 'video-control-button';
    
    const skipButton = document.createElement('button');
    skipButton.textContent = 'Skip Video';
    skipButton.setAttribute('aria-label', 'Skip video and continue');
    skipButton.className = 'video-control-button';
    
    this.manualVideoControls.appendChild(playButton);
    this.manualVideoControls.appendChild(skipButton);
    
    // Style the controls
    this.manualVideoControls.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 5px;
      display: none;
    `;
    
    document.body.appendChild(this.manualVideoControls);
  }

  /**
   * Show manual video controls
   */
  showManualVideoControls(): void {
    if (this.manualVideoControls) {
      this.manualVideoControls.style.display = 'block';
    }
  }

  /**
   * Hide manual video controls
   */
  hideManualVideoControls(): void {
    if (this.manualVideoControls) {
      this.manualVideoControls.style.display = 'none';
    }
  }

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader(message: string): void {
    if (this.announceElement) {
      this.announceElement.textContent = message;
      
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        if (this.announceElement) {
          this.announceElement.textContent = '';
        }
      }, 1000);
    }
  }

  /**
   * Format state name for page title
   */
  private formatStateForTitle(state: StateType): string {
    return state.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * Detect high contrast preference
   */
  private detectHighContrastPreference(): void {
    if (window.matchMedia) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      if (highContrastQuery) {
        this.highContrastEnabled = highContrastQuery.matches;
      }
    }
  }

  /**
   * Detect screen reader usage
   */
  private detectScreenReaderUsage(): void {
    // Check for common screen reader indicators
    this.screenReaderEnabled = !!(
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis ||
      document.querySelector('[aria-live]')
    );
  }

  /**
   * Apply stored accessibility preferences
   */
  private applyStoredPreferences(): void {
    const reducedMotion = localStorage.getItem('accessibility-reduced-motion');
    if (reducedMotion === 'true') {
      this.reducedMotionEnabled = true;
      this.disableAnimations(['particles', 'parallax', 'gradients']);
    }

    const autoplayDisabled = localStorage.getItem('accessibility-autoplay-disabled');
    if (autoplayDisabled === 'true') {
      this.autoplayDisabled = true;
      this.createManualVideoControls();
    }

    const highContrast = localStorage.getItem('accessibility-high-contrast');
    if (highContrast === 'true') {
      this.highContrastEnabled = true;
      this.applyHighContrastMode(true);
    }
  }

  /**
   * Apply high contrast mode
   */
  private applyHighContrastMode(enabled: boolean): void {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  /**
   * Set up keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Escape key for gentle exit
      if (event.key === 'Escape') {
        this.announceToScreenReader('Escape pressed. Gentle exit available.');
        // Dispatch custom event for gentle exit
        const exitEvent = new CustomEvent('gentle-exit-requested');
        document.dispatchEvent(exitEvent);
      }
      
      // Space bar for video control
      if (event.key === ' ' && this.autoplayDisabled) {
        event.preventDefault();
        const playEvent = new CustomEvent('manual-video-play-requested');
        document.dispatchEvent(playEvent);
      }
    });
  }
}