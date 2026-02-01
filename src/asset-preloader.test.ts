/**
 * Tests for Asset Preloader Component
 * Validates asset loading, progress tracking, and failure handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetPreloaderImpl, createAssetPreloader, DEFAULT_ASSETS } from './asset-preloader.js';
import { Asset, PreloadResult, FallbackStrategy } from './types/components.js';

describe('AssetPreloader', () => {
  let preloader: AssetPreloaderImpl;

  beforeEach(() => {
    preloader = new AssetPreloaderImpl();
    // Reset any global mocks
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with zero progress', () => {
      expect(preloader.getLoadingProgress()).toBe(0);
    });

    it('should handle empty asset list', async () => {
      const result = await preloader.preloadAssets([]);
      
      expect(result.success).toBe(true);
      expect(result.loadedAssets).toHaveLength(0);
      expect(result.failedAssets).toHaveLength(0);
      expect(result.totalLoadTime).toBeGreaterThanOrEqual(0);
    });

    it('should return 100% progress for empty asset list', async () => {
      await preloader.preloadAssets([]);
      expect(preloader.getLoadingProgress()).toBe(100);
    });
  });

  describe('Fallback Strategy Logic', () => {
    it('should retry critical assets', () => {
      const criticalAsset: Asset = {
        url: 'test.mp4',
        type: 'video',
        priority: 'critical'
      };
      
      expect(preloader.handleLoadingFailure(criticalAsset)).toBe('retry');
    });

    it('should use alternative for high priority assets with fallback', () => {
      const highPriorityAsset: Asset = {
        url: 'test.jpg',
        type: 'image',
        priority: 'high',
        fallback: 'fallback.jpg'
      };
      
      expect(preloader.handleLoadingFailure(highPriorityAsset)).toBe('alternative');
    });

    it('should skip normal priority assets', () => {
      const normalAsset: Asset = {
        url: 'test.png',
        type: 'image',
        priority: 'normal'
      };
      
      expect(preloader.handleLoadingFailure(normalAsset)).toBe('skip');
    });

    it('should skip high priority assets without fallback', () => {
      const highPriorityAssetNoFallback: Asset = {
        url: 'test.jpg',
        type: 'image',
        priority: 'high'
      };
      
      expect(preloader.handleLoadingFailure(highPriorityAssetNoFallback)).toBe('skip');
    });
  });

  describe('Factory Function', () => {
    it('should create AssetPreloader instance', () => {
      const instance = createAssetPreloader();
      expect(instance).toBeDefined();
      expect(typeof instance.preloadAssets).toBe('function');
      expect(typeof instance.getLoadingProgress).toBe('function');
      expect(typeof instance.handleLoadingFailure).toBe('function');
    });
  });

  describe('Default Assets Configuration', () => {
    it('should include the main video asset', () => {
      expect(DEFAULT_ASSETS).toHaveLength(1);
      expect(DEFAULT_ASSETS[0].url).toBe('./Untitled video - Made with Clipchamp.mp4');
      expect(DEFAULT_ASSETS[0].type).toBe('video');
      expect(DEFAULT_ASSETS[0].priority).toBe('critical');
    });
  });

  describe('Asset Priority Sorting', () => {
    it('should process assets in priority order', async () => {
      const assets: Asset[] = [
        { url: 'normal.jpg', type: 'image', priority: 'normal' },
        { url: 'critical.mp4', type: 'video', priority: 'critical' },
        { url: 'high.png', type: 'image', priority: 'high' }
      ];

      // Mock the loading methods to track order
      const loadOrder: string[] = [];
      const originalLoadSingleAsset = (preloader as any).loadSingleAsset;
      
      vi.spyOn(preloader as any, 'loadSingleAsset').mockImplementation(async (...args: any[]) => {
        const asset = args[0] as Asset;
        loadOrder.push(asset.priority);
        // Simulate successful loading
        (preloader as any).loadedAssets.push(asset);
        (preloader as any).updateProgress();
      });

      await preloader.preloadAssets(assets);
      
      // Should process in order: critical, high, normal
      expect(loadOrder).toEqual(['critical', 'high', 'normal']);
    });
  });

  describe('Progress Tracking', () => {
    it('should update progress correctly during loading', async () => {
      const assets: Asset[] = [
        { url: 'test1.jpg', type: 'image', priority: 'normal' },
        { url: 'test2.jpg', type: 'image', priority: 'normal' }
      ];

      let progressValues: number[] = [];
      
      // Mock loadSingleAsset to track progress updates
      vi.spyOn(preloader as any, 'loadSingleAsset').mockImplementation(async (...args: any[]) => {
        const asset = args[0] as Asset;
        (preloader as any).loadedAssets.push(asset);
        (preloader as any).updateProgress();
        progressValues.push(preloader.getLoadingProgress());
      });

      await preloader.preloadAssets(assets);
      
      // Should have progress values of 50% and 100%
      expect(progressValues).toEqual([50, 100]);
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported asset types gracefully', async () => {
      const unsupportedAsset: Asset = {
        url: 'test.unknown',
        type: 'video' as any, // Force type to avoid TS error
        priority: 'normal'
      };

      // Mock loadSingleAsset to throw for unsupported type
      vi.spyOn(preloader as any, 'loadSingleAsset').mockImplementation(async () => {
        throw new Error('Unsupported asset type');
      });

      const result = await preloader.preloadAssets([unsupportedAsset]);
      
      expect(result.success).toBe(true); // Should still succeed due to skip strategy
      expect(result.failedAssets).toHaveLength(0); // Failed asset should be recovered via skip
    });
  });
});