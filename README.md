# 💕 Personal Valentine's Day Experience

A beautiful, interactive Valentine's Day webpage with PIN protection for sharing a romantic experience with someone special.

## ✨ Features

### 🎨 **Beautiful Design**
- **Glass morphism effects** with romantic gradients
- **Smooth animations** and state transitions
- **Responsive design** for all devices
- **Romantic color palette** with pink and coral tones

### 🔒 **PIN Protection**
- **Secure access** with custom PIN (230908)
- **Beautiful PIN entry page** with floating hearts
- **Session management** for seamless experience
- **Privacy protection** for your romantic message

### 💖 **Interactive Experience**
- **Multi-state journey** from loading to confirmation
- **Personal message display** with elegant typography
- **Memory sharing section** for special moments
- **Valentine question** with interactive responses
- **Video integration** for celebration moments

### 📱 **Technical Features**
- **Flask web application** with robust error handling
- **State management** for smooth user experience
- **Video file serving** with proper MIME types
- **Health check endpoints** for monitoring
- **Comprehensive logging** for debugging

## 🚀 Quick Start

### **Local Development**
```bash
# Clone the repository
git clone <your-repo-url>
cd valentine-webpage

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py

# Visit http://localhost:5000
# Enter PIN: 230908
```

### **Production Deployment (Render - FREE)**
```bash
# 1. Push to GitHub
git add .
git commit -m "Personal Valentine webpage ready"
git push origin main

# 2. Deploy to Render
# - Go to render.com
# - Connect GitHub repository
# - Build Command: ./build.sh
# - Start Command: gunicorn app:app
# - Deploy!
```

## 📁 Project Structure

```
valentine-webpage/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── build.sh              # Build script for deployment
├── render.yaml           # Render deployment config
├── static/
│   ├── css/
│   │   └── valentine.css # Styling and animations
│   ├── js/
│   │   └── valentine.js  # Interactive functionality
│   └── videos/
│       └── valentine-video.mp4
├── templates/
│   ├── index.html        # Main Valentine experience
│   ├── pin_entry.html    # PIN protection page
│   └── error.html        # Error handling
└── valentine_app.log     # Application logs
```

## 🔐 PIN Access

**PIN**: `230908`

The experience is protected with a PIN for privacy. Share both the URL and PIN with your special someone:

- **URL**: Your deployed website URL
- **PIN**: 230908

## 🎯 User Journey

1. **PIN Entry** - Beautiful entry page with floating hearts
2. **Loading** - Romantic loading animation
3. **Welcome** - Ambient introduction with your names
4. **Message** - Display your personal romantic message
5. **Memory** - Share a special memory together
6. **Question** - Ask the important Valentine question
7. **Response** - Interactive buttons for their answer
8. **Celebration** - Video and confirmation for "Yes"
9. **Gentle Exit** - Respectful response for other choices

## 🎨 Customization

### **Personal Content**
Edit these in `templates/index.html`:
- **Names**: Update creator and recipient names
- **Message**: Your personal romantic message
- **Memory**: Special memory to share
- **Question**: Your Valentine question
- **Video**: Replace `valentine-video.mp4` with your video

### **Styling**
Edit `static/css/valentine.css`:
- **Colors**: Modify CSS custom properties
- **Animations**: Adjust timing and effects
- **Layout**: Responsive design settings

### **PIN Protection**
Change PIN in `app.py`:
```python
app.config.update(
    VALENTINE_PIN='your-new-pin'  # Change from 230908
)
```

## 🌐 Deployment Options

### **Free Hosting (Recommended)**
- **Render**: Free tier with 750 hours/month
- **Railway**: $5 monthly credit (usually enough)
- **Heroku**: Free with limitations (sleeps after 30 min)

### **Custom Domain**
- Connect your own domain (e.g., `ourvalentine.com`)
- Automatic HTTPS included with most platforms
- Professional appearance for sharing

## 🔧 Environment Variables

For production deployment:
```bash
SECRET_KEY=your-secret-key-here
FLASK_ENV=production
VALENTINE_PIN=230908
```

## 📊 Monitoring

### **Health Check**
Visit `/api/health` to check application status

### **Logs**
Application logs are saved to `valentine_app.log`

## 💡 Usage Tips

### **Sharing**
1. Deploy to your chosen platform
2. Get your live URL (e.g., `https://your-valentine.onrender.com`)
3. Share both URL and PIN (230908) with your special someone
4. They enter the PIN and experience your romantic message

### **Privacy**
- PIN protection ensures only intended recipient can access
- No data is stored or tracked
- Experience is completely private between you two

### **Mobile Experience**
- Fully responsive design works on all devices
- Touch-friendly interactions
- Optimized for mobile viewing

## 🎊 Perfect For

- 💕 **Valentine's Day** romantic messages
- 💍 **Proposals** and special announcements  
- 🎂 **Anniversaries** and relationship milestones
- 💌 **Long-distance relationships** staying connected
- 🎁 **Surprise messages** for any romantic occasion

## 🆘 Support

### **Common Issues**
- **PIN not working**: Check PIN is exactly `230908`
- **Video not playing**: Ensure video file is in `static/videos/`
- **Mobile issues**: Clear browser cache and reload

### **Customization Help**
- Edit content in HTML templates
- Modify colors in CSS custom properties
- Update PIN in Flask app configuration

---

**Create beautiful, private romantic experiences with PIN protection! 💕**

*Made with love for sharing love* ❤️