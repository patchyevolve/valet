/**
 * Valentine's Day Interactive Experience - JavaScript
 * Enhanced with proper scrolling and dynamic backgrounds
 */

// Main Application Object
const ValentineApp = {
    // Application state
    state: {
        current: 'loading',
        currentIndex: 0,
        initialized: false,
        videoLoaded: false,
        errorCount: 0,
        maxErrors: 5,
        isTransitioning: false,
        teleportCounts: {
            maybe: 0,
            friends: 0
        },
        maxTeleports: 3
    },
    
    // Distance animation flag
    distanceAnimationStarted: false,
    
    // State sequence
    stateSequence: [
        'loading',
        'ambient-idle', 
        'intro-text',
        'presence-acknowledgement',
        'distance-visualization',
        'personal-memory',
        'valentine-question',
        'decision-state',
        'confirmation-state'
    ],
    
    // DOM elements cache
    elements: {},
    
    // Timers and intervals
    timers: {
        loading: null,
        typewriter: null,
        stateTransition: null,
        patternRotation: null
    },
    
    // Configuration
    config: {
        typewriterSpeed: 50,
        stateTransitionDelay: 1000,
        videoEndThreshold: 2,
        maxRetries: 3,
        patternChangeInterval: 15000 // Change pattern every 15 seconds
    },
    
    /**
     * Initialize the application
     */
    initialize() {
        try {
            console.log('🌹 Initializing Valentine\'s Day Experience...');
            
            // Set initial background for loading state
            this.updateBackgroundForState('loading');
            
            // Cache DOM elements
            this.cacheElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize video if available
            this.initializeVideo();
            
            // Create floating elements for ambiance
            this.createFloatingElements();
            
            // Initialize concentric hearts background system
            this.concentricHeartsBackground.init();
            
            // Start the experience
            this.startExperience();
            
            this.state.initialized = true;
            console.log('✨ Application initialized successfully');
            
        } catch (error) {
            console.error('💔 Initialization failed:', error);
            this.handleError('Failed to initialize application: ' + error.message);
        }
    },
    
    /**
     * Check browser compatibility with fallbacks
     */
    checkBrowserCompatibility() {
        try {
            // Check for required features
            const requiredFeatures = [
                'querySelector',
                'addEventListener',
                'JSON',
                'Promise',
                'fetch'
            ];
            
            for (const feature of requiredFeatures) {
                if (!(feature in window) && !(feature in document)) {
                    console.warn(`⚠️ Missing feature: ${feature}`);
                    return false;
                }
            }
            
            // Check for modern CSS support
            if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
                console.warn('⚠️ Limited CSS support detected');
                document.body.classList.add('legacy-browser');
            }
            
            return true;
            
        } catch (error) {
            console.error('Browser compatibility check failed:', error);
            return false;
        }
    },
    
    /**
     * Cache DOM elements for performance and error checking
     */
    cacheElements() {
        try {
            const elementIds = [
                'loading', 'ambient-idle', 'intro-text', 'presence-acknowledgement',
                'distance-visualization', 'personal-memory', 'valentine-question',
                'decision-state', 'confirmation-state', 'gentle-exit-state',
                'text-display', 'memory-display', 'question-display',
                'valentine-video', 'video-overlay', 'exit-message', 'announcements'
            ];
            
            elementIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    this.elements[id] = element;
                } else {
                    console.warn(`⚠️ Element not found: ${id}`);
                }
            });
            
            // Cache decision buttons
            this.elements.decisionButtons = document.querySelectorAll('.decision-btn');
            
            console.log(`📋 Cached ${Object.keys(this.elements).length} DOM elements`);
            
        } catch (error) {
            console.error('Element caching failed:', error);
            throw new Error('Critical DOM elements missing');
        }
    },
    
    /**
     * Set up event listeners with error handling
     */
    /**
     * Set up event listeners with proper scrolling control
     */
    setupEventListeners() {
        try {
            // Global error handling
            window.addEventListener('error', (event) => {
                this.handleError(`JavaScript error: ${event.message}`);
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError(`Unhandled promise rejection: ${event.reason}`);
            });
            
            // Click listener for ambient-idle state
            document.addEventListener('click', (e) => {
                if (this.state.current === 'ambient-idle' && !this.state.isTransitioning) {
                    console.log('🖱️ Click detected on ambient-idle, transitioning to next state');
                    this.nextState();
                } else if (this.state.current === 'distance-visualization' && !this.distanceAnimationStarted) {
                    console.log('🖱️ Click detected on distance-visualization, starting animation');
                    this.startDistanceAnimation();
                }
            });
            
            // Improved scroll handling with state-specific behavior
            let scrollTimeout;
            let wheelTimeout;
            
            // Wheel event for better scroll detection
            window.addEventListener('wheel', (e) => {
                if (this.state.isTransitioning) {
                    e.preventDefault();
                    return;
                }
                
                // Always prevent default scrolling to avoid page jumping
                e.preventDefault();
                
                clearTimeout(wheelTimeout);
                wheelTimeout = setTimeout(() => {
                    const scrollDelta = Math.abs(e.deltaY);
                    console.log(`🖱️ Wheel scroll detected: ${e.deltaY}, current state: ${this.state.current}, delta: ${scrollDelta}`);
                    
                    if (this.state.current === 'distance-visualization') {
                        // Special handling for distance visualization
                        this.handleDistanceVisualizationScroll(e.deltaY);
                    } else {
                        // Check if we can scroll to next state
                        const canScroll = this.canScrollToNext();
                        console.log(`� Scroll check: canScroll=${canScroll}, delta=${scrollDelta}`);
                        
                        if (canScroll && scrollDelta > 0) {
                            console.log(`🖱️ CALLING nextState() - ADVANCING FROM: ${this.state.current}`);
                            this.nextState();
                        } else {
                            console.log(`🖱️ NOT advancing: canScroll=${canScroll}, delta=${scrollDelta} (need > 0)`);
                        }
                    }
                }, 50);
            }, { passive: false });
            
            // Touch events for mobile
            let touchStartY = 0;
            let touchEndY = 0;
            
            window.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            window.addEventListener('touchend', (e) => {
                if (this.state.isTransitioning) return;
                
                touchEndY = e.changedTouches[0].clientY;
                const touchDelta = touchStartY - touchEndY;
                
                console.log(`👆 Touch scroll detected: ${touchDelta}, current state: ${this.state.current}`);
                
                if (this.state.current === 'distance-visualization') {
                    this.handleDistanceVisualizationScroll(touchDelta);
                } else if (this.canScrollToNext() && Math.abs(touchDelta) > 50) {
                    console.log(`👆 Transitioning from ${this.state.current} due to touch`);
                    this.nextState();
                }
            }, { passive: true });
            
            // Keyboard navigation
            window.addEventListener('keydown', (e) => {
                if (this.state.isTransitioning) return;
                
                switch (e.key) {
                    case ' ':
                    case 'Enter':
                        if (this.state.current === 'ambient-idle') {
                            e.preventDefault();
                            this.nextState();
                        } else if (this.state.current === 'distance-visualization') {
                            if (!this.distanceAnimationStarted) {
                                console.log('⌨️ Keyboard trigger for distance animation');
                                this.startDistanceAnimation();
                            } else {
                                this.completeDistanceVisualization();
                            }
                        }
                        break;
                    case 'ArrowDown':
                        if (this.canScrollToNext()) {
                            e.preventDefault();
                            console.log('⌨️ Arrow down - advancing state');
                            this.nextState();
                        } else if (this.state.current === 'distance-visualization') {
                            if (!this.distanceAnimationStarted) {
                                console.log('⌨️ Arrow down - starting distance animation');
                                this.startDistanceAnimation();
                            } else {
                                this.completeDistanceVisualization();
                            }
                        }
                        break;
                    case 'n': // Debug key
                        if (e.ctrlKey) {
                            e.preventDefault();
                            console.log('🔧 Debug: Force next state');
                            this.nextState();
                        }
                        break;
                }
            });
            
            // Decision button listeners with teleportation logic
            if (this.elements.decisionButtons) {
                this.elements.decisionButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        try {
                            const choice = e.target.closest('.decision-btn').dataset.choice;
                            
                            // Handle Yes button - always proceed
                            if (choice === 'yes') {
                                this.handleDecision(choice);
                                return;
                            }
                            
                            // Handle Maybe/Friends buttons with teleportation
                            if (choice === 'maybe' || choice === 'friends') {
                                const currentCount = this.state.teleportCounts[choice];
                                
                                if (currentCount < this.state.maxTeleports) {
                                    // Teleport the button
                                    this.teleportButton(button, choice);
                                } else {
                                    // Max teleports reached, proceed to gentle exit
                                    this.handleDecision(choice);
                                }
                            }
                        } catch (error) {
                            console.error('Decision button error:', error);
                            this.handleError('Failed to process decision');
                        }
                    });
                });
            }
            
            console.log('🎯 Event listeners set up successfully');
            
        } catch (error) {
            console.error('Event listener setup failed:', error);
            this.handleError('Failed to set up event listeners');
        }
    },
    
    /**
     * Handle distance visualization scroll interaction with progressive animation
     */
    handleDistanceVisualizationScroll(deltaY) {
        if (this.state.current !== 'distance-visualization') return;
        
        // Check if animation is complete
        const scrollIndicator = document.getElementById('scroll-continue-indicator');
        if (scrollIndicator && scrollIndicator.classList.contains('show')) {
            // Animation complete, allow scroll to next state
            console.log('🎭 Distance visualization complete, advancing to next state');
            this.transitionToState('personal-memory');
        } else {
            // Animation not complete, start it if not already started
            if (!this.distanceAnimationStarted) {
                this.startDistanceAnimation();
            }
        }
    },
    
    /**
     * Start progressive distance visualization animation - COMPLETE IMPLEMENTATION
     */
    startDistanceAnimation() {
        if (this.distanceAnimationStarted) return;
        this.distanceAnimationStarted = true;
        
        try {
            console.log('🎭 Starting complete distance visualization animation sequence');
            
            // Block scrolling during animation
            document.body.style.overflow = 'hidden';
            
            // Try to find elements with retries
            const findElementsWithRetry = (attempt = 1) => {
                const pinYou = document.getElementById('pin-you');
                const pinMe = document.getElementById('pin-me');
                const heartPath = document.getElementById('heart-path');
                const paperPlane = document.getElementById('paper-plane');
                const textSequence = document.getElementById('romantic-text-sequence');
                const scrollIndicator = document.getElementById('scroll-continue-indicator');
                
                // Debug: Check if elements exist
                console.log(`🔍 Distance elements check (attempt ${attempt}):`, {
                    pinYou: !!pinYou,
                    pinMe: !!pinMe,
                    heartPath: !!heartPath,
                    paperPlane: !!paperPlane,
                    textSequence: !!textSequence,
                    scrollIndicator: !!scrollIndicator,
                    distanceVisualizationDiv: !!document.getElementById('distance-visualization')
                });
                
                if (!pinYou || !pinMe) {
                    if (attempt < 3) {
                        console.log(`⏳ Elements not found, retrying in 500ms (attempt ${attempt + 1})`);
                        setTimeout(() => findElementsWithRetry(attempt + 1), 500);
                        return;
                    } else {
                        console.error('❌ Critical distance visualization elements not found after 3 attempts');
                        // Fallback: enable scrolling and advance
                        document.body.style.overflow = 'auto';
                        setTimeout(() => {
                            this.transitionToState('personal-memory');
                        }, 2000);
                        return;
                    }
                }
                
                // Elements found, start animation
                this.runDistanceAnimation(pinYou, pinMe, heartPath, paperPlane, textSequence, scrollIndicator);
            };
            
            findElementsWithRetry();
            
        } catch (error) {
            console.error('❌ Distance animation failed:', error);
            // Fallback: enable scrolling and advance
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                this.transitionToState('personal-memory');
            }, 3000);
        }
    },
    
    /**
     * Run the actual distance animation sequence
     */
    runDistanceAnimation(pinYou, pinMe, heartPath, paperPlane, textSequence, scrollIndicator) {
        console.log('🎬 Running distance animation with found elements');
        
        // Animation sequence with proper timing
        
        // Step 1: First pin drops (You) - 0s
        setTimeout(() => {
            pinYou.classList.add('drop-in');
            console.log('🎭 Pin "You" dropped');
        }, 0);
        
        // Step 2: Second pin drops (Me) - 2s
        setTimeout(() => {
            pinMe.classList.add('drop-in');
            console.log('🎭 Pin "Me" dropped');
        }, 2000);
        
        // Step 3: Heart path starts drawing - 4s
        setTimeout(() => {
            if (heartPath) {
                heartPath.classList.add('animate');
                console.log('🎭 Heart path drawing started');
            }
        }, 4000);
        
        // Step 4: SIMULTANEOUS - Paper plane flies + Text appears - 5s
        setTimeout(() => {
            // Start paper plane flying from Me to You
            if (paperPlane) {
                paperPlane.style.display = 'block';
                paperPlane.classList.add('fly');
                console.log('🎭 Paper plane flying from Me to You along heart path');
            }
            
            // Start text sequence simultaneously
            if (textSequence) {
                const textLines = textSequence.querySelectorAll('.text-line');
                const textMessages = [
                    "Distance can keep us apart",
                    "but love keeps us closer to each other", 
                    "every time and everywhere",
                    "I am here for you"
                ];
                
                // Show text lines progressively while plane flies
                textLines.forEach((line, index) => {
                    setTimeout(() => {
                        line.textContent = textMessages[index];
                        line.classList.add('show');
                        console.log(`🎭 Text line ${index + 1} shown: "${textMessages[index]}" (while plane flies)`);
                    }, index * 1200); // 1.2s intervals for smooth progression
                });
            }
        }, 5000);
        
        // Step 5: Show scroll continue indicator after plane journey + text complete - 10s
        setTimeout(() => {
            if (scrollIndicator) {
                scrollIndicator.classList.add('show');
                console.log('🎭 Scroll continue indicator shown - animation complete');
            }
            
            // Re-enable scrolling
            document.body.style.overflow = 'auto';
            console.log('🎭 Distance visualization complete - scrolling enabled');
        }, 10000); // 5s start + 5s animation duration
    },
    
    /**
     * Complete distance visualization and advance
     */
    completeDistanceVisualization() {
        if (this.state.current === 'distance-visualization') {
            console.log('🎭 Manually completing distance visualization');
            document.body.style.overflow = 'auto';
            this.transitionToState('personal-memory');
        }
    },
    
    /**
     * Initialize video with comprehensive error handling
     */
    initializeVideo() {
        try {
            const video = this.elements['valentine-video'];
            if (!video) {
                console.warn('⚠️ Video element not found');
                return;
            }
            
            // Video event listeners
            video.addEventListener('loadedmetadata', () => {
                console.log('📹 Video metadata loaded');
                this.state.videoLoaded = true;
            });
            
            video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                this.handleVideoError();
            });
            
            video.addEventListener('timeupdate', () => {
                this.handleVideoTimeUpdate();
            });
            
            video.addEventListener('ended', () => {
                this.handleVideoEnded();
            });
            
            // Preload video
            video.load();
            
        } catch (error) {
            console.error('Video initialization failed:', error);
            this.handleVideoError();
        }
    },
    
    /**
     * Start the Valentine's experience
     */
    startExperience() {
        try {
            console.log('💕 Starting Valentine\'s experience...');
            
            // Show loading state
            this.showState('loading');
            
            // Simulate loading time with progress
            this.simulateLoading();
            
        } catch (error) {
            console.error('Failed to start experience:', error);
            this.handleError('Failed to start the romantic journey');
        }
    },
    
    /**
     * Simulate loading with visual feedback
     */
    simulateLoading() {
        try {
            let progress = 0;
            const progressBar = document.querySelector('.progress-bar');
            
            const loadingInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                
                if (progressBar) {
                    progressBar.style.width = Math.min(progress, 100) + '%';
                }
                
                if (progress >= 100) {
                    clearInterval(loadingInterval);
                    setTimeout(() => {
                        this.transitionToState('ambient-idle');
                    }, 500);
                }
            }, 200);
            
            this.timers.loading = loadingInterval;
            
        } catch (error) {
            console.error('Loading simulation failed:', error);
            // Fallback: go directly to ambient idle
            setTimeout(() => {
                this.transitionToState('ambient-idle');
            }, 2000);
        }
    },
    
    /**
     * Transition between states with NO flickering + Background Management
     */
    transitionToState(newState) {
        try {
            if (this.state.isTransitioning) {
                console.log('⏸️ Transition already in progress, ignoring');
                return;
            }
            
            if (!this.validateState(newState)) {
                throw new Error(`Invalid state: ${newState}`);
            }
            
            const oldState = this.state.current;
            console.log(`🔄 Transitioning: ${oldState} → ${newState}`);
            
            this.state.isTransitioning = true;
            
            // Clear any existing timers
            this.clearTimers();
            
            // Update background for new state FIRST (smooth transition)
            this.updateBackgroundForState(newState);
            
            // Update concentric hearts background
            this.concentricHeartsBackground.updateForState(newState);
            
            // Get elements
            const currentElement = document.getElementById(oldState);
            const newElement = document.getElementById(newState);
            
            if (!newElement) {
                console.error(`State element not found: ${newState}`);
                this.state.isTransitioning = false;
                return;
            }
            
            // Ultra-smooth transition without any flickering
            if (currentElement && currentElement.classList.contains('active')) {
                // Start exit animation
                currentElement.classList.add('exiting');
                
                // Prepare new element
                newElement.style.display = 'flex';
                newElement.style.opacity = '0';
                newElement.style.visibility = 'hidden';
                
                setTimeout(() => {
                    // Hide current element
                    currentElement.classList.remove('active', 'exiting');
                    currentElement.style.display = 'none';
                    
                    // Show new element with entrance animation
                    newElement.classList.add('active', 'entering');
                    newElement.style.opacity = '1';
                    newElement.style.visibility = 'visible';
                    
                    // Clean up after animation
                    setTimeout(() => {
                        newElement.classList.remove('entering');
                        newElement.style.opacity = '';
                        newElement.style.visibility = '';
                    }, 600);
                    
                    // Update state and finish transition
                    this.state.current = newState;
                    this.state.isTransitioning = false;
                    
                    // Handle state-specific logic
                    setTimeout(() => {
                        this.handleStateLogic(newState);
                    }, 100);
                    
                }, 400);
            } else {
                // No current state, show new state immediately
                newElement.style.display = 'flex';
                newElement.classList.add('active', 'entering');
                newElement.style.opacity = '1';
                newElement.style.visibility = 'visible';
                
                setTimeout(() => {
                    newElement.classList.remove('entering');
                    newElement.style.opacity = '';
                    newElement.style.visibility = '';
                }, 600);
                
                this.state.current = newState;
                this.state.isTransitioning = false;
                
                setTimeout(() => {
                    this.handleStateLogic(newState);
                }, 100);
            }
            
            // Announce to screen readers
            this.announceStateChange(newState);
            
        } catch (error) {
            console.error('State transition failed:', error);
            this.state.isTransitioning = false;
            this.handleError(`Failed to transition to ${newState}`);
        }
    },
    
    /**
     * Update background class for emotional progression
     */
    updateBackgroundForState(stateName) {
        // Remove all existing state classes
        const stateClasses = [
            'state-loading',
            'state-ambient-idle', 
            'state-intro-text',
            'state-presence-acknowledgement',
            'state-distance-visualization',
            'state-personal-memory',
            'state-valentine-question',
            'state-decision-state',
            'state-confirmation-state',
            'state-gentle-exit-state'
        ];
        
        stateClasses.forEach(className => {
            document.body.classList.remove(className);
        });
        
        // Add new state class for background
        const newStateClass = `state-${stateName.replace(/-/g, '-')}`;
        document.body.classList.add(newStateClass);
        
        console.log(`🎨 Background updated to: ${newStateClass}`);
    },
    
    /**
     * Create floating elements for ambiance
     */
    createFloatingElements() {
        const container = document.createElement('div');
        container.className = 'floating-elements';
        document.body.appendChild(container);
        
        // Create floating hearts
        setInterval(() => {
            this.createFloatingHeart(container);
        }, 3000);
        
        // Create floating sparkles
        setInterval(() => {
            this.createFloatingSparkle(container);
        }, 2000);
        
        console.log('✨ Floating elements created');
    },
    
    /**
     * Create a floating heart
     */
    createFloatingHeart(container) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = '💕';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 2 + 's';
        heart.style.animationDuration = (6 + Math.random() * 4) + 's';
        
        container.appendChild(heart);
        
        // Remove after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 8000);
    },
    
    /**
     * Create a floating sparkle
     */
    createFloatingSparkle(container) {
        const sparkle = document.createElement('div');
        sparkle.className = 'floating-sparkle';
        sparkle.textContent = '✨';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparkle.style.animationDuration = (4 + Math.random() * 4) + 's';
        
        container.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 6000);
    },
    
    /**
     * Validate state names
     */
    validateState(state) {
        const validStates = [
            'loading', 'ambient-idle', 'intro-text', 'presence-acknowledgement',
            'distance-visualization', 'personal-memory', 'valentine-question',
            'decision-state', 'confirmation-state', 'gentle-exit-state'
        ];
        
        return validStates.includes(state);
    },
    
    /**
     * Check if current state allows scrolling to next
     */
    canScrollToNext() {
        const scrollableStates = [
            'intro-text',
            'presence-acknowledgement', 
            'distance-visualization',
            'personal-memory',
            'valentine-question'
        ];
        const canScroll = scrollableStates.includes(this.state.current);
        console.log(`🔍 canScrollToNext check: current="${this.state.current}", canScroll=${canScroll}, scrollableStates=${scrollableStates.join(',')}`);
        return canScroll;
    },
    
    /**
     * Move to next state in sequence
     */
    nextState() {
        if (this.state.isTransitioning) {
            console.log('⏸️ nextState blocked - already transitioning');
            return;
        }
        
        const currentIndex = this.stateSequence.indexOf(this.state.current);
        console.log(`⏭️ nextState called: current="${this.state.current}", currentIndex=${currentIndex}, sequence=${this.stateSequence.join(',')}`);
        
        if (currentIndex < this.stateSequence.length - 1) {
            const nextState = this.stateSequence[currentIndex + 1];
            console.log(`⏭️ Moving from ${this.state.current} to ${nextState}`);
            this.transitionToState(nextState);
        } else {
            console.log(`⏭️ Already at last state: ${this.state.current}`);
        }
    },
    
    /**
     * Hide all state containers with exit animation
     */
    hideAllStates() {
        try {
            document.querySelectorAll('.state-container').forEach(container => {
                container.classList.remove('active', 'exiting');
                container.style.display = 'none';
            });
        } catch (error) {
            console.error('Failed to hide states:', error);
        }
    },
    
    /**
     * Update progress indicator
     */
    updateProgressIndicator(state) {
        try {
            const states = [
                'loading', 'ambient-idle', 'intro-text', 'presence-acknowledgement',
                'distance-visualization', 'personal-memory', 'valentine-question',
                'decision-state', 'confirmation-state', 'gentle-exit-state'
            ];
            
            const currentIndex = states.indexOf(state);
            const progress = ((currentIndex + 1) / states.length) * 100;
            
            // Create or update progress indicator
            let progressIndicator = document.getElementById('progress-indicator');
            if (!progressIndicator) {
                progressIndicator = document.createElement('div');
                progressIndicator.id = 'progress-indicator';
                progressIndicator.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    z-index: 9999;
                    pointer-events: none;
                `;
                
                const progressBar = document.createElement('div');
                progressBar.id = 'progress-bar';
                progressBar.style.cssText = `
                    height: 100%;
                    background: linear-gradient(90deg, #ff6b9d, #fd79a8, #fdcb6e);
                    width: 0%;
                    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 0 10px rgba(255, 107, 157, 0.6);
                `;
                
                progressIndicator.appendChild(progressBar);
                document.body.appendChild(progressIndicator);
            }
            
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
        } catch (error) {
            console.error('Progress indicator update failed:', error);
        }
    },
    
    /**
     * Show specific state container
     */
    showState(stateId) {
        try {
            const stateElement = this.elements[stateId] || document.getElementById(stateId);
            if (stateElement) {
                stateElement.style.display = 'flex';
                stateElement.classList.add('active');
                
                // Enable scrolling for scroll-based states
                if (stateId === 'presence-acknowledgement' || stateId === 'distance-visualization') {
                    document.body.style.overflow = 'auto';
                    document.body.style.height = '200vh'; // Make page scrollable
                    console.log(`Enabled scrolling for ${stateId} - page height set to 200vh`);
                    
                    // Add visual indicator that scrolling is enabled
                    if (!document.getElementById('scroll-helper')) {
                        const scrollHelper = document.createElement('div');
                        scrollHelper.id = 'scroll-helper';
                        scrollHelper.style.cssText = `
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(10px);
                            padding: 10px 15px;
                            border-radius: 20px;
                            color: white;
                            font-size: 0.9rem;
                            z-index: 1000;
                            animation: pulse 2s infinite;
                        `;
                        scrollHelper.textContent = 'Scroll or click to continue';
                        document.body.appendChild(scrollHelper);
                        
                        // Remove helper after 5 seconds
                        setTimeout(() => {
                            if (scrollHelper.parentNode) {
                                scrollHelper.parentNode.removeChild(scrollHelper);
                            }
                        }, 5000);
                    }
                } else {
                    document.body.style.overflow = 'hidden';
                    document.body.style.height = '100vh';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    // Remove scroll helper if it exists
                    const scrollHelper = document.getElementById('scroll-helper');
                    if (scrollHelper) {
                        scrollHelper.parentNode.removeChild(scrollHelper);
                    }
                }
            } else {
                throw new Error(`State element not found: ${stateId}`);
            }
        } catch (error) {
            console.error('Failed to show state:', error);
            this.handleError(`Cannot display ${stateId} state`);
        }
    },
    
    /**
     * Handle state-specific logic
     */
    handleStateLogic(state) {
        try {
            switch (state) {
                case 'intro-text':
                    this.startTypewriterEffect();
                    break;
                case 'presence-acknowledgement':
                    // Remove fallback timer - make it scroll-only
                    // No auto-advance - scroll-based only
                    break;
                case 'distance-visualization':
                    // Reset distance animation flag for fresh start
                    this.distanceAnimationStarted = false;
                    // Auto-start the animation after a brief delay to ensure DOM is ready
                    setTimeout(() => {
                        if (this.state.current === 'distance-visualization') {
                            console.log('🎭 Auto-starting distance animation after DOM ready');
                            this.startDistanceAnimation();
                        }
                    }, 500); // Reduced delay for faster start
                    break;
                case 'personal-memory':
                    this.revealMemory();
                    break;
                case 'valentine-question':
                    this.revealQuestion();
                    break;
                case 'confirmation-state':
                    this.playVideo();
                    break;
                default:
                    // No specific logic needed
                    break;
            }
        } catch (error) {
            console.error(`State logic failed for ${state}:`, error);
        }
    },
    
    /**
     * Typewriter effect for intro text
     */
    startTypewriterEffect() {
        try {
            const textDisplay = this.elements['text-display'];
            if (!textDisplay) {
                throw new Error('Text display element not found');
            }
            
            const messages = [
                "Sometimes we find ourselves thinking about someone special...",
                "Someone who makes ordinary moments feel extraordinary...",
                "And we wonder if they might feel the same way..."
            ];
            
            let messageIndex = 0;
            
            const typeMessage = () => {
                if (messageIndex >= messages.length) {
                    setTimeout(() => {
                        this.transitionToState('presence-acknowledgement');
                    }, 2000);
                    return;
                }
                
                const message = messages[messageIndex];
                let charIndex = 0;
                textDisplay.textContent = '';
                
                const typeChar = () => {
                    if (charIndex < message.length) {
                        textDisplay.textContent += message[charIndex];
                        charIndex++;
                        this.timers.typewriter = setTimeout(typeChar, this.config.typewriterSpeed);
                    } else {
                        messageIndex++;
                        setTimeout(typeMessage, 1500);
                    }
                };
                
                typeChar();
            };
            
            typeMessage();
            
        } catch (error) {
            console.error('Typewriter effect failed:', error);
            // Fallback: show all text immediately
            if (this.elements['text-display']) {
                this.elements['text-display'].textContent = "Sometimes we find ourselves thinking about someone special...";
            }
            setTimeout(() => {
                this.transitionToState('presence-acknowledgement');
            }, 3000);
        }
    },
    
    /**
     * Reveal memory text with typewriter effect
     */
    revealMemory() {
        try {
            const memoryDisplay = this.elements['memory-display'];
            if (!memoryDisplay) {
                throw new Error('Memory display element not found');
            }
            
            const memoryText = "I remember the first time I saw you smile... it was like the whole world suddenly made sense. Every conversation we've had, every moment we've shared, has been building to this question I've been wanting to ask...";
            
            this.typewriterEffect(memoryDisplay, memoryText, () => {
                setTimeout(() => {
                    this.transitionToState('valentine-question');
                }, 3000);
            });
            
        } catch (error) {
            console.error('Memory reveal failed:', error);
            setTimeout(() => {
                this.transitionToState('valentine-question');
            }, 2000);
        }
    },
    
    /**
     * Reveal question with typewriter effect
     */
    revealQuestion() {
        try {
            const questionDisplay = this.elements['question-display'];
            if (!questionDisplay) {
                throw new Error('Question display element not found');
            }
            
            const questionText = "Will you be my Valentine? 💕";
            
            this.typewriterEffect(questionDisplay, questionText, () => {
                setTimeout(() => {
                    this.transitionToState('decision-state');
                }, 2000);
            });
            
        } catch (error) {
            console.error('Question reveal failed:', error);
            setTimeout(() => {
                this.transitionToState('decision-state');
            }, 2000);
        }
    },
    
    /**
     * Generic typewriter effect with cursor management
     */
    typewriterEffect(element, text, callback) {
        try {
            let charIndex = 0;
            element.textContent = '';
            element.classList.add('typing'); // Show cursor during typing
            
            const typeChar = () => {
                if (charIndex < text.length) {
                    element.textContent += text[charIndex];
                    charIndex++;
                    this.timers.typewriter = setTimeout(typeChar, this.config.typewriterSpeed + Math.random() * 30);
                } else {
                    // Typing finished, hide cursor
                    element.classList.remove('typing');
                    if (callback) {
                        setTimeout(callback, 500); // Small delay before callback
                    }
                }
            };
            
            typeChar();
            
        } catch (error) {
            console.error('Typewriter effect failed:', error);
            element.textContent = text;
            element.classList.remove('typing');
            if (callback) callback();
        }
    },
    
    /**
     * Teleport button to random position
     */
    teleportButton(button, choice) {
        try {
            // Increment teleport count
            this.state.teleportCounts[choice]++;
            const currentCount = this.state.teleportCounts[choice];
            
            console.log(`🌀 Teleporting ${choice} button (${currentCount}/${this.state.maxTeleports})`);
            
            // Add teleporting animation
            button.classList.add('teleporting');
            
            // After teleport out animation, move to new position
            setTimeout(() => {
                // Remove teleporting class
                button.classList.remove('teleporting');
                
                // Remove any existing position classes
                button.classList.remove('teleport-position-1', 'teleport-position-2', 'teleport-position-3', 
                                       'teleport-position-4', 'teleport-position-5', 'teleport-position-6');
                
                // Add random position class
                const randomPosition = Math.floor(Math.random() * 6) + 1;
                button.classList.add(`teleport-position-${randomPosition}`);
                
                // Add teleported animation
                button.classList.add('teleported');
                
                // Check if this was the last teleport
                if (currentCount >= this.state.maxTeleports) {
                    setTimeout(() => {
                        button.classList.add('teleport-exhausted');
                        console.log(`⚡ ${choice} button exhausted after ${this.state.maxTeleports} teleports`);
                    }, 800);
                }
                
                // Remove teleported class after animation
                setTimeout(() => {
                    button.classList.remove('teleported');
                }, 800);
                
            }, 600); // Match teleportOut animation duration
            
        } catch (error) {
            console.error('Button teleportation failed:', error);
            // Fallback: just handle the decision normally
            this.handleDecision(choice);
        }
    },

    /**
     * Handle user decisions
     */
    handleDecision(choice) {
        try {
            console.log(`💖 User chose: ${choice}`);
            
            // Record choice
            this.recordChoice('valentine_response', choice);
            
            // Handle different choices
            switch (choice) {
                case 'yes':
                    this.transitionToState('confirmation-state');
                    this.createCelebrationEffects();
                    break;
                case 'maybe':
                    this.showGentleExit("That's perfectly okay. Take all the time you need. Your feelings are valid, and I respect whatever you decide. 💙");
                    break;
                case 'friends':
                    this.showGentleExit("Thank you for being honest. I value our friendship so much, and I'm grateful you felt comfortable sharing your feelings with me. 🤗");
                    break;
                default:
                    throw new Error(`Unknown choice: ${choice}`);
            }
            
        } catch (error) {
            console.error('Decision handling failed:', error);
            this.handleError('Failed to process your choice');
        }
    },
    
    /**
     * Show gentle exit message
     */
    showGentleExit(message) {
        try {
            this.transitionToState('gentle-exit-state');
            
            const exitMessage = this.elements['exit-message'];
            if (exitMessage) {
                exitMessage.innerHTML = `
                    <p>${message}</p>
                    <p>Your honesty means everything to me. 💙</p>
                `;
            }
            
        } catch (error) {
            console.error('Gentle exit failed:', error);
            this.transitionToState('gentle-exit-state');
        }
    },
    
    /**
     * Play video with overlay timing
     */
    playVideo() {
        try {
            const video = this.elements['valentine-video'];
            const overlay = this.elements['video-overlay'];
            
            if (!video) {
                console.warn('⚠️ Video not available, showing fallback');
                this.showVideoFallback();
                return;
            }
            
            // Remove any existing controls
            video.removeAttribute('controls');
            video.muted = true; // Start muted to allow autoplay
            
            // Play video
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('📹 Video playing successfully');
                        // Unmute after a short delay if user interacted
                        setTimeout(() => {
                            video.muted = false;
                        }, 1000);
                    })
                    .catch(error => {
                        console.error('Video play failed:', error);
                        this.handleVideoError();
                    });
            }
            
        } catch (error) {
            console.error('Video play failed:', error);
            this.handleVideoError();
        }
    },
    
    /**
     * Handle video time updates
     */
    handleVideoTimeUpdate() {
        try {
            const video = this.elements['valentine-video'];
            const overlay = this.elements['video-overlay'];
            
            if (!video || !overlay) return;
            
            const timeLeft = video.duration - video.currentTime;
            
            // Show overlay in last 2 seconds
            if (timeLeft <= this.config.videoEndThreshold && timeLeft > 0) {
                overlay.classList.add('show');
            }
            
        } catch (error) {
            console.error('Video time update failed:', error);
        }
    },
    
    /**
     * Handle video ended
     */
    handleVideoEnded() {
        try {
            console.log('📹 Video ended');
            const video = this.elements['valentine-video'];
            const overlay = this.elements['video-overlay'];
            const videoFrame = document.querySelector('.video-frame');
            const exitButton = document.getElementById('video-exit-button');
            
            // Show overlay
            if (overlay) {
                overlay.classList.add('show');
            }
            
            // Turn video frame white
            if (videoFrame) {
                videoFrame.classList.add('video-ended');
            }
            
            // Show exit button
            if (exitButton) {
                setTimeout(() => {
                    exitButton.style.display = 'block';
                    exitButton.style.animation = 'fadeInUp 0.5s ease-out';
                }, 2000); // Show after 2 seconds
            }
            
        } catch (error) {
            console.error('Video end handling failed:', error);
        }
    },
    
    /**
     * Handle video errors
     */
    handleVideoError() {
        try {
            console.warn('⚠️ Video error, showing fallback');
            this.showVideoFallback();
            
        } catch (error) {
            console.error('Video error handling failed:', error);
        }
    },
    
    /**
     * Exit to gentle state
     */
    exitToGentle() {
        try {
            console.log('💕 Exiting to gentle state');
            this.transitionToState('gentle-exit-state');
            
            // Update exit message for positive response
            const exitMessage = this.elements['exit-message'];
            if (exitMessage) {
                exitMessage.innerHTML = `
                    <p>Thank you for sharing this moment with me.</p>
                    <p>Your response means everything. 💕</p>
                `;
            }
            
        } catch (error) {
            console.error('Exit to gentle failed:', error);
            this.transitionToState('gentle-exit-state');
        }
    },
    showVideoFallback() {
        try {
            const videoContainer = document.querySelector('.video-frame');
            if (videoContainer) {
                videoContainer.innerHTML = `
                    <div class="video-fallback-container">
                        <div class="fallback-heart">💕</div>
                        <h2>Our Love Story</h2>
                        <p>Imagine the most beautiful moments we've shared, playing like a movie in your heart ✨</p>
                        <div class="love-message" style="font-size: 2rem; font-style: italic; margin-top: 2rem; animation: loveMessageGlow 2s ease-in-out infinite;">
                            I love you kuku
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Video fallback failed:', error);
        }
    },
    
    /**
     * Create celebration effects
     */
    createCelebrationEffects() {
        try {
            // Create floating hearts
            this.createFloatingHearts();
            
            // Create confetti effect
            this.createConfetti();
            
        } catch (error) {
            console.error('Celebration effects failed:', error);
        }
    },
    
    /**
     * Create floating hearts animation
     */
    createFloatingHearts() {
        try {
            const heartsContainer = document.createElement('div');
            heartsContainer.className = 'floating-hearts-container';
            heartsContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(heartsContainer);
            
            const createHeart = () => {
                const heart = document.createElement('div');
                heart.innerHTML = '💕';
                heart.style.cssText = `
                    position: absolute;
                    font-size: ${Math.random() * 30 + 20}px;
                    left: ${Math.random() * 100}%;
                    animation: floatUp 4s linear forwards;
                    opacity: 0.8;
                `;
                
                heartsContainer.appendChild(heart);
                
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 4000);
            };
            
            // Create hearts periodically
            const heartInterval = setInterval(createHeart, 500);
            
            // Stop after 10 seconds
            setTimeout(() => {
                clearInterval(heartInterval);
                setTimeout(() => {
                    if (heartsContainer.parentNode) {
                        heartsContainer.parentNode.removeChild(heartsContainer);
                    }
                }, 4000);
            }, 10000);
            
        } catch (error) {
            console.error('Floating hearts creation failed:', error);
        }
    },
    
    /**
     * Create confetti effect
     */
    createConfetti() {
        try {
            // Simple confetti implementation
            const colors = ['#ff6b9d', '#fd79a8', '#fdcb6e', '#a29bfe', '#74b9ff'];
            const confettiContainer = document.createElement('div');
            confettiContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999;
            `;
            document.body.appendChild(confettiContainer);
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
                    animation-delay: ${Math.random() * 2}s;
                `;
                confettiContainer.appendChild(confetti);
            }
            
            // Clean up after animation
            setTimeout(() => {
                if (confettiContainer.parentNode) {
                    confettiContainer.parentNode.removeChild(confettiContainer);
                }
            }, 6000);
            
        } catch (error) {
            console.error('Confetti creation failed:', error);
        }
    },
    
    /**
     * Record user choice
     */
    recordChoice(type, value) {
        try {
            // Send to backend
            fetch('/api/choice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, value })
            })
            .then(response => {
                if (!response.ok) {
                    console.warn(`Choice API returned ${response.status}`);
                    return response.text().then(text => {
                        console.warn('Choice API error details:', text);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    console.log('Choice recorded successfully:', data);
                }
            })
            .catch(error => {
                console.warn('Failed to record choice:', error);
                // Don't let API failures break the user experience
            });
            
        } catch (error) {
            console.error('Choice recording failed:', error);
        }
    },
    
    /**
     * Report state change to backend
     */
    reportStateChange(state) {
        try {
            fetch(`/api/state/${state}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    console.warn(`State API returned ${response.status} for ${state}`);
                    return response.text().then(text => {
                        console.warn('State API error details:', text);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    console.log('State change reported successfully:', data);
                }
            })
            .catch(error => {
                console.warn('Failed to report state change:', error);
                // Don't let API failures break the user experience
            });
            
        } catch (error) {
            console.error('State reporting failed:', error);
        }
    },
    
    /**
     * Announce state changes to screen readers
     */
    announceStateChange(state) {
        try {
            const announcements = this.elements.announcements;
            if (announcements) {
                const messages = {
                    'loading': 'Loading your romantic experience',
                    'ambient-idle': 'Welcome to your Valentine\'s moment',
                    'intro-text': 'Reading romantic introduction',
                    'presence-acknowledgement': 'Acknowledging your presence',
                    'distance-visualization': 'Visualizing emotional connection',
                    'personal-memory': 'Sharing a personal memory',
                    'valentine-question': 'Asking the important question',
                    'decision-state': 'Time to make your choice',
                    'confirmation-state': 'Celebrating your response',
                    'gentle-exit-state': 'Thank you for your honesty'
                };
                
                announcements.textContent = messages[state] || `Transitioning to ${state}`;
            }
        } catch (error) {
            console.error('Announcement failed:', error);
        }
    },
    
    /**
     * Clear all timers
     */
    clearTimers() {
        try {
            Object.values(this.timers).forEach(timer => {
                if (timer) {
                    clearTimeout(timer);
                    clearInterval(timer);
                }
            });
            
            // Reset timers
            this.timers = {
                loading: null,
                typewriter: null,
                stateTransition: null,
                patternRotation: null
            };
            
        } catch (error) {
            console.error('Timer clearing failed:', error);
        }
    },
    
    /**
     * Handle errors with user-friendly messages
     */
    handleError(message) {
        try {
            this.state.errorCount++;
            console.error(`💔 Error ${this.state.errorCount}: ${message}`);
            
            // Show error to user if too many errors
            if (this.state.errorCount >= this.config.maxErrors) {
                this.showCriticalError();
                return;
            }
            
            // Try to recover gracefully
            this.attemptRecovery(message);
            
        } catch (error) {
            console.error('Error handling failed:', error);
            this.showCriticalError();
        }
    },
    
    /**
     * Attempt graceful recovery
     */
    attemptRecovery(originalError) {
        try {
            console.log('🔧 Attempting graceful recovery...');
            
            // Clear any problematic timers
            this.clearTimers();
            
            // Reset to a safe state
            if (this.state.current === 'loading') {
                setTimeout(() => {
                    this.transitionToState('ambient-idle');
                }, 2000);
            } else if (!this.validateState(this.state.current)) {
                this.transitionToState('ambient-idle');
            }
            
        } catch (error) {
            console.error('Recovery failed:', error);
            this.showCriticalError();
        }
    },
    
    /**
     * Show critical error state
     */
    showCriticalError() {
        try {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 2rem;
                    text-align: center;
                    background: linear-gradient(135deg, #ff6b9d, #fd79a8);
                    color: white;
                    font-family: 'Segoe UI', sans-serif;
                ">
                    <h1 style="font-size: 3rem; margin-bottom: 2rem;">💕</h1>
                    <h2 style="font-size: 2rem; margin-bottom: 1rem;">A Simple Message</h2>
                    <p style="max-width: 500px; line-height: 1.6; margin-bottom: 2rem; font-size: 1.2rem;">
                        Sometimes technology fails us, but the intention behind it remains pure.
                    </p>
                    <p style="max-width: 500px; line-height: 1.6; margin-bottom: 2rem;">
                        This was meant to be a gentle, interactive experience about love and connection.
                    </p>
                    <p style="max-width: 500px; line-height: 1.6; margin-bottom: 2rem;">
                        Even without all the features working, the core message stands:
                    </p>
                    <p style="font-size: 1.5rem; font-weight: bold; margin-bottom: 2rem;">
                        ❤️ Your feelings are valid, whatever you choose ❤️
                    </p>
                    <button onclick="location.reload()" style="
                        padding: 1rem 2rem;
                        background: rgba(255,255,255,0.2);
                        border: 2px solid white;
                        color: white;
                        border-radius: 50px;
                        cursor: pointer;
                        font-size: 1.1rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                        Try Again 💕
                    </button>
                </div>
            `;
            
        } catch (error) {
            console.error('Critical error display failed:', error);
            // Last resort
            document.body.innerHTML = '<h1>💕 Love finds a way, even when technology doesn\'t! 💕</h1>';
        }
    },
    
    /**
     * Concentric Hearts Background System
     */
    concentricHeartsBackground: {
        container: null,
        isActive: false,
        
        // States that should have the concentric hearts background
        enabledStates: [
            'loading',
            'ambient-idle',
            'intro-text',
            'presence-acknowledgement',
            'distance-visualization',
            'confirmation-state'
        ],
        
        // States that should have the bright red hearts background
        redHeartsStates: [
            'personal-memory',
            'valentine-question', 
            'decision-state'
        ],
        
        /**
         * Initialize the concentric hearts background
         */
        init() {
            try {
                // Create pink hearts background container
                this.container = document.createElement('div');
                this.container.className = 'concentric-hearts-bg inactive';
                this.container.id = 'concentric-hearts-bg';
                
                // Create red hearts background container
                this.redContainer = document.createElement('div');
                this.redContainer.className = 'concentric-hearts-bg red-hearts inactive';
                this.redContainer.id = 'concentric-red-hearts-bg';
                
                // Create pink hearts
                this.createHeartsContainer(this.container, 'pink');
                
                // Create red hearts
                this.createHeartsContainer(this.redContainer, 'red');
                
                document.body.appendChild(this.container);
                document.body.appendChild(this.redContainer);
                
                console.log('💖 Concentric hearts background initialized with pink and red variants');
                
            } catch (error) {
                console.error('Failed to initialize concentric hearts background:', error);
            }
        },
        
        /**
         * Create hearts container with specified color scheme
         */
        createHeartsContainer(container, colorScheme) {
            const heartsContainer = document.createElement('div');
            heartsContainer.className = 'hearts-container';
            
            // Define color palettes
            const colorPalettes = {
                pink: [
                    'rgba(244, 114, 182, 0.8)',
                    'rgba(251, 182, 206, 0.7)',
                    'rgba(253, 230, 138, 0.6)',
                    'rgba(244, 114, 182, 0.5)',
                    'rgba(251, 182, 206, 0.4)',
                    'rgba(253, 230, 138, 0.3)',
                    'rgba(244, 114, 182, 0.2)',
                    'rgba(251, 182, 206, 0.1)'
                ],
                red: [
                    'rgba(220, 38, 127, 0.8)',   // Bright deep red
                    'rgba(239, 68, 68, 0.7)',    // Bright red
                    'rgba(248, 113, 113, 0.6)',  // Light red
                    'rgba(220, 38, 127, 0.5)',   // Bright deep red
                    'rgba(239, 68, 68, 0.4)',    // Bright red
                    'rgba(248, 113, 113, 0.3)',  // Light red
                    'rgba(220, 38, 127, 0.2)',   // Bright deep red
                    'rgba(239, 68, 68, 0.1)'     // Bright red
                ]
            };
            
            const colors = colorPalettes[colorScheme];
            
            // Create multiple heart layers with SVG hearts
            for (let i = 0; i < 8; i++) {
                const heartLayer = document.createElement('div');
                heartLayer.className = 'heart-layer';
                heartLayer.style.setProperty('--heart-delay', `${-i}s`);
                
                // Create SVG heart
                const heartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                heartSvg.setAttribute('viewBox', '0 0 24 24');
                heartSvg.setAttribute('class', 'heart-svg');
                
                const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                heartPath.setAttribute('d', 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z');
                heartPath.setAttribute('fill', colors[i]);
                
                heartSvg.appendChild(heartPath);
                heartLayer.appendChild(heartSvg);
                heartsContainer.appendChild(heartLayer);
            }
            
            container.appendChild(heartsContainer);
        },
        
        /**
         * Enable the background for specific state
         */
        enable(stateName) {
            if (!this.container) {
                this.init();
            }
            
            // Disable both first
            this.disableAll();
            
            if (this.enabledStates.includes(stateName)) {
                this.container.classList.remove('inactive');
                this.container.classList.add('active');
                this.isActive = true;
                console.log(`💖 Pink concentric hearts background enabled for: ${stateName}`);
            } else if (this.redHeartsStates.includes(stateName)) {
                this.redContainer.classList.remove('inactive');
                this.redContainer.classList.add('active');
                this.isActive = true;
                console.log(`❤️ Red concentric hearts background enabled for: ${stateName}`);
            }
        },
        
        /**
         * Disable all backgrounds
         */
        disableAll() {
            if (this.container) {
                this.container.classList.remove('active');
                this.container.classList.add('inactive');
            }
            if (this.redContainer) {
                this.redContainer.classList.remove('active');
                this.redContainer.classList.add('inactive');
            }
            this.isActive = false;
        },
        
        /**
         * Disable the background
         */
        disable() {
            this.disableAll();
            console.log('💖 Concentric hearts background disabled');
        },
        
        /**
         * Update background based on current state
         */
        updateForState(stateName) {
            if (this.enabledStates.includes(stateName) || this.redHeartsStates.includes(stateName)) {
                this.enable(stateName);
            } else {
                this.disable();
            }
        }
    }
};

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export for global access
window.ValentineApp = ValentineApp;