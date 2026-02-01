/**
 * Mobile Optimization Controller for Valentine's Day interactive webpage
 * Implements Requirements 10.1, 10.2, 10.3, 10.4, 10.5 - Mobile optimization and network handling
 */

import { StateType } from './types/state-machine.js';

export interface TouchInteractionConfig {
  touchTargetMinSize: number;
  swipeThreshold: number;
  tapTimeout: number;
  doubleTapTimeout: number;
  longPressTimeout: number;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface NetworkCondition {
  type: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
  downlink: number;
  effectiveType: string;
  rtt: number;
}

export interface OrientationState {
  orientation: 'portrait' | 'landscape';
  angle: number;
  width: number;
  height: number;
}

export interface MobileOptimizationController {
  initializeMobileOptimization(): void;
  optimizeTouchInteractions(): void;
  setupResponsiveDesign(): void;
  detectNetworkConditions(): NetworkCondition;
  handleOrientationChange(callback: (orientation: OrientationState) => void): void;
  adaptToNetworkConditions(condition: NetworkCondition): void;
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop';
  isMobileDevice(): boolean;
  getTouchCapabilities(): TouchCapabilities;
}

export interface TouchCapabilities {
  touchSupported: boolean;
  maxTouchPoints: number;
  gestureSupported: boolean;
  forceSupported: boolean;
}

export class MobileOptimizationControllerImpl implements MobileOptimizationController {
  private touchConfig: TouchInteractionConfig = {
    touchTargetMinSize: 44, // 44px minimum touch target (iOS/Android guidelines)
    swipeThreshold: 50,
    tapTimeout: 300,
    doubleTapTimeout: 500,
    longPressTimeout: 800
  };

  private breakpoints: ResponsiveBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };

