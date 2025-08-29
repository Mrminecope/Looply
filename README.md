# Looply - Social Media Reimagined

Looply is a next-generation social media platform built with React, TypeScript, and modern web technologies. It focuses on authentic connections, creative expression, and meaningful communities with AI-powered features.

## ✨ Key Features

### 🎥 **Immersive Reels**
- Mobile-first video experience with smooth swiping
- AI-powered editing tools and effects
- Personalized algorithm for content discovery
- Advanced video compression and streaming

### 🤖 **LIA (Looply Intelligent Assistant)**
- **Enhanced Python Backend**: Advanced AI-powered content assistance
- **Caption Generation**: Smart post caption creation
- **Hashtag Suggestions**: Category-based hashtag recommendations
- **Content Ideas**: Creative inspiration for creators
- **Engagement Tips**: Social media best practices
- **Conversational Memory**: Persistent chat history and user profiles
- **Fallback Mode**: Works offline with built-in responses

### 🏘️ **Vibrant Communities**
- Interest-based community spaces
- Community challenges and events
- Advanced moderation tools
- Threaded discussions and polls

### 🛡️ **Advanced Safety**
- AI-powered content moderation
- Comprehensive reporting system
- Privacy-first design
- User blocking and filtering tools

### 📱 **Mobile-First PWA**
- Progressive Web App capabilities
- Offline functionality
- Push notifications
- Native app-like experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ (for LIA backend)
- Modern web browser

### 1. Frontend Setup

```bash
# Clone and install
git clone <repository-url>
cd looply
npm install

# Start development server
npm run dev
```

### 2. LIA Backend Setup (Enhanced AI Assistant)

```bash
# Navigate to LIA directory
cd lia/

# Automated setup
python setup.py

# Or manual setup
python -m venv lia_env
source lia_env/bin/activate  # Windows: lia_env\Scripts\activate
pip install -r requirements.txt

# Start LIA backend
./start_lia.sh              # Linux/macOS
start_lia.bat               # Windows
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **LIA API**: http://localhost:5002
- **API Health**: http://localhost:5002/health

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Motion/React** for smooth animations
- **Local Storage** for offline-first data management

### LIA Backend Stack
- **Python 3.8+** with Flask
- **SQLite** for conversational memory
- **Modular skill system** for extensibility
- **RESTful API** with CORS support
- **Built-in fallback responses** for offline mode

## 🎯 Core Principles

- **Mobile-First**: Optimized for mobile devices with touch interactions
- **Performance**: Fast loading with smooth 60fps animations
- **Accessibility**: WCAG 2.1 AA compliant
- **Privacy**: User data stays local with optional cloud sync
- **Authenticity**: Focus on genuine connections over metrics

## 📖 Documentation

### Getting Started
- [Implementation Guide](docs/Implementation-Guide.md)
- [LIA Integration Guide](docs/LIA-Integration-Guide.md)
- [OAuth Setup Guide](docs/OAuth-Setup-Guide.md)

### Development
- [API Reference](docs/API-Reference.md)
- [Tech Stack Recommendations](docs/Tech-Stack-Recommendations.md)
- [Video Implementation Guide](docs/Video-API-Implementation.md)

### Deployment
- [Production Deployment Checklist](docs/Production-Deployment-Checklist.md)
- [DEPLOYMENT GUIDE](DEPLOYMENT_GUIDE.md)

### LIA Enhanced Backend
- [LIA Setup and Configuration](lia/README.md)
- [Skill Development Guide](docs/LIA-Integration-Guide.md)
- [API Documentation](lia/README.md#api-endpoints)

## 🛠️ Development

### Frontend Development
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### LIA Backend Development
```bash
cd lia/

# Start in development mode
python lia_enhanced_lia.py --api

# Run tests
pytest tests/

# Format code
black lia_enhanced_lia.py

# Lint code
flake8 lia_enhanced_lia.py
```

## 🧪 Testing

### Frontend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### LIA Backend Testing
```bash
cd lia/

# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=lia_enhanced_lia
```

## 🚢 Deployment

### Frontend Deployment
- **Vercel/Netlify**: Automatic deployment from Git
- **GitHub Pages**: Static site hosting
- **AWS S3 + CloudFront**: Scalable CDN deployment

### LIA Backend Deployment
```bash
# Using Docker
docker build -t lia-backend lia/
docker run -p 5002:5002 lia-backend

# Using systemd (Linux)
sudo cp lia/lia.service.template /etc/systemd/system/lia.service
# Edit service file paths
sudo systemctl enable lia
sudo systemctl start lia
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the coding standards and add tests
4. Commit your changes (`git commit -m 'Add AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Coding Standards
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Black + Flake8 for Python code
- **Commits**: Conventional commit messages
- **Testing**: Minimum 80% code coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and TypeScript communities
- Tailwind CSS for the utility-first approach
- Motion/React for beautiful animations
- Flask community for the lightweight backend framework
- All contributors and early adopters

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **LIA Issues**: Check the `/lia/README.md` troubleshooting section
- **Frontend Issues**: Use browser developer tools and check console
- **Performance**: Use the built-in performance monitor

---

**Built with ❤️ for authentic social connections** 🌟

*Looply v1.0 - Where genuine relationships flourish*