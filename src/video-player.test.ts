/**
 * Tests for Video Player Component
 * Validates video loading, playback control, temporal stretching, and text overlay synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VideoPlayerImpl, createVideoPlayer, DEFAULT_VIDEO_CONFIG } from './video-player.js';
import { TextEvent } from './types/components.js';

// Mock DOM elements and APIs
const mockVideoElement = {
  src: '',
  preload: '',
  style: {},
  muted: false,
  playsInline: false,
  controls: false,
  duration: 10, // Default valid duration
  currentTime: 0,
  playbackRate: 1,
  onloadedmetadata: null as (() => void) | null,
  onerror: null as (() => void) | null,
  onended: null as (() => void) | null,
  load: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn()
};

const mockTextOverlayContainer = {
  className: '',
  style: {},
  innerHTML: '',
  appendChild: vi.fn(),
  querySelector: vi.fn(),
  parentNode: null,
  dataset: {} // Add dataset property
};

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'video') {
        return mockVideoElement;
      }
      if (tagName === 'div' || tagName === 'button') {
        return {
          ...mockTextOverlayContainer,
          dataset: {} // Ensure dataset is always available
        };
      }
      return {};
    }),
    getElementById: vi.fn().mockReturnValue(null),
    head: {
      appendChild: vi.fn()
    },
    body: {
      appendChild: vi.fn()
    }
  },
  writable: true
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: vi.fn((callback: () => void) => {
    setTimeout(callback, 16);
    return 1;
  }),
  writable: true
});

// Use real setTimeout for proper async behavior
Object.defineProperty(global, 'clearTimeout', {
  value: vi.fn(),
  writable: true
});

describe('VideoPlayerImpl', () => {
  let videoPlayer: VideoPlayerImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock video element state
    mockVideoElement.duration = 10;
    mockVideoElement.play.mockResolvedValue(undefined);
    videoPlayer = new VideoPlayerImpl();
  });

  afterEach(() => {
    videoPlayer.cleanup();
  });

  describe('loadVideo', () => {
    it('should load video successfully', async () => {
      const videoPath = './test-video.mp4';
      
      // Simulate successful loading immediately
      const loadPromise = videoPlayer.loadVideo(videoPath);
      
      // Trigger the success callback
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata();
      }

      await expect(loadPromise).resolves.toBeUndefined();
      expect(mockVideoElement.src).toBe(videoPath);
      expect(mockVideoElement.preload).toBe('metadata');
    });

    it('should handle video loading errors', async () => {
      const videoPath = './invalid-video.mp4';
      
      // Simulate loading error immediately
      const loadPromise = videoPlayer.loadVideo(videoPath);
      
      // Trigger the error callback
      if (mockVideoElement.onerror) {
        mockVideoElement.onerror();
      }

      await expect(loadPromise).rejects.toThrow('Video loading error');
    });

    it('should handle video loading timeout', async () => {
      const videoPath = './slow-video.mp4';
      
      // Don't trigger any callbacks to simulate timeout - but use a shorter timeout for testing
      vi.useFakeTimers();
      const loadPromise = videoPlayer.loadVideo(videoPath);
      
      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(10000);
      
      await expect(loadPromise).rejects.toThrow('Video loading timeout');
      vi.useRealTimers();
    });
  });

  describe('playWithDuration', () => {
    beforeEach(async () => {
      // Load video first
      const loadPromise = videoPlayer.loadVideo('./test-video.mp4');
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata();
      }
      await loadPromise;
    });

    it('should play video with correct temporal stretching', async () => {
      const targetDuration = 8;
      mockVideoElement.duration = 10; // Original duration
      
      // Simulate video ending immediately
      const playPromise = videoPlayer.playWithDuration(targetDuration);
      
      // Trigger the onended callback immediately
      setTimeout(() => {
        if (mockVideoElement.onended) {
          mockVideoElement.onended();
        }
      }, 0);

      await playPromise;
      
      // Check temporal stretching calculation: 10s / 8s = 1.25x speed
      expect(mockVideoElement.playbackRate).toBe(1.25);
      expect(mockVideoElement.currentTime).toBe(0);
      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it('should clamp playback rate within valid range', async () => {
      const targetDuration = 1; // Very short duration
      mockVideoElement.duration = 10;
      
      const playPromise = videoPlayer.playWithDuration(targetDuration);
      
      // Trigger the onended callback immediately
      setTimeout(() => {
        if (mockVideoElement.onended) {
          mockVideoElement.onended();
        }
      }, 0);

      await playPromise;
      
      // Should clamp to maximum 4x speed
      expect(mockVideoElement.playbackRate).toBe(4.0);
    });

    it('should handle invalid video duration', async () => {
      mockVideoElement.duration = NaN;
      
      await expect(videoPlayer.playWithDuration(8)).rejects.toThrow('Invalid video duration');
    });

    it('should handle playback errors', async () => {
      mockVideoElement.play.mockRejectedValue(new Error('Playback failed'));
      
      await expect(videoPlayer.playWithDuration(8)).rejects.toThrow('Playback failed');
    });
  });

  describe('synchronizeTextOverlay', () => {
    const testTextEvents: TextEvent[] = [
      {
        timestamp: 1.0,
        text: 'First overlay',
        duration: 2.0,
        position: {
          x: 50,
          y: 20,
          alignment: 'center',
          verticalAlignment: 'top'
        }
      },
      {
        timestamp: 4.0,
        text: 'Second overlay',
        duration: 1.5,
        position: {
          x: 30,
          y: 80,
          alignment: 'left',
          verticalAlignment: 'bottom'
        }
      }
    ];

    it('should set up text overlay synchronization', () => {
      // Clear previous calls
      vi.clearAllMocks();
      
      // First load a video to create the video element
      const loadPromise = videoPlayer.loadVideo('./test-video.mp4');
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata();
      }
      
      videoPlayer.synchronizeTextOverlay(testTextEvents);
      
      // Should have created overlay container (div element)
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    it('should handle empty text events array', () => {
      expect(() => {
        videoPlayer.synchronizeTextOverlay([]);
      }).not.toThrow();
    });
  });

  describe('handlePlaybackFailure', () => {
    it('should enter fallback mode on playback failure', async () => {
      const testTextEvents: TextEvent[] = [
        {
          timestamp: 1.0,
          text: 'Fallback text',
          duration: 2.0,
          position: {
            x: 50,
            y: 50,
            alignment: 'center',
            verticalAlignment: 'middle'
          }
        }
      ];

      videoPlayer.synchronizeTextOverlay(testTextEvents);
      await videoPlayer.handlePlaybackFailure();
      
      expect(videoPlayer.isInFallbackMode()).toBe(true);
    });
  });

  describe('respectAutoplayPreferences', () => {
    it('should return autoplay preference status', () => {
      const result = videoPlayer.respectAutoplayPreferences();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('cleanup', () => {
    it('should clean up resources properly', async () => {
      // First load a video to create the video element
      const loadPromise = videoPlayer.loadVideo('./test-video.mp4');
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata();
      }
      await loadPromise;
      
      videoPlayer.cleanup();
      
      expect(mockVideoElement.pause).toHaveBeenCalled();
      expect(mockVideoElement.src).toBe('');
      expect(mockVideoElement.load).toHaveBeenCalled();
    });
  });

  describe('getVideoElement', () => {
    it('should return video element after loading', async () => {
      const loadPromise = videoPlayer.loadVideo('./test-video.mp4');
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata();
      }
      await loadPromise;
      
      const element = videoPlayer.getVideoElement();
      expect(element).toBeTruthy();
    });

    it('should return null before loading', () => {
      const element = videoPlayer.getVideoElement();
      expect(element).toBeNull();
    });
  });
});

describe('createVideoPlayer', () => {
  it('should create a VideoPlayer instance', () => {
    const player = createVideoPlayer();
    expect(player).toBeInstanceOf(VideoPlayerImpl);
  });
});

describe('DEFAULT_VIDEO_CONFIG', () => {
  it('should have correct default configuration', () => {
    expect(DEFAULT_VIDEO_CONFIG.filePath).toBe('./Untitled video - Made with Clipchamp.mp4');
    expect(DEFAULT_VIDEO_CONFIG.targetDuration).toBe(8);
    expect(DEFAULT_VIDEO_CONFIG.textOverlays).toHaveLength(2);
    expect(DEFAULT_VIDEO_CONFIG.fallbackContent).toBeTruthy();
    expect(DEFAULT_VIDEO_CONFIG.accessibilityDescription).toBeTruthy();
    expect(DEFAULT_VIDEO_CONFIG.networkOptimization).toBeTruthy();
  });

  it('should have properly formatted text overlays', () => {
    const overlays = DEFAULT_VIDEO_CONFIG.textOverlays;
    
    overlays.forEach(overlay => {
      expect(overlay.timestamp).toBeGreaterThanOrEqual(0);
      expect(overlay.duration).toBeGreaterThan(0);
      expect(overlay.text).toBeTruthy();
      expect(overlay.position).toBeTruthy();
      expect(['left', 'center', 'right']).toContain(overlay.position.alignment);
      expect(['top', 'middle', 'bottom']).toContain(overlay.position.verticalAlignment);
    });
  });
});

// Edge case tests
describe('VideoPlayerImpl Edge Cases', () => {
  let videoPlayer: VideoPlayerImpl;

  beforeEach(() => {
    videoPlayer = new VideoPlayerImpl();
  });

  afterEach(() => {
    videoPlayer.cleanup();
  });

  it('should handle autoplay blocked by browser policy', async () => {
    // Mock DOMException for autoplay blocking
    const autoplayError = new DOMException('Autoplay blocked', 'NotAllowedError');
    
    const loadPromise = videoPlayer.loadVideo('./test-video.mp4');
    if (mockVideoElement.onloadedmetadata) {
      mockVideoElement.onloadedmetadata();
    }
    await loadPromise;
    
    // Set up the play method to reject with autoplay error
    mockVideoElement.play.mockRejectedValue(autoplayError);
    
    await expect(videoPlayer.playWithDuration(8)).rejects.toThrow('Autoplay blocked');
    expect(videoPlayer.respectAutoplayPreferences()).toBe(false);
  });

  it('should handle missing video container gracefully', async () => {
    // Mock getElementById to return null (no container)
    (document.getElementById as any).mockReturnValue(null);
    
    const loadPromise = videoPlayer.loadVideo('./test-video.mp4');
    if (mockVideoElement.onloadedmetadata) {
      mockVideoElement.onloadedmetadata();
    }

    // Should not throw error even without container
    await expect(loadPromise).resolves.toBeUndefined();
  });

  it('should handle text overlay positioning edge cases', () => {
    const edgeCaseOverlays: TextEvent[] = [
      {
        timestamp: 0,
        text: 'Edge case overlay',
        duration: 1,
        position: {
          x: 0,
          y: 0,
          alignment: 'left',
          verticalAlignment: 'top'
        }
      },
      {
        timestamp: 1,
        text: 'Another edge case',
        duration: 1,
        position: {
          x: 100,
          y: 100,
          alignment: 'right',
          verticalAlignment: 'bottom'
        }
      }
    ];

    expect(() => {
      videoPlayer.synchronizeTextOverlay(edgeCaseOverlays);
    }).not.toThrow();
  });
});