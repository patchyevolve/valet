# 💕 Valentine's Day Interactive Experience

A beautiful, romantic interactive Valentine's Day webpage with smooth animations and engaging user interactions.

## Features

- **Interactive Journey**: Multi-state experience from ambient welcome to decision
- **Beautiful Animations**: Concentric hearts background, typewriter effects, smooth transitions
- **Distance Visualization**: Animated pin drops with heart-shaped flight path
- **Teleportation Effects**: Playful button teleportation for non-yes responses
- **Video Integration**: Custom Valentine's message with overlay text
- **Mobile Optimized**: Responsive design with touch gesture support

## States Flow

1. **Loading** - Beautiful heart loader with progress bar
2. **Ambient Idle** - Welcome screen with interaction hint
3. **Intro Text** - Typewriter effect with romantic messages
4. **Presence Acknowledgement** - Appreciation for user's presence
5. **Distance Visualization** - Animated pins and heart-path paper plane
6. **Personal Memory** - Shared memory revelation
7. **Valentine Question** - The big question
8. **Decision State** - Three choice buttons with teleportation
9. **Confirmation/Gentle Exit** - Video or gentle response

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python app.py
   ```

3. Open browser to `http://localhost:5000`

## File Structure

```
valentine-webpage/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   └── valentine.css  # Original working styles
│   ├── js/
│   │   └── valentine.js   # Original working JavaScript
│   └── videos/
│       └── valentine-video.mp4
├── templates/
│   ├── index.html         # Main template
│   └── error.html         # Error template
└── README.md
```

## Customization

- **Colors**: Modify CSS custom properties in `:root`
- **Messages**: Update text arrays in JavaScript
- **Video**: Replace `valentine-video.mp4` with your video
- **Backgrounds**: Adjust gradient colors in CSS state classes

---

*Created with love for special moments* 💕