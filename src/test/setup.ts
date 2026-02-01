/**
 * Test setup configuration for Valentine's Day interactive webpage
 * Configures vitest and fast-check for property-based testing
 */

import { beforeEach, afterEach } from 'vitest';

// Global test setup
beforeEach(() => {
  // Reset DOM state before each test
  document.body.innerHTML = '';
  
  // Reset any global state or mocks
  // This ensures clean state between tests
});

afterEach(() => {
  // Cleanup after each test
  document.body.innerHTML = '';
  
  // Clear any timers or intervals
  const highestTimeoutId = setTimeout(() => {}, 0) as unknown as number;
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
});

// Mock DOM APIs that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (): void => {},
    removeListener: (): void => {},
    addEventListener: (): void => {},
    removeEventListener: (): void => {},
    dispatchEvent: (): boolean => false,
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};