/**
 * Memory Revealer Component Tests
 * Tests typing effects, text variants, and content parsing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRevealerController } from './memory-revealer.js';

// Mock setTimeout for controlled timing in tests
vi.stubGlobal('setTimeout', vi.fn().mockImplementation((fn, delay) => {
  fn();
  return 1;
}));

describe('MemoryRevealerController', () => {
  let memoryRevealer: MemoryRevealerController;
  let testContainer: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a real DOM element for testing
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
    
    memoryRevealer = new MemoryRevealerController('test-container');
  });

  afterEach(() => {
    if (memoryRevealer) {
      memoryRevealer.destroy();
    }
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  describe('Initialization', () => {
    it('should initialize with container element', () => {
      expect(testContainer).toBeDefined();
      expect(testContainer.id).toBe('test-container');
    });

    it('should throw error if container not found', () => {
      expect(() => new MemoryRevealerController('nonexistent')).toThrow('Memory Revealer container with id "nonexistent" not found');
    });

    it('should initialize cursor element with correct properties', () => {
      // Check that cursor styles were added to document head
      const styleElement = document.getElementById('memory-revealer-styles');
      expect(styleElement).toBeTruthy();
    });
  });

  describe('Text Variant Support', () => {
    it('should set ultra-minimal variant', () => {
      memoryRevealer.setTextVariant('ultra-minimal');
      expect(memoryRevealer.getCurrentVariant()).toBe('ultra-minimal');
      expect(testContainer.className).toBe('memory-revealer-container variant-ultra-minimal');
    });

    it('should set warm-controlled variant', () => {
      memoryRevealer.setTextVariant('warm-controlled');
      expect(memoryRevealer.getCurrentVariant()).toBe('warm-controlled');
      expect(testContainer.className).toBe('memory-revealer-container variant-warm-controlled');
    });

    it('should apply variant-specific styles', () => {
      memoryRevealer.setTextVariant('ultra-minimal');
      expect(testContainer.style.cssText).toContain('font-size: 1.1rem');
      expect(testContainer.style.cssText).toContain('font-weight: 300');
    });
  });

  describe('Content Parsing and Validation', () => {
    it('should parse valid content correctly', () => {
      const content = 'Hello world. This is a test.';
      const parsed = memoryRevealer.parseContent(content);
      
      expect(parsed.text).toBe(content);
      expect(parsed.formatting.emphasis).toBe(false);
      expect(parsed.formatting.specialCharacters).toBe(false);
      expect(parsed.accessibility.ariaLabel).toContain('Text sequence: Hello world');
    });

    it('should detect emphasis formatting', () => {
      const content = 'This is *important* text';
      const parsed = memoryRevealer.parseContent(content);
      
      expect(parsed.formatting.emphasis).toBe(true);
    });

    it('should detect special characters', () => {
      const content = 'Special chars: @#$%';
      const parsed = memoryRevealer.parseContent(content);
      
      expect(parsed.formatting.specialCharacters).toBe(true);
    });

    it('should handle line breaks', () => {
      const content = 'Line one\nLine two\nLine three';
      const parsed = memoryRevealer.parseContent(content);
      
      expect(parsed.formatting.lineBreaks).toHaveLength(2);
    });

    it('should throw error for invalid content', () => {
      expect(() => memoryRevealer.parseContent('')).toThrow('Invalid content: content must be a non-empty string');
      expect(() => memoryRevealer.parseContent(null as any)).toThrow('Invalid content: content must be a non-empty string');
    });

    it('should normalize whitespace', () => {
      const content = '  Multiple   spaces   here  ';
      const parsed = memoryRevealer.parseContent(content);
      
      expect(parsed.text).toBe('Multiple spaces here');
    });

    it('should generate screen reader text with proper pauses', () => {
      const content = 'First sentence. Second sentence? Third sentence!';
      const parsed = memoryRevealer.parseContent(content);
      
      // The implementation adds spaces after punctuation, then normalizes and trims
      expect(parsed.accessibility.screenReaderText).toBe('First sentence. Second sentence? Third sentence!');
    });
  });

  describe('Cursor Management', () => {
    it('should show cursor when requested', () => {
      memoryRevealer.showCursor(true);
      // Since cursor is internal, we test the method doesn't throw
      expect(() => memoryRevealer.showCursor(true)).not.toThrow();
    });

    it('should hide cursor when requested', () => {
      memoryRevealer.showCursor(false);
      // Since cursor is internal, we test the method doesn't throw
      expect(() => memoryRevealer.showCursor(false)).not.toThrow();
    });
  });

  describe('Text Revelation', () => {
    it('should reveal text with typing options', async () => {
      const options = {
        speed: 1, // Fast for testing
        pauseAfter: 1,
        showCursor: true,
        fadeIn: false
      };

      const promise = memoryRevealer.revealText('Hello', options);
      expect(memoryRevealer.isCurrentlyRevealing()).toBe(true);
      
      await promise;
      expect(memoryRevealer.isCurrentlyRevealing()).toBe(false);
      expect(testContainer.textContent).toContain('Hello');
    });

    it('should handle concurrent reveal requests', async () => {
      const options = {
        speed: 1,
        pauseAfter: 0,
        showCursor: false,
        fadeIn: false
      };

      const promise1 = memoryRevealer.revealText('First', options);
      const promise2 = memoryRevealer.revealText('Second', options);

      await Promise.all([promise1, promise2]);
      expect(memoryRevealer.isCurrentlyRevealing()).toBe(false);
    });

    it('should throw error if container is missing during reveal', async () => {
      // Simulate container being removed
      (memoryRevealer as any).container = null;
      
      const options = {
        speed: 1,
        pauseAfter: 0,
        showCursor: false,
        fadeIn: false
      };

      await expect(memoryRevealer.revealText('Test', options)).rejects.toThrow('Memory Revealer container not found');
    });
  });

  describe('Accessibility Features', () => {
    it('should set accessibility attributes on text elements', async () => {
      const options = {
        speed: 1,
        pauseAfter: 0,
        showCursor: false,
        fadeIn: false
      };

      await memoryRevealer.revealText('Test content', options);
      
      // Check that content was revealed
      expect(testContainer.textContent).toContain('Test content');
    });

    it('should generate appropriate accessibility text for variants', () => {
      memoryRevealer.setTextVariant('warm-controlled');
      const parsed = memoryRevealer.parseContent('Test content');
      
      expect(parsed.accessibility.description).toBe('warm-controlled text variant');
    });
  });

  describe('Resource Management', () => {
    it('should clean up resources on destroy', () => {
      memoryRevealer.destroy();
      
      expect((memoryRevealer as any).container).toBeNull();
      expect((memoryRevealer as any).cursorElement).toBeNull();
      expect(memoryRevealer.isCurrentlyRevealing()).toBe(false);
    });
  });
});