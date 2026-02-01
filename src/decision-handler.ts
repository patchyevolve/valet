/**
 * Decision Handler Component for Valentine's Day interactive webpage
 * Implements Requirements 8.1, 8.2, 8.3, 8.4 - Decision handling with emotional safety
 */

import { DecisionHandler as IDecisionHandler, DecisionOption } from './types/components.js';

export class DecisionHandler implements IDecisionHandler {
  private container: HTMLElement | null = null;
  private onYesCallback: (() => Promise<void>) | null = null;
  private onGentleExitCallback: (() => Promise<void>) | null = null;
  private isPresented: boolean = false;

  constructor(container?: HTMLElement) {
    this.container = container || document.body;
  }

  /**
   * Requirement 8.1: Display a single CTA button
   * Requirement 8.3: Provide Gentle Exit option that preserves emotional safety
   * Requirement 8.4: Never force user interaction or create pressure for specific choices
   */
  presentChoices(options: DecisionOption[]): void {
    if (this.isPresented) {
      this.clearChoices();
    }

    // Create decision container with emotional safety design
    const decisionContainer = document.createElement('div');
    decisionContainer.className = 'decision-container';
    decisionContainer.setAttribute('role', 'region');
    decisionContainer.setAttribute('aria-label', 'Decision options');
    
    // Apply pressure-free styling
    decisionContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      padding: 2rem;
      max-width: 400px;
      margin: 0 auto;
      text-align: center;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    `;

    // Create main CTA button (Yes path)
    const yesOption = options.find(opt => opt.id === 'yes');
    if (yesOption) {
      const ctaButton = this.createCTAButton(yesOption);
      decisionContainer.appendChild(ctaButton);
    }

    // Create gentle exit option
    const gentleExitOption = options.find(opt => opt.id === 'gentle-exit');
    if (gentleExitOption) {
      const gentleExitElement = this.createGentleExitOption(gentleExitOption);
      decisionContainer.appendChild(gentleExitElement);
    }

    // Add supportive messaging
    const supportMessage = document.createElement('p');
    supportMessage.className = 'support-message';
    supportMessage.textContent = 'Take your time. There\'s no pressure here.';
    supportMessage.style.cssText = `
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin-top: 1rem;
      font-style: italic;
    `;
    decisionContainer.appendChild(supportMessage);

    this.container?.appendChild(decisionContainer);
    
    // Animate in with gentle fade
    requestAnimationFrame(() => {
      decisionContainer.style.opacity = '1';
      decisionContainer.style.transform = 'translateY(0)';
    });

    this.isPresented = true;
  }

  /**
   * Requirement 8.2: Handle Yes path transition to Confirmation State
   */
  async handleYesPath(): Promise<void> {
    if (this.onYesCallback) {
      try {
        await this.onYesCallback();
      } catch (error) {
        console.error('Error in yes path callback:', error);
        // Don't re-throw to maintain emotional safety
      }
    }
    this.clearChoices();
  }

  /**
   * Requirement 8.3: Handle Gentle Exit with emotional safety
   * Requirement 8.4: Provide supportive messaging without guilt
   */
  async handleGentleExit(): Promise<void> {
    if (this.onGentleExitCallback) {
      try {
        await this.onGentleExitCallback();
      } catch (error) {
        console.error('Error in gentle exit callback:', error);
        // Don't re-throw to maintain emotional safety
      }
    }
    this.clearChoices();
  }

  /**
   * Requirement 8.4: Preserve emotional safety throughout interaction
   */
  preserveEmotionalSafety(): void {
    // Ensure no pressure tactics are used
    const pressureElements = this.container?.querySelectorAll('.pressure-tactic');
    pressureElements?.forEach(element => element.remove());

    // Add supportive messaging if not present
    if (!this.container?.querySelector('.support-message')) {
      const supportMessage = document.createElement('div');
      supportMessage.className = 'support-message';
      supportMessage.textContent = 'Your feelings are valid, whatever you choose.';
      supportMessage.style.cssText = `
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        padding: 1rem;
        font-size: 0.9rem;
        font-style: italic;
      `;
      this.container?.appendChild(supportMessage);
    }
  }

  /**
   * Requirement 8.4: Ensure no pressure tactics are used
   */
  avoidPressureTactics(): boolean {
    // Check for pressure-inducing elements or text
    const pressureIndicators = [
      'limited time',
      'act now',
      'don\'t miss out',
      'hurry',
      'urgent',
      'last chance'
    ];

    const containerText = this.container?.textContent?.toLowerCase() || '';
    const hasPressureTactics = pressureIndicators.some(indicator => 
      containerText.includes(indicator)
    );

    return !hasPressureTactics;
  }

  /**
   * Set callback for Yes path selection
   */
  setYesCallback(callback: () => Promise<void>): void {
    this.onYesCallback = callback;
  }

  /**
   * Set callback for Gentle Exit selection
   */
  setGentleExitCallback(callback: () => Promise<void>): void {
    this.onGentleExitCallback = callback;
  }

  /**
   * Clear all presented choices
   */
  private clearChoices(): void {
    const decisionContainer = this.container?.querySelector('.decision-container');
    if (decisionContainer) {
      decisionContainer.remove();
    }
    this.isPresented = false;
  }

  /**
   * Create the main CTA button with emotional safety design
   */
  private createCTAButton(option: DecisionOption): HTMLElement {
    const button = document.createElement('button');
    button.className = 'cta-button';
    button.textContent = option.text;
    button.setAttribute('aria-label', `${option.text} - Continue to confirmation`);
    
    // Style with warmth but no pressure
    button.style.cssText = `
      background: linear-gradient(135deg, #ff6b9d, #ff8fab);
      border: none;
      border-radius: 25px;
      color: white;
      font-size: 1.1rem;
      font-weight: 500;
      padding: 12px 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      min-width: 200px;
    `;

    // Add gentle hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(255, 107, 157, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(255, 107, 157, 0.3)';
    });

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      button.disabled = true;
      button.style.opacity = '0.7';
      
      try {
        await option.action();
      } catch (error) {
        console.error('Error handling yes path:', error);
        button.disabled = false;
        button.style.opacity = '1';
      }
    });

    return button;
  }

  /**
   * Create gentle exit option with supportive messaging
   */
  private createGentleExitOption(option: DecisionOption): HTMLElement {
    const exitContainer = document.createElement('div');
    exitContainer.className = 'gentle-exit-container';
    
    const exitLink = document.createElement('button');
    exitLink.className = 'gentle-exit-link';
    exitLink.textContent = option.text;
    exitLink.setAttribute('aria-label', `${option.text} - Exit gracefully`);
    
    // Style as subtle, supportive option
    exitLink.style.cssText = `
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      text-decoration: underline;
      cursor: pointer;
      transition: color 0.3s ease;
      padding: 8px 16px;
    `;

    exitLink.addEventListener('mouseenter', () => {
      exitLink.style.color = 'rgba(255, 255, 255, 0.9)';
    });

    exitLink.addEventListener('mouseleave', () => {
      exitLink.style.color = 'rgba(255, 255, 255, 0.7)';
    });

    exitLink.addEventListener('click', async (e) => {
      e.preventDefault();
      exitLink.disabled = true;
      
      try {
        await option.action();
      } catch (error) {
        console.error('Error handling gentle exit:', error);
        exitLink.disabled = false;
      }
    });

    exitContainer.appendChild(exitLink);
    
    // Add supportive sub-message
    const subMessage = document.createElement('p');
    subMessage.textContent = 'That\'s completely okay.';
    subMessage.style.cssText = `
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
      margin: 0.5rem 0 0 0;
      font-style: italic;
    `;
    exitContainer.appendChild(subMessage);

    return exitContainer;
  }

  /**
   * Get current presentation status
   */
  isChoicesPresented(): boolean {
    return this.isPresented;
  }

  /**
   * Cleanup method for component disposal
   */
  dispose(): void {
    this.clearChoices();
    this.onYesCallback = null;
    this.onGentleExitCallback = null;
    this.container = null;
  }
}