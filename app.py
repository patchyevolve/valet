#!/usr/bin/env python3
"""
Valentine's Day Interactive Flask Application
A romantic, fault-tolerant web experience with vibrant UI
"""

import os
import logging
import mimetypes
from pathlib import Path
from flask import Flask, render_template, jsonify, request, send_from_directory, abort
from werkzeug.exceptions import RequestEntityTooLarge
import traceback

# Configure logging for aggressive fault checking
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('valentine_app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app with robust configuration
app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'valentine-secret-key-2024'),
    MAX_CONTENT_LENGTH=50 * 1024 * 1024,  # 50MB max file size
    TEMPLATES_AUTO_RELOAD=True,
    SEND_FILE_MAX_AGE_DEFAULT=0  # Disable caching for development
)

# Fault checking: Ensure required directories exist
REQUIRED_DIRS = ['static', 'static/css', 'static/js', 'static/videos', 'templates']
for directory in REQUIRED_DIRS:
    Path(directory).mkdir(parents=True, exist_ok=True)
    logger.info(f"Ensured directory exists: {directory}")

# Application state management
class ValentineState:
    """Manages application state with fault tolerance"""
    
    def __init__(self):
        self.states = [
            'loading',
            'ambient_idle',
            'intro_text', 
            'presence_acknowledgement',
            'distance_visualization',
            'personal_memory',
            'valentine_question',
            'decision_state',
            'confirmation_state',
            'gentle_exit_state'
        ]
        self.current_state = 'loading'
        self.user_choices = {}
        logger.info("Valentine state manager initialized")
    
    def validate_state(self, state):
        """Validate state with aggressive checking"""
        if not isinstance(state, str):
            logger.error(f"Invalid state type: {type(state)}")
            return False
        
        if state not in self.states:
            logger.error(f"Unknown state: {state}")
            return False
        
        return True
    
    def transition_to(self, new_state):
        """Safely transition between states"""
        try:
            if not self.validate_state(new_state):
                raise ValueError(f"Invalid state transition to: {new_state}")
            
            old_state = self.current_state
            self.current_state = new_state
            logger.info(f"State transition: {old_state} -> {new_state}")
            return True
            
        except Exception as e:
            logger.error(f"State transition failed: {e}")
            return False
    
    def record_choice(self, choice_type, choice_value):
        """Record user choices with validation"""
        try:
            if not isinstance(choice_type, str) or not choice_value:
                raise ValueError("Invalid choice parameters")
            
            self.user_choices[choice_type] = choice_value
            logger.info(f"User choice recorded: {choice_type} = {choice_value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to record choice: {e}")
            return False

# Global state manager
valentine_state = ValentineState()

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors gracefully"""
    logger.warning(f"404 error: {request.url}")
    return render_template('error.html', 
                         error_code=404,
                         error_message="Page not found, but love is everywhere! 💕"), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with romantic fallback"""
    logger.error(f"500 error: {error}")
    return render_template('error.html',
                         error_code=500, 
                         error_message="Something went wrong, but our love is unbreakable! ❤️"), 500

@app.errorhandler(RequestEntityTooLarge)
def too_large(error):
    """Handle file too large errors"""
    logger.warning("File too large uploaded")
    return jsonify({'error': 'File too large! Love should be limitless, but files have limits 😅'}), 413

@app.route('/')
def index():
    """Main route with comprehensive fault checking"""
    try:
        # Reset state for new session
        valentine_state.transition_to('loading')
        
        # Check if video file exists
        video_path = Path('static/videos/valentine-video.mp4')
        video_exists = video_path.exists()
        
        if not video_exists:
            logger.warning("Video file not found, will use fallback")
        
        # Check template exists
        template_path = Path('templates/index.html')
        if not template_path.exists():
            logger.error("Main template missing!")
            return "Template error - but love finds a way! ❤️", 500
        
        logger.info("Rendering main page successfully")
        return render_template('index.html', video_exists=video_exists)
        
    except Exception as e:
        logger.error(f"Error in main route: {e}")
        logger.error(traceback.format_exc())
        return f"Error loading page, but love persists! ❤️<br>Error: {str(e)}", 500

