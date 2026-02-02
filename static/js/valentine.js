/**
 * Valentine's Day Interactive Experience - JavaScript
 * Fault-tolerant, romantic web application with aggressive error handling
 */

// Main Application Object with aggressive fault checking
const ValentineApp = {
    // Application state
    state: {
        current: 'loading',
        initialized: false,
        videoLoaded: false,
        errorCount: 0,
        maxErrors: 5
    },
    
    // DOM elements cache
    elements: {},
    
    // Timers and intervals
    timers: {
        loading: null,
        typewriter: null,
        stateTransition: null
    },
    
    // Configuration
    config: {
        typewriterSpeed: 50,
        stateTransitionDelay: 1000,
        videoEndThreshold: 2, // seconds before end to show overlay
        maxRetries: 3
    },
    
    /**
     * Initialize the application with comprehensive error handling
     */
    initialize() {
        try {
            console.log('🌹 Initializing Valentine\'s Day Experience...');
            
            // Validate browser compatibility
            if (!this.checkBrowserCompatibility()) {
                throw new Error('Browser not compatible');
            }
            
            // Cache DOM elements
            this.cacheElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize video if available
            this.initializeVideo();
            
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
    setupEventListeners() {
        try {
            // Global error handling
            window.addEventListener('error', (event) => {
                this.handleError(`JavaScript error: ${event.message}`);
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError(`Unhandled promise rejection: ${event.reason}`);
            });
            
            // Decision button listeners
            if (this.elements.decisionButtons) {
                this.elements.decisionButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        try {
                            const choice = e.target.closest('.decision-btn').dataset.choice;
                            this.handleDecision(choice);
                        } catch (error) {
                            console.error('Decision button error:', error);
                            this.handleError('Failed to process decision');
                        }
                    });
                });
            }
            
            // Scroll listener for presence acknowledgement
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (this.state.current === 'presence-acknowledgement' && window.scrollY > 50) {
                        this.transitionToState('distance-visualization');
                    } else if (this.state.current === 'distance-visualization' && window.scrollY > 100) {
                        this.transitionToState('personal-memory');
                    }
                }, 100);
            });
            
            // Keyboard accessibility
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (this.state.current === 'ambient-idle') {
                        e.preventDefault();
                        this.transitionToState('intro-text');
                    }
                }
            });
            
            // Click listener for ambient idle
            document.addEventListener('click', (e) => {
                if (this.state.current === 'ambient-idle') {
                    this.transitionToState('intro-text');
                }
            }, { once: true });
            
            console.log('🎯 Event listeners set up successfully');
            
        } catch (error) {
            console.error('Event listener setup failed:', error);
            this.handleError('Failed to set up interactions');
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
     * Transition between states with validation
     */
    transitionToState(newState) {
        try {
            if (!this.validateState(newState)) {
                throw new Error(`Invalid state: ${newState}`);
            }
            
            const oldState = this.state.current;
            console.log(`🔄 Transitioning: ${oldState} → ${newState}`);
            
            // Clear any existing timers
            this.clearTimers();
            
            // Hide current state
            this.hideAllStates();
            
            // Show new state
            this.showState(newState);
            
            // Update state
            this.state.current = newState;
            
            // Handle state-specific logic
            this.handleStateLogic(newState);
            
            // Announce to screen readers
            this.announceStateChange(newState);
            
            // Send to backend if available
            this.reportStateChange(newState);
            
        } catch (error) {
            console.error('State transition failed:', error);
            this.handleError(`Failed to transition to ${newState}`);
        }
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
     * Hide all state containers
     */
    hideAllStates() {
        try {
            document.querySelectorAll('.state-container').forEach(container => {
                container.classList.remove('active');
                container.style.display = 'none';
            });
        } catch (error) {
            console.error('Failed to hide states:', error);
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
                
                // Scroll to top for new state
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
     * Generic typewriter effect
     */
    typewriterEffect(element, text, callback) {
        try {
            let charIndex = 0;
            element.textContent = '';
            
            const typeChar = () => {
                if (charIndex < text.length) {
                    element.textContent += text[charIndex];
                    charIndex++;
                    this.timers.typewriter = setTimeout(typeChar, this.config.typewriterSpeed + Math.random() * 30);
                } else if (callback) {
                    callback();
                }
            };
            
            typeChar();
            
        } catch (error) {
            console.error('Typewriter effect failed:', error);
            element.textContent = text;
            if (callback) callback();
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
            
            // Play video
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('📹 Video playing successfully');
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
            
            if (overlay) {
                overlay.classList.add('show');
            }
            
            if (video) {
                video.style.filter = 'brightness(0.7)';
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
     * Show video fallback
     */
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
                            I love you
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
            .then(response => response.json())
            .then(data => {
                console.log('Choice recorded:', data);
            })
            .catch(error => {
                console.warn('Failed to record choice:', error);
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
            .catch(error => {
                console.warn('Failed to report state change:', error);
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
                stateTransition: null
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