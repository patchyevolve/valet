# Valentine's Day Interactive Webpage

A state-driven Valentine's Day interactive webpage that guides users through an emotional journey with precise timing controls, accessibility support, and emotional safety preservation.

## Features

- **State Machine Architecture**: 10 distinct states with precise timing controls
- **Emotional Safety**: No forced interactions, gentle exit paths, reality acknowledgment
- **Accessibility Support**: Reduced motion preferences, autoplay controls, screen reader support
- **Mobile Optimization**: Touch interactions, responsive design, network throttling handling
- **Property-Based Testing**: Comprehensive testing with fast-check for correctness properties

## Project Structure

```
src/
├── types/                 # TypeScript type definitions
│   ├── state-machine.ts   # Core state machine interfaces
│   ├── components.ts      # Component interfaces
│   ├── content.ts         # Content and configuration types
│   └── index.ts          # Type exports
├── test/                  # Test utilities and setup
│   ├── setup.ts          # Vitest configuration
│   └── property-test-helpers.ts  # Fast-check generators
├── main.ts               # Application entry point
└── index.html            # HTML structure
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Commands

```bash
# Build the project
npm run build

# Development mode with watch
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Serve the built application
npm run serve

# Lint code
npm run lint

# Clean build directory
npm run clean
```

### Testing

The project uses a dual testing approach:

- **Unit Tests**: Specific examples and edge cases using Vitest
- **Property-Based Tests**: Universal correctness properties using fast-check

Run tests with:
```bash
npm run test
```

### State Machine Flow

```
Page Load → Ambient Idle → Intro Text → Presence Acknowledgement → 
Distance Visualization → Personal Memory → Valentine Question → 
Decision State → [Confirmation State | Gentle Exit State]
```

## Requirements

This implementation satisfies the following key requirements:

- **Requirement 1.1**: State machine with exactly 10 distinct states in sequential order
- **Requirement 1.2**: Precise timing controls for state transitions
- **Requirement 2.1**: 1.5-second page load state with asset preloading
- **Requirement 11.1**: No forced interaction requirements
- **Requirement 9.1**: Reduced motion preference detection and compliance

## Architecture

The system uses a finite state machine pattern with the following core components:

- **StateMachineController**: Central orchestrator for state transitions
- **AssetPreloader**: Manages video and image loading during page load
- **ProgressTracker**: Handles scroll-based progression and parallax effects
- **MemoryRevealer**: Typing effect animations with cursor
- **VideoPlayer**: 8-second video with text overlay synchronization
- **DecisionHandler**: User choice management with emotional safety
- **AccessibilityController**: Reduced motion and autoplay preference handling

## License

MIT