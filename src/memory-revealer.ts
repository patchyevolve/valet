/**
 * Memory Revealer Component
 * Handles typing effect animations with cursor for text sequences
 * Supports Ultra-Minimal and Warm but Controlled text variants
 * Requirements: 4.1, 4.2, 4.4, 12.1, 12.2, 12.3
 */

import { MemoryRevealer, TypingOptions, FormattedContent, TextFormatting, AccessibilityText } from './types/components.js';

export class MemoryRevealerController implements MemoryRevealer {
  private currentVariant: 'ultra-minimal' | 'warm-controlled' = 'ultra-minimal';
  private container: HTMLElement | null = null;
  private cursorElement: HTMLElement | null = null;
  private isRevealing = false;
  private currentRevealPromise: Promise<void> | null = null;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Memory Revealer container with id "${containerId}" not found`);
    }
    this.initializeCursor();
  }

  private initializeCursor(): void {
    this.cursorElement = document.createElement('span');
    this.cursorElement.className = 'memory-revealer-cursor';
    this.cursorElement.textContent = '|';
    this.cursorElement.style.cssText = `
      opacity: 1;
      animation: blink 1s infinite;
      color: inherit;
      font-weight: inherit;
    `;

    // Add cursor blinking animation
    if (!document.getElementById('memory-revealer-styles')) {
      const style = document.createElement('style');
      style.id = 'memory-revealer-styles';
      style.textContent = `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .memory-revealer-cursor {
          display: inline-block;
        }
        .memory-revealer-text {
          font-family: inherit;
          line-height: 1.6;
          word-wrap: break-word;
        }
      `;
      document.head.appendChild(style);
    }
  }

  async revealText(content: string, options: TypingOptions): Promise<void> {
    if (this.isRevealing) {
      await this.currentRevealPromise;
    }

    this.isRevealing = true;
    this.currentRevealPromise = this.performReveal(content, options);
    
    try {
      await this.currentRevealPromise;
    } finally {
      this.isRevealing = false;
      this.currentRevealPromise = null;
    }
  }

  private async performReveal(content: string, options: TypingOptions): Promise<void> {
    if (!this.container) {
      throw new Error('Memory Revealer container not found');
    }

    const formattedContent = this.parseContent(content);
    const textElement = document.createElement('div');
    textElement.className = 'memory-revealer-text';
    
    // Apply accessibility attributes
    if (formattedContent.accessibility.ariaLabel) {
      textElement.setAttribute('aria-label', formattedContent.accessibility.ariaLabel);
    }
    if (formattedContent.accessibility.description) {
      textElement.setAttribute('aria-describedby', 'memory-revealer-description');
    }

    // Clear container and add text element
    this.container.innerHTML = '';
    this.container.appendChild(textElement);

    // Show cursor if requested
    if (options.showCursor && this.cursorElement) {
      textElement.appendChild(this.cursorElement);
    }

    // Apply fade-in effect if requested
    if (options.fadeIn) {
      textElement.style.opacity = '0';
      textElement.style.transition = 'opacity 0.5s ease-in';
      // Trigger fade-in
      setTimeout(() => {
        textElement.style.opacity = '1';
      }, 50);
      await this.delay(500);
    }

    // Perform typing animation
    await this.typeText(textElement, formattedContent.text, options.speed);

    // Hide cursor after typing if it was shown
    if (options.showCursor && this.cursorElement) {
      this.cursorElement.style.display = 'none';
    }

    // Wait for pause after completion
    if (options.pauseAfter > 0) {
      await this.delay(options.pauseAfter);
    }
  }

  private async typeText(element: HTMLElement, text: string, speed: number): Promise<void> {
    const characters = text.split('');
    let currentText = '';

    for (let i = 0; i < characters.length; i++) {
      currentText += characters[i];
      
      // Update text content while preserving cursor
      if (this.cursorElement && element.contains(this.cursorElement)) {
        element.removeChild(this.cursorElement);
        element.textContent = currentText;
        element.appendChild(this.cursorElement);
      } else {
        element.textContent = currentText;
      }

      // Wait for typing speed delay
      if (i < characters.length - 1) {
        await this.delay(speed);
      }
    }
  }

  setTextVariant(variant: 'ultra-minimal' | 'warm-controlled'): void {
    this.currentVariant = variant;
    
    // Apply variant-specific styling
    if (this.container) {
      this.container.className = `memory-revealer-container variant-${variant}`;
      
      // Add variant-specific styles
      const variantStyles = this.getVariantStyles(variant);
      this.container.style.cssText += variantStyles;
    }
  }

  private getVariantStyles(variant: 'ultra-minimal' | 'warm-controlled'): string {
    switch (variant) {
      case 'ultra-minimal':
        return `
          font-size: 1.1rem;
          color: #333;
          font-weight: 300;
          letter-spacing: 0.5px;
        `;
      case 'warm-controlled':
        return `
          font-size: 1.2rem;
          color: #2c2c2c;
          font-weight: 400;
          letter-spacing: 0.3px;
          line-height: 1.7;
        `;
      default:
        return '';
    }
  }

  parseContent(rawContent: string): FormattedContent {
    // Validate content
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('Invalid content: content must be a non-empty string');
    }

    // Clean and normalize content
    const cleanContent = rawContent.trim().replace(/\s+/g, ' ');
    
    // Parse formatting indicators
    const formatting: TextFormatting = {
      emphasis: rawContent.includes('*') || rawContent.includes('_'),
      lineBreaks: this.findLineBreaks(rawContent),
      specialCharacters: /[^\w\s.,!?;:'"()-]/.test(rawContent)
    };

    // Generate accessibility text based on variant
    const accessibility: AccessibilityText = {
      screenReaderText: this.generateScreenReaderText(cleanContent),
      ariaLabel: `Text sequence: ${cleanContent.substring(0, 50)}${cleanContent.length > 50 ? '...' : ''}`,
      description: `${this.currentVariant} text variant`
    };

    return {
      text: cleanContent,
      formatting,
      accessibility
    };
  }

  private findLineBreaks(content: string): number[] {
    const lineBreaks: number[] = [];
    const lines = content.split('\n');
    let position = 0;
    
    for (let i = 0; i < lines.length - 1; i++) {
      position += lines[i].length;
      lineBreaks.push(position);
      position += 1; // Account for the newline character
    }
    
    return lineBreaks;
  }

  private generateScreenReaderText(content: string): string {
    // Add pauses for screen readers at sentence boundaries
    return content
      .replace(/\./g, '. ')
      .replace(/\?/g, '? ')
      .replace(/!/g, '! ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  showCursor(visible: boolean): void {
    if (this.cursorElement) {
      this.cursorElement.style.display = visible ? 'inline-block' : 'none';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for external access
  isCurrentlyRevealing(): boolean {
    return this.isRevealing;
  }

  getCurrentVariant(): 'ultra-minimal' | 'warm-controlled' {
    return this.currentVariant;
  }

  // Clean up resources
  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.cursorElement = null;
    this.container = null;
    this.isRevealing = false;
    this.currentRevealPromise = null;
  }
}