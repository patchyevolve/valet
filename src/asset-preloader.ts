/**
 * Asset Preloader Component for Valentine's Day Interactive Webpage
 * Handles preloading of video, image, and audio assets with progress tracking and fallback strategies
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */

import { Asset, AssetPreloader, PreloadResult, FallbackStrategy } from './types/components.js';

export class AssetPreloaderImpl implements AssetPreloader {
  private loadingProgress: number = 0;
  private loadedAssets: Asset[] = [];
  private failedAssets: Asset[] = [];
  private totalAssets: number = 0;
  private startTime: number = 0;

  /**
   * Preloads a list of assets with progress tracking and failure handling
   * @param assetList Array of assets to preload
   * @returns Promise resolving to preload results
   */
  async preloadAssets(assetList: Asset[]): Promise<PreloadResult> {
    this.startTime = Date.now();
    this.totalAssets = assetList.length;
    this.loadingProgress = 0;
    this.loadedAssets = [];
    this.failedAssets = [];

    if (assetList.length === 0) {
      this.loadingProgress = 100; // Set progress to 100% for empty list
      return {
        success: true,
        loadedAssets: [],
        failedAssets: [],
        totalLoadTime: 0
      };
    }

    // Sort assets by priority (critical first, then high, then normal)
    const sortedAssets = this.sortAssetsByPriority(assetList);
    
    // Load assets with appropriate strategies
    const loadPromises = sortedAssets.map(asset => this.loadSingleAsset(asset));
    
    // Wait for all assets to complete (either success or failure)
    await Promise.allSettled(loadPromises);
    
    const totalLoadTime = Date.now() - this.startTime;
    const success = this.failedAssets.length === 0 || this.hasCriticalAssetsLoaded();

    return {
      success,
      loadedAssets: [...this.loadedAssets],
      failedAssets: [...this.failedAssets],
      totalLoadTime
    };
  }

  /**
   * Gets current loading progress as percentage (0-100)
   * @returns Current loading progress
   */
  getLoadingProgress(): number {
    return this.loadingProgress;
  }

  /**
   * Determines fallback strategy for failed asset loading
   * @param asset The asset that failed to load
   * @returns Fallback strategy to use
   */
  handleLoadingFailure(asset: Asset): FallbackStrategy {
    // Critical assets should be retried
    if (asset.priority === 'critical') {
      return 'retry';
    }
    
    // High priority assets with fallbacks should use alternative
    if (asset.priority === 'high' && asset.fallback) {
      return 'alternative';
    }
    
    // Normal priority assets can be skipped
    return 'skip';
  }

  /**
   * Sorts assets by priority for optimal loading order
   * @param assets Array of assets to sort
   * @returns Sorted array with critical assets first
   */
  private sortAssetsByPriority(assets: Asset[]): Asset[] {
    const priorityOrder = { 'critical': 0, 'high': 1, 'normal': 2 };
    return [...assets].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Loads a single asset with appropriate loading strategy based on type
   * @param asset Asset to load
   * @returns Promise that resolves when loading completes (success or failure)
   */
  private async loadSingleAsset(asset: Asset): Promise<void> {
    try {
      switch (asset.type) {
        case 'video':
          await this.loadVideoAsset(asset);
          break;
        case 'image':
          await this.loadImageAsset(asset);
          break;
        case 'audio':
          await this.loadAudioAsset(asset);
          break;
        default:
          throw new Error(`Unsupported asset type: ${asset.type}`);
      }
      
      this.loadedAssets.push(asset);
      this.updateProgress();
      
    } catch (error) {
      console.warn(`Failed to load asset: ${asset.url}`, error);
      
      const fallbackStrategy = this.handleLoadingFailure(asset);
      const recovered = await this.attemptRecovery(asset, fallbackStrategy);
      
      if (!recovered) {
        this.failedAssets.push(asset);
      }
      
      this.updateProgress();
    }
  }

  /**
   * Loads a video asset using HTML5 video element
   * @param asset Video asset to load
   */
  private async loadVideoAsset(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const timeout = setTimeout(() => {
        reject(new Error(`Video loading timeout: ${asset.url}`));
      }, 10000); // 10 second timeout
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Video loading error: ${asset.url}`));
      };
      
      video.src = asset.url;
    });
  }

  /**
   * Loads an image asset using Image object
   * @param asset Image asset to load
   */
  private async loadImageAsset(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error(`Image loading timeout: ${asset.url}`));
      }, 5000); // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Image loading error: ${asset.url}`));
      };
      
      img.src = asset.url;
    });
  }

  /**
   * Loads an audio asset using Audio object
   * @param asset Audio asset to load
   */
  private async loadAudioAsset(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      const timeout = setTimeout(() => {
        reject(new Error(`Audio loading timeout: ${asset.url}`));
      }, 8000); // 8 second timeout
      
      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      audio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Audio loading error: ${asset.url}`));
      };
      
      audio.src = asset.url;
    });
  }

  /**
   * Attempts to recover from asset loading failure using fallback strategy
   * @param asset Original asset that failed
   * @param strategy Fallback strategy to use
   * @returns Promise resolving to true if recovery succeeded
   */
  private async attemptRecovery(asset: Asset, strategy: FallbackStrategy): Promise<boolean> {
    switch (strategy) {
      case 'retry':
        try {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.loadSingleAsset(asset);
          return true;
        } catch {
          return false;
        }
        
      case 'alternative':
        if (asset.fallback) {
          try {
            const fallbackAsset: Asset = {
              ...asset,
              url: asset.fallback
              // Remove fallback property to prevent infinite loops
            };
            delete (fallbackAsset as any).fallback;
            await this.loadSingleAsset(fallbackAsset);
            this.loadedAssets.push(fallbackAsset);
            return true;
          } catch {
            return false;
          }
        }
        return false;
        
      case 'skip':
        // Gracefully skip the asset
        console.info(`Skipping failed asset: ${asset.url}`);
        return true; // Consider this a successful recovery
        
      default:
        return false;
    }
  }

  /**
   * Updates the loading progress based on completed assets
   */
  private updateProgress(): void {
    const completedAssets = this.loadedAssets.length + this.failedAssets.length;
    this.loadingProgress = this.totalAssets > 0 ? (completedAssets / this.totalAssets) * 100 : 100;
  }

  /**
   * Checks if all critical assets have been loaded successfully
   * @returns True if all critical assets loaded, false otherwise
   */
  private hasCriticalAssetsLoaded(): boolean {
    const criticalAssets = this.loadedAssets.filter(asset => asset.priority === 'critical');
    const failedCriticalAssets = this.failedAssets.filter(asset => asset.priority === 'critical');
    
    // If there are no critical assets, consider it successful
    if (criticalAssets.length === 0 && failedCriticalAssets.length === 0) {
      return true;
    }
    
    // Success if no critical assets failed
    return failedCriticalAssets.length === 0;
  }
}

/**
 * Factory function to create AssetPreloader instance
 * @returns New AssetPreloader instance
 */
export function createAssetPreloader(): AssetPreloader {
  return new AssetPreloaderImpl();
}

/**
 * Default asset configuration for the Valentine's Day webpage
 * Based on requirements and available assets
 */
export const DEFAULT_ASSETS: Asset[] = [
  {
    url: './Untitled video - Made with Clipchamp.mp4',
    type: 'video',
    priority: 'critical'
    // No fallback for the main video
  }
  // Additional assets can be added here as they are created
  // Images, audio files, etc.
];