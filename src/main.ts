/**
 * Main entry point for Valentine's Day interactive webpage
 * Initializes the application and state machine
 */

import { StateMachineController } from './state-machine-controller.js';
import { StateType } from './types/state-machine.js';
import { createAssetPreloader, DEFAULT_ASSETS } from './asset-preloader.js';
import { AssetPreloader } from './types/components.js';
import { DecisionHandler } from './decision-handler.js';

// Application initialization
class ValentineApp {
  private initialized = false;
  private stateMachine: StateMachineController;
  private assetPreloader: AssetPreloader;
  private decisionHandler: DecisionHandler;

  constructor() {
    this.stateMachine = new StateMachineController();
    this.assetPreloader = createAssetPreloader();
    this.decisionHandler = new DecisionHandler();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing Valentine\'s Day Interactive Webpage...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize core components (will be implemented in future tasks)
      await this.initializeComponents();
      
      this.initialized = true;
      console.log('Application initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.handleInitializationError(error);
    }
  }

  private async initializeComponents(): Promise<void> {
    // Initialize State Machine Controller (Task 2.1 - COMPLETED)
    console.log('State Machine Controller initialized');
    console.log('Current state:', this.stateMachine.currentState);
    
    // Verify state machine is working by checking initial state
    if (this.stateMachine.currentState !== StateType.PAGE_LOAD) {
      throw new Error('State machine not initialized to correct initial state');
    }
    
    // Initialize Asset Preloader (Task 3.1 - COMPLETED)
    console.log('Starting asset preloading...');
    this.updateLoadingStatus('Loading assets...');
    
    const preloadResult = await this.assetPreloader.preloadAssets(DEFAULT_ASSETS);
    
    if (preloadResult.success) {
      console.log(`Asset preloading completed successfully in ${preloadResult.totalLoadTime}ms`);
      console.log(`Loaded ${preloadResult.loadedAssets.length} assets`);
      if (preloadResult.failedAssets.length > 0) {
        console.warn(`${preloadResult.failedAssets.length} assets failed to load but were handled gracefully`);
      }
    } else {
      console.error('Critical asset preloading failed');
      throw new Error('Failed to load critical assets');
    }
    
    // Placeholder for remaining component initialization
    // This will be implemented in subsequent tasks:
    // - Visual Effects Controllers (Task 5)
    // - Text and Content Management (Task 6)
    // - Video Player (Task 7)
    // - Decision Handler (Task 9) - COMPLETED
    // - Accessibility Controller (Task 10)
    
    // Initialize Decision Handler (Task 9.1 - COMPLETED)
    this.initializeDecisionHandler();
    
    console.log('Asset Preloader and Decision Handler ready. Remaining components will be initialized in subsequent tasks');
    
    // For now, just show that the basic structure is working
    this.showLoadingComplete();
  }

  private updateLoadingStatus(message: string): void {
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.textContent = message;
    }
  }

  private showLoadingComplete(): void {
    const loadingElement = document.getElementById('loading');
    const loadingStatus = document.getElementById('loading-status');
    
    if (loadingElement && loadingStatus) {
      loadingStatus.textContent = 'Application structure and assets loaded successfully';
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 1000);
    }
  }

  private initializeDecisionHandler(): void {
    // Set up callbacks for decision handling
    this.decisionHandler.setYesCallback(async () => {
      console.log('User selected Yes path - transitioning to Confirmation State');
      await this.stateMachine.transitionTo(StateType.CONFIRMATION_STATE);
    });

    this.decisionHandler.setGentleExitCallback(async () => {
      console.log('User selected Gentle Exit - transitioning to Gentle Exit State');
      await this.stateMachine.transitionTo(StateType.GENTLE_EXIT_STATE);
    });

    // Register state handler for decision state
    this.stateMachine.registerStateHandler(StateType.DECISION_STATE, async () => {
      console.log('Entering Decision State - presenting choices');
      
      const decisionOptions = [
        {
          id: 'yes',
          text: 'Yes, I feel the same way',
          action: async () => await this.decisionHandler.handleYesPath(),
          emotionalSafety: true
        },
        {
          id: 'gentle-exit',
          text: 'I need some time to think',
          action: async () => await this.decisionHandler.handleGentleExit(),
          emotionalSafety: true
        }
      ];

      this.decisionHandler.presentChoices(decisionOptions);
      this.decisionHandler.preserveEmotionalSafety();
    });

    console.log('Decision Handler initialized with emotional safety preserved');
  }

  private handleInitializationError(error: unknown): void {
    const loadingElement = document.getElementById('loading');
    const loadingStatus = document.getElementById('loading-status');
    
    if (loadingElement && loadingStatus) {
      loadingElement.innerHTML = `
        <p>Sorry, there was an error loading the experience.</p>
        <p>Please refresh the page to try again.</p>
      `;
      loadingStatus.textContent = 'Application failed to load';
    }
    
    console.error('Initialization error details:', error);
  }

  // Expose asset preloader for testing and debugging
  getAssetPreloader(): AssetPreloader {
    return this.assetPreloader;
  }

  // Expose decision handler for testing and debugging
  getDecisionHandler(): DecisionHandler {
    return this.decisionHandler;
  }
}

// Initialize the application
const app = new ValentineApp();
app.initialize().catch(error => {
  console.error('Critical application error:', error);
});

// Export for testing purposes
export { ValentineApp, StateMachineController };