  private currentNetworkCondition: NetworkCondition | null = null;
  private orientationCallbacks: Array<(orientation: OrientationState) => void> = [];
  private resizeObserver: ResizeObserver | null = null;
  private touchStartTime: number = 0;
  private lastTapTime: number = 0;
  private touchStartPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.initializeMobileOptimization();
  }

  /**
   * Requirement 10.1: Initialize mobile optimization features
   */
  initializeMobileOptimization(): void {
    this.optimizeTouchInteractions();
    this.setupResponsiveDesign();
    this.setupNetworkMonitoring();
    this.setupOrientationHandling();
    this.setupViewportOptimization();
    this.setupPerformanceOptimizations();
  }

  /**
   * Requirement 10.1: Optimize touch interactions for mobile devices
   */
  optimizeTouchInteractions(): void {
    if (!this.isMobileDevice()) return;

    // Enhance touch targets
    this.enhanceTouchTargets();
    
    // Set up touch event handlers
    this.setupTouchEventHandlers();
    
    // Optimize scroll behavior
    this.optimizeScrollBehavior();
    
    // Add touch feedback
    this.addTouchFeedback();
  }

  /**
   * Requirement 10.3: Add responsive design for various screen sizes
   */
  setupResponsiveDesign(): void {
    // Add responsive CSS classes based on screen size
    this.updateResponsiveClasses();
    
    // Set up resize observer for dynamic updates
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateResponsiveClasses();
        this.adjustLayoutForScreenSize();
      });
      this.resizeObserver.observe(document.body);
    }
    
    // Set up media query listeners
    this.setupMediaQueryListeners();
  }

  /**
   * Requirement 10.2: Detect network throttling and adapt strategies
   */
  detectNetworkConditions(): NetworkCondition {
    // Use Network Information API if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      this.currentNetworkCondition = {
        type: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 0
      };
    } else {
      // Fallback: estimate based on timing
      this.currentNetworkCondition = this.estimateNetworkCondition();
    }
    
    return this.currentNetworkCondition;
  }

  /**
   * Requirement 10.4: Handle orientation changes with state persistence
   */
  handleOrientationChange(callback: (orientation: OrientationState) => void): void {
    this.orientationCallbacks.push(callback);
    
    // Initial call
    callback(this.getCurrentOrientation());
  }

  /**
   * Requirement 10.2: Adapt asset loading strategies based on network conditions
   */
  adaptToNetworkConditions(condition: NetworkCondition): void {
    const body = document.body;
    
    // Remove existing network classes
    body.classList.remove('network-slow', 'network-fast', 'network-offline');
    
    switch (condition.type) {
      case 'slow-2g':
      case '2g':
        body.classList.add('network-slow');
        this.enableDataSavingMode();
        break;
      case '3g':
        this.enableModerateQualityMode();
        break;
      case '4g':
      case 'wifi':
        body.classList.add('network-fast');
        this.enableHighQualityMode();
        break;
      default:
        this.enableModerateQualityMode();
    }
    
    // Dispatch custom event for other components
    const event = new CustomEvent('network-condition-changed', {
      detail: { condition }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get current responsive breakpoint
   */
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    
    if (width < this.breakpoints.mobile) {
      return 'mobile';
    } else if (width < this.breakpoints.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Check if current device is mobile
   */
  isMobileDevice(): boolean {
    // Check user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    
    // Check touch support
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen size
    const isSmallScreen = window.innerWidth < this.breakpoints.mobile;
    
    return isMobileUA || (hasTouchSupport && isSmallScreen);
  }

  /**
   * Get touch capabilities of the device
   */
  getTouchCapabilities(): TouchCapabilities {
    return {
      touchSupported: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      gestureSupported: 'ongesturestart' in window,
      forceSupported: 'TouchEvent' in window && 'force' in TouchEvent.prototype
    };
  }

  /**
   * Enhance touch targets to meet accessibility guidelines
   */
  private enhanceTouchTargets(): void {
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
    
    interactiveElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const width = parseInt(computedStyle.width);
      const height = parseInt(computedStyle.height);
      
      // Ensure minimum touch target size
      if (width < this.touchConfig.touchTargetMinSize || height < this.touchConfig.touchTargetMinSize) {
        htmlElement.style.minWidth = `${this.touchConfig.touchTargetMinSize}px`;
        htmlElement.style.minHeight = `${this.touchConfig.touchTargetMinSize}px`;
        htmlElement.style.padding = '8px';
      }
      
      // Add touch-friendly spacing
      htmlElement.style.margin = '4px';
    });
  }

  /**
   * Set up touch event handlers for enhanced interactions
   */
  private setupTouchEventHandlers(): void {
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
      this.touchStartTime = Date.now();
      this.touchStartPosition.x = e.touches[0].clientX;
      this.touchStartPosition.y = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - this.touchStartTime;
      
      // Handle tap
      if (touchDuration < this.touchConfig.tapTimeout) {
        this.handleTap(e, touchEndTime);
      }
      
      // Handle swipe
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      if (Math.abs(deltaX) > this.touchConfig.swipeThreshold || 
          Math.abs(deltaY) > this.touchConfig.swipeThreshold) {
        this.handleSwipe(deltaX, deltaY);
      }
    }, { passive: true });
    
    // Handle long press
    document.addEventListener('touchstart', (e) => {
      setTimeout(() => {
        if (Date.now() - this.touchStartTime >= this.touchConfig.longPressTimeout) {
          this.handleLongPress(e);
        }
      }, this.touchConfig.longPressTimeout);
    }, { passive: true });
  }

  /**
   * Optimize scroll behavior for mobile
   */
  private optimizeScrollBehavior(): void {
    // Enable momentum scrolling on iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Prevent overscroll bounce
    document.body.style.overscrollBehavior = 'none';
    
    // Optimize scroll performance
    let ticking = false;
    
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Dispatch optimized scroll event
          const event = new CustomEvent('optimized-scroll', {
            detail: { scrollY: window.scrollY }
          });
          document.dispatchEvent(event);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    document.addEventListener('scroll', optimizedScrollHandler, { passive: true });
  }

  /**
   * Add visual feedback for touch interactions
   */
  private addTouchFeedback(): void {
    const style = document.createElement('style');
    style.textContent = `
      .touch-feedback {
        position: relative;
        overflow: hidden;
      }
      
      .touch-feedback::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s;
        pointer-events: none;
      }
      
      .touch-feedback.active::after {
        width: 100px;
        height: 100px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Update responsive CSS classes based on current screen size
   */
  private updateResponsiveClasses(): void {
    const body = document.body;
    const breakpoint = this.getCurrentBreakpoint();
    
    // Remove existing breakpoint classes
    body.classList.remove('mobile', 'tablet', 'desktop');
    
    // Add current breakpoint class
    body.classList.add(breakpoint);
    
    // Add device type classes
    if (this.isMobileDevice()) {
      body.classList.add('is-mobile');
    } else {
      body.classList.remove('is-mobile');
    }
  }

  /**
   * Adjust layout for current screen size
   */
  private adjustLayoutForScreenSize(): void {
    const breakpoint = this.getCurrentBreakpoint();
    
    // Dispatch layout change event
    const event = new CustomEvent('layout-breakpoint-changed', {
      detail: { breakpoint, width: window.innerWidth, height: window.innerHeight }
    });
    document.dispatchEvent(event);
  }

  /**
   * Set up media query listeners for responsive design
   */
  private setupMediaQueryListeners(): void {
    if (!window.matchMedia) return;
    
    const mobileQuery = window.matchMedia(`(max-width: ${this.breakpoints.mobile - 1}px)`);
    const tabletQuery = window.matchMedia(`(max-width: ${this.breakpoints.tablet - 1}px)`);
    
    const handleMediaChange = () => {
      this.updateResponsiveClasses();
      this.adjustLayoutForScreenSize();
    };
    
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleMediaChange);
      tabletQuery.addEventListener('change', handleMediaChange);
    }
  }

  /**
   * Set up network condition monitoring
   */
  private setupNetworkMonitoring(): void {
    const connection = (navigator as any).connection;
    
    if (connection) {
      // Monitor network changes
      connection.addEventListener('change', () => {
        const condition = this.detectNetworkConditions();
        this.adaptToNetworkConditions(condition);
      });
      
      // Initial network detection
      const condition = this.detectNetworkConditions();
      this.adaptToNetworkConditions(condition);
    }
  }

  /**
   * Set up orientation change handling
   */
  private setupOrientationHandling(): void {
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        const orientation = this.getCurrentOrientation();
        this.orientationCallbacks.forEach(callback => callback(orientation));
        
        // Dispatch orientation change event
        const event = new CustomEvent('orientation-changed', {
          detail: { orientation }
        });
        document.dispatchEvent(event);
      }, 100);
    };
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }

  /**
   * Set up viewport optimization
   */
  private setupViewportOptimization(): void {
    // Ensure viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Set optimal viewport settings
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    
    // Prevent zoom on input focus (iOS)
    if (this.isMobileDevice()) {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        });
        
        input.addEventListener('blur', () => {
          viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        });
      });
    }
  }

  /**
   * Set up performance optimizations for mobile
   */
  private setupPerformanceOptimizations(): void {
    // Enable hardware acceleration for animations
    const animatedElements = document.querySelectorAll('.animated, .parallax, .particle');
    animatedElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.willChange = 'transform';
      htmlElement.style.transform = 'translateZ(0)'; // Force hardware acceleration
    });
    
    // Optimize images for mobile
    this.optimizeImagesForMobile();
    
    // Set up intersection observer for lazy loading
    this.setupLazyLoading();
  }

  /**
   * Get current orientation state
   */
  private getCurrentOrientation(): OrientationState {
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    const angle = (screen.orientation?.angle) || (window.orientation as number) || 0;
    
    return {
      orientation,
      angle,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Estimate network condition based on timing
   */
  private estimateNetworkCondition(): NetworkCondition {
    // Simple estimation based on connection timing
    const start = performance.now();
    
    return {
      type: 'unknown',
      downlink: 0,
      effectiveType: 'unknown',
      rtt: performance.now() - start
    };
  }

  /**
   * Enable data saving mode for slow connections
   */
  private enableDataSavingMode(): void {
    document.body.classList.add('data-saving-mode');
    
    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.lowQualitySrc) {
        img.src = img.dataset.lowQualitySrc;
      }
    });
    
    // Disable non-essential animations
    document.body.classList.add('reduced-animations');
  }

  /**
   * Enable moderate quality mode
   */
  private enableModerateQualityMode(): void {
    document.body.classList.add('moderate-quality-mode');
  }

  /**
   * Enable high quality mode for fast connections
   */
  private enableHighQualityMode(): void {
    document.body.classList.add('high-quality-mode');
    
    // Enable high quality images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.highQualitySrc) {
        img.src = img.dataset.highQualitySrc;
      }
    });
  }

  /**
   * Handle tap gesture
   */
  private handleTap(e: TouchEvent, tapTime: number): void {
    const timeSinceLastTap = tapTime - this.lastTapTime;
    
    if (timeSinceLastTap < this.touchConfig.doubleTapTimeout) {
      // Double tap
      const event = new CustomEvent('double-tap', {
        detail: { originalEvent: e, position: this.touchStartPosition }
      });
      document.dispatchEvent(event);
    } else {
      // Single tap
      const event = new CustomEvent('single-tap', {
        detail: { originalEvent: e, position: this.touchStartPosition }
      });
      document.dispatchEvent(event);
    }
    
    this.lastTapTime = tapTime;
  }

  /**
   * Handle swipe gesture
   */
  private handleSwipe(deltaX: number, deltaY: number): void {
    let direction: string;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    const event = new CustomEvent('swipe', {
      detail: { direction, deltaX, deltaY }
    });
    document.dispatchEvent(event);
  }

  /**
   * Handle long press gesture
   */
  private handleLongPress(e: TouchEvent): void {
    const event = new CustomEvent('long-press', {
      detail: { originalEvent: e, position: this.touchStartPosition }
    });
    document.dispatchEvent(event);
  }

  /**
   * Optimize images for mobile devices
   */
  private optimizeImagesForMobile(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for better performance
      img.loading = 'lazy';
      
      // Set up responsive images if not already configured
      if (!img.srcset && img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
  }

  /**
   * Set up lazy loading for performance
   */
  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const lazyElements = document.querySelectorAll('[data-lazy]');
      
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            if (element.dataset.lazySrc) {
              (element as HTMLImageElement).src = element.dataset.lazySrc;
            }
            
            if (element.dataset.lazyBackground) {
              element.style.backgroundImage = `url(${element.dataset.lazyBackground})`;
            }
            
            element.classList.add('lazy-loaded');
            lazyObserver.unobserve(element);
          }
        });
      });
      
      lazyElements.forEach(element => lazyObserver.observe(element));
    }
  }
}