/**
 * Video Player Component for Valentine's Day Interactive Webpage
 * Handles video loading, playback control, temporal stretching, and text overlay synchronization
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { VideoPlayer, TextEvent, OverlayPosition } from './types/components.js';

export class VideoPlayerImpl implements VideoPlayer {
  private videoElement: HTMLVideoElement | null = null;
  private textOverlayContainer: HTMLElement | null = null;
  private currentTextOverlays: TextEvent[] = [];
  private overlayTimeouts: number[] = [];
  private playbackPromise: Promise<void> | null = null;
  private autoplayAllowed: boolean = true;
  private fallbackMode: boolean = false;

  constructor() {
    this.detectAutoplaySupport();
  }

  /**
   * Loads a video file and prepares it for playback
   * @param videoPath Path to the video file
   * @returns Promise that resolves when video is loaded
   */
  async loadVideo(videoPath: string): Promise<void> {
    try {
      // Create video element if it doesn't exist
      if (!this.videoElement) {
        this.createVideoElement();
      }

      if (!this.videoElement) {
        throw new Error('Failed to create video element');
      }

      // Set up video source
      this.videoElement.src = videoPath;
      this.videoElement.preload = 'metadata';

      // Wait for video metadata to load
      await new Promise<void>((resolve, reject) => {
        if (!this.videoElement) {
          reject(new Error('Video element not available'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error(`Video loading timeout: ${videoPath}`));
        }, 10000);

        this.videoElement.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.videoElement.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Video loading error: ${videoPath}`));
        };

        // Trigger loading if not already started
        this.videoElement.load();
      });

      console.log(`Video loaded successfully: ${videoPath}`);
    } catch (error) {
      console.error('Failed to load video:', error);
      throw error;
    }
  }

  /**
   * Plays the video with temporal stretching to match target duration
   * @param targetDuration Target duration in seconds (should be 8 seconds)
   * @returns Promise that resolves when playback completes
   */
  async playWithDuration(targetDuration: number): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Video not loaded. Call loadVideo() first.');
    }

    try {
      const originalDuration = this.videoElement.duration;
      
      if (isNaN(originalDuration) || originalDuration <= 0) {
        throw new Error('Invalid video duration');
      }

      // Calculate playback rate for temporal stretching
      const playbackRate = originalDuration / targetDuration;
      this.videoElement.playbackRate = Math.max(0.25, Math.min(4.0, playbackRate)); // Clamp between 0.25x and 4x

      console.log(`Playing video with temporal stretching: ${originalDuration}s -> ${targetDuration}s (rate: ${playbackRate})`);

      // Reset video to beginning
      this.videoElement.currentTime = 0;

      // Start playback
      this.playbackPromise = this.startPlayback();
      await this.playbackPromise;

    } catch (error) {
      console.error('Video playback failed:', error);
      await this.handlePlaybackFailure();
      throw error;
    }
  }

  /**
   * Synchronizes text overlays with video playback
   * @param textEvents Array of text events with timing information
   */
  synchronizeTextOverlay(textEvents: TextEvent[]): void {
    this.currentTextOverlays = [...textEvents];
    
    // Clear any existing overlay timeouts
    this.clearOverlayTimeouts();

    if (!this.videoElement) {
      console.warn('Video element not available for text overlay synchronization');
      return;
    }

    // Create text overlay container if it doesn't exist
    if (!this.textOverlayContainer) {
      this.createTextOverlayContainer();
    }

    // Set up text overlay events
    this.currentTextOverlays.forEach(textEvent => {
      const timeout = setTimeout(() => {
        this.displayTextOverlay(textEvent);
      }, textEvent.timestamp * 1000); // Convert to milliseconds

      this.overlayTimeouts.push(timeout);

      // Schedule removal of text overlay
      const removeTimeout = setTimeout(() => {
        this.removeTextOverlay(textEvent);
      }, (textEvent.timestamp + textEvent.duration) * 1000);

      this.overlayTimeouts.push(removeTimeout);
    });
  }

  /**
   * Handles video playback failures with fallback strategies
   */
  async handlePlaybackFailure(): Promise<void> {
    console.warn('Video playback failed, entering fallback mode');
    this.fallbackMode = true;

    // Clear any existing overlays
    this.clearOverlayTimeouts();

    // Display text-only fallback experience
    if (this.textOverlayContainer) {
      this.textOverlayContainer.innerHTML = `
        <div class="video-fallback">
          <div class="fallback-message">
            <p>Video playback is not available.</p>
            <p>Experiencing the moment through text...</p>
          </div>
          <div class="fallback-content">
            ${this.currentTextOverlays.map(event => `
              <div class="fallback-text" style="animation-delay: ${event.timestamp}s">
                ${event.text}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Add CSS for fallback styling
      this.addFallbackStyles();
    }

    // Simulate the duration for consistency
    const fallbackDuration = Math.max(...this.currentTextOverlays.map(e => e.timestamp + e.duration)) * 1000;
    await new Promise(resolve => setTimeout(resolve, fallbackDuration));
  }

  /**
   * Checks if autoplay is respected based on user preferences and browser policies
   * @returns True if autoplay should be respected, false otherwise
   */
  respectAutoplayPreferences(): boolean {
    return this.autoplayAllowed;
  }

  /**
   * Gets the current video element (for external access if needed)
   * @returns Current video element or null
   */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /**
   * Gets the text overlay container (for external styling if needed)
   * @returns Text overlay container or null
   */
  getTextOverlayContainer(): HTMLElement | null {
    return this.textOverlayContainer;
  }

  /**
   * Checks if currently in fallback mode
   * @returns True if in fallback mode
   */
  isInFallbackMode(): boolean {
    return this.fallbackMode;
  }

  /**
   * Cleans up resources and stops playback
   */
  cleanup(): void {
    this.clearOverlayTimeouts();
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.load();
    }

    if (this.textOverlayContainer) {
      this.textOverlayContainer.innerHTML = '';
    }

    this.playbackPromise = null;
    this.fallbackMode = false;
  }

  /**
   * Creates the video element and sets up basic properties
   */
  private createVideoElement(): void {
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'cover';
    this.videoElement.muted = true; // Required for autoplay in most browsers
    this.videoElement.playsInline = true; // Required for mobile Safari
    this.videoElement.controls = false; // Hide default controls
    
    // Add video element to DOM (assuming there's a container)
    const videoContainer = document.getElementById('video-container') || document.body;
    videoContainer.appendChild(this.videoElement);
  }

  /**
   * Creates the text overlay container
   */
  private createTextOverlayContainer(): void {
    this.textOverlayContainer = document.createElement('div');
    this.textOverlayContainer.className = 'text-overlay-container';
    this.textOverlayContainer.style.position = 'absolute';
    this.textOverlayContainer.style.top = '0';
    this.textOverlayContainer.style.left = '0';
    this.textOverlayContainer.style.width = '100%';
    this.textOverlayContainer.style.height = '100%';
    this.textOverlayContainer.style.pointerEvents = 'none';
    this.textOverlayContainer.style.zIndex = '10';

    // Add to the same container as video
    const videoContainer = document.getElementById('video-container') || document.body;
    videoContainer.appendChild(this.textOverlayContainer);
  }

  /**
   * Starts video playback with autoplay handling
   * @returns Promise that resolves when playback completes
   */
  private async startPlayback(): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Video element not available');
    }

    try {
      // Attempt to play the video
      await this.videoElement.play();

      // Wait for video to complete
      return new Promise<void>((resolve, reject) => {
        if (!this.videoElement) {
          reject(new Error('Video element not available'));
          return;
        }

        this.videoElement.onended = () => resolve();
        this.videoElement.onerror = () => reject(new Error('Video playback error'));
      });

    } catch (error) {
      // Handle autoplay restrictions
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.warn('Autoplay blocked by browser policy');
        this.autoplayAllowed = false;
        
        // Provide manual play button
        this.showManualPlayButton();
        throw new Error('Autoplay blocked - manual interaction required');
      }
      
      throw error;
    }
  }

  /**
   * Displays a text overlay at the specified position
   * @param textEvent Text event to display
   */
  private displayTextOverlay(textEvent: TextEvent): void {
    if (!this.textOverlayContainer) {
      return;
    }

    const overlayElement = document.createElement('div');
    overlayElement.className = 'text-overlay';
    overlayElement.textContent = textEvent.text;
    overlayElement.dataset.timestamp = textEvent.timestamp.toString();

    // Apply positioning
    this.applyOverlayPosition(overlayElement, textEvent.position);

    // Add styling
    overlayElement.style.position = 'absolute';
    overlayElement.style.color = 'white';
    overlayElement.style.fontSize = '1.5rem';
    overlayElement.style.fontWeight = 'bold';
    overlayElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    overlayElement.style.opacity = '0';
    overlayElement.style.transition = 'opacity 0.3s ease-in-out';

    this.textOverlayContainer.appendChild(overlayElement);

    // Fade in
    requestAnimationFrame(() => {
      overlayElement.style.opacity = '1';
    });
  }

  /**
   * Removes a text overlay
   * @param textEvent Text event to remove
   */
  private removeTextOverlay(textEvent: TextEvent): void {
    if (!this.textOverlayContainer) {
      return;
    }

    const overlayElement = this.textOverlayContainer.querySelector(
      `[data-timestamp="${textEvent.timestamp}"]`
    ) as HTMLElement;

    if (overlayElement) {
      overlayElement.style.opacity = '0';
      setTimeout(() => {
        if (overlayElement.parentNode) {
          overlayElement.parentNode.removeChild(overlayElement);
        }
      }, 300);
    }
  }

  /**
   * Applies positioning to a text overlay element
   * @param element Element to position
   * @param position Position configuration
   */
  private applyOverlayPosition(element: HTMLElement, position: OverlayPosition): void {
    // Horizontal positioning
    switch (position.alignment) {
      case 'left':
        element.style.left = `${position.x}%`;
        element.style.textAlign = 'left';
        break;
      case 'center':
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        element.style.textAlign = 'center';
        break;
      case 'right':
        element.style.right = `${100 - position.x}%`;
        element.style.textAlign = 'right';
        break;
    }

    // Vertical positioning
    switch (position.verticalAlignment) {
      case 'top':
        element.style.top = `${position.y}%`;
        break;
      case 'middle':
        element.style.top = '50%';
        element.style.transform += ' translateY(-50%)';
        break;
      case 'bottom':
        element.style.bottom = `${100 - position.y}%`;
        break;
    }
  }

  /**
   * Shows a manual play button when autoplay is blocked
   */
  private showManualPlayButton(): void {
    if (!this.textOverlayContainer) {
      return;
    }

    const playButton = document.createElement('button');
    playButton.textContent = '▶ Play Video';
    playButton.className = 'manual-play-button';
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.style.padding = '12px 24px';
    playButton.style.fontSize = '1.2rem';
    playButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '8px';
    playButton.style.cursor = 'pointer';
    playButton.style.zIndex = '20';

    playButton.onclick = async () => {
      try {
        if (this.videoElement) {
          await this.videoElement.play();
          playButton.remove();
        }
      } catch (error) {
        console.error('Manual play failed:', error);
      }
    };

    this.textOverlayContainer.appendChild(playButton);
  }

  /**
   * Clears all overlay timeouts
   */
  private clearOverlayTimeouts(): void {
    this.overlayTimeouts.forEach(timeout => clearTimeout(timeout));
    this.overlayTimeouts = [];
  }

  /**
   * Detects autoplay support in the current browser
   */
  private async detectAutoplaySupport(): Promise<void> {
    try {
      const video = document.createElement('video');
      video.muted = true;
      video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBNIGEzZjRhMDMgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDE2IC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MSByZWY9MyBkZWJsb2NrPTE6MDowIGFuYWx5c2U9MHgzOjB4MTEzIG1lPWhleCBzdWJtZT03IHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0xIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MiBrZXlpbnQ9MjUwIGtleWludF9taW49MjUgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAFZZYiEACD/2lu4BjCEQNlBs4hEAAC7jLEgAAAwzxrmkJlS9dNAFBVAYBwABp4QEByFMkQFHUBwHAA=';
      
      await video.play();
      this.autoplayAllowed = true;
    } catch {
      this.autoplayAllowed = false;
    }
  }

  /**
   * Adds CSS styles for fallback mode
   */
  private addFallbackStyles(): void {
    const styleId = 'video-player-fallback-styles';
    
    // Don't add styles if they already exist
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .video-fallback {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 2rem;
      }

      .fallback-message {
        margin-bottom: 2rem;
        opacity: 0;
        animation: fadeIn 1s ease-in-out forwards;
      }

      .fallback-content {
        max-width: 600px;
      }

      .fallback-text {
        font-size: 1.5rem;
        margin: 1rem 0;
        opacity: 0;
        animation: fadeInUp 1s ease-in-out forwards;
      }

      @keyframes fadeIn {
        to { opacity: 1; }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Factory function to create VideoPlayer instance
 * @returns New VideoPlayer instance
 */
export function createVideoPlayer(): VideoPlayer {
  return new VideoPlayerImpl();
}

/**
 * Default video configuration for the Valentine's Day webpage
 */
export const DEFAULT_VIDEO_CONFIG = {
  filePath: './Untitled video - Made with Clipchamp.mp4',
  targetDuration: 8, // 8 seconds as specified in requirements
  textOverlays: [
    {
      timestamp: 1.0,
      text: 'A moment captured...',
      duration: 2.0,
      position: {
        x: 50,
        y: 20,
        alignment: 'center' as const,
        verticalAlignment: 'top' as const
      }
    },
    {
      timestamp: 4.0,
      text: 'Just for you',
      duration: 2.5,
      position: {
        x: 50,
        y: 80,
        alignment: 'center' as const,
        verticalAlignment: 'bottom' as const
      }
    }
  ],
  fallbackContent: 'A special moment shared between us',
  accessibilityDescription: 'A short video expressing romantic sentiment',
  networkOptimization: {
    mobileQuality: './Untitled video - Made with Clipchamp.mp4', // Same file for now
    throttledFallback: 'text-only',
    preloadStrategy: 'conservative' as const
  }
};