@app.route('/api/state/<state_name>', methods=['POST'])
def transition_state(state_name):
    """API endpoint for state transitions with validation"""
    try:
        if not valentine_state.validate_state(state_name):
            return jsonify({'error': 'Invalid state', 'success': False}), 400
        
        success = valentine_state.transition_to(state_name)
        if not success:
            return jsonify({'error': 'State transition failed', 'success': False}), 500
        
        return jsonify({
            'success': True,
            'current_state': valentine_state.current_state,
            'message': f'Transitioned to {state_name}'
        })
        
    except Exception as e:
        logger.error(f"State transition API error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/choice', methods=['POST'])
def record_choice():
    """API endpoint for recording user choices"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided', 'success': False}), 400
        
        choice_type = data.get('type')
        choice_value = data.get('value')
        
        if not choice_type or not choice_value:
            return jsonify({'error': 'Missing choice data', 'success': False}), 400
        
        success = valentine_state.record_choice(choice_type, choice_value)
        if not success:
            return jsonify({'error': 'Failed to record choice', 'success': False}), 500
        
        # Handle special choices
        response_data = {'success': True, 'choice_recorded': True}
        
        if choice_type == 'valentine_response':
            if choice_value == 'yes':
                valentine_state.transition_to('confirmation_state')
                response_data['next_state'] = 'confirmation_state'
                response_data['message'] = 'Love is in the air! 💕'
            elif choice_value in ['maybe', 'friends']:
                valentine_state.transition_to('gentle_exit_state')
                response_data['next_state'] = 'gentle_exit_state'
                response_data['message'] = 'Your feelings are valid ❤️'
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Choice recording API error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check critical components
        checks = {
            'template_exists': Path('templates/index.html').exists(),
            'static_dir_exists': Path('static').exists(),
            'video_exists': Path('static/videos/valentine-video.mp4').exists(),
            'current_state': valentine_state.current_state,
            'state_valid': valentine_state.validate_state(valentine_state.current_state)
        }
        
        all_good = all([checks['template_exists'], checks['static_dir_exists'], checks['state_valid']])
        
        return jsonify({
            'status': 'healthy' if all_good else 'degraded',
            'checks': checks,
            'message': 'Love is always healthy! ❤️'
        })
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/static/videos/<filename>')
def serve_video(filename):
    """Serve video files with proper headers and fault tolerance"""
    try:
        video_dir = Path('static/videos')
        video_path = video_dir / filename
        
        # Security check: prevent directory traversal
        if not str(video_path.resolve()).startswith(str(video_dir.resolve())):
            logger.warning(f"Directory traversal attempt: {filename}")
            abort(403)
        
        if not video_path.exists():
            logger.warning(f"Video file not found: {filename}")
            abort(404)
        
        # Set proper MIME type
        mimetype = mimetypes.guess_type(filename)[0] or 'video/mp4'
        
        logger.info(f"Serving video: {filename}")
        return send_from_directory('static/videos', filename, mimetype=mimetype)
        
    except Exception as e:
        logger.error(f"Video serving error: {e}")
        abort(500)

if __name__ == '__main__':
    try:
        # Final startup checks
        logger.info("Starting Valentine's Day Flask Application")
        
        # Check Python version
        import sys
        if sys.version_info < (3, 7):
            logger.error("Python 3.7+ required")
            sys.exit(1)
        
        # Check Flask version
        import flask
        logger.info(f"Flask version: {flask.__version__}")
        
        # Ensure video directory and copy video if needed
        video_dir = Path('static/videos')
        video_dir.mkdir(exist_ok=True)
        
        # Check if video exists in root and copy it
        root_video = Path('Untitled video - Made with Clipchamp.mp4')
        target_video = video_dir / 'valentine-video.mp4'
        
        if root_video.exists() and not target_video.exists():
            import shutil
            shutil.copy2(root_video, target_video)
            logger.info("Video file copied to static directory")
        
        # Start the application
        logger.info("All checks passed, starting server...")
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)