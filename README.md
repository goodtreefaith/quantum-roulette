# 🌟 Quantum Roulette • Future Gaming Experience

A futuristic marble roulette game with stunning holographic UI, advanced performance monitoring, and extensive customization options.

## ✨ New Features & Improvements

### 🎨 Futuristic UI Design
- **Holographic Glass-morphism**: Translucent panels with blur effects
- **Neon Cyberpunk Theme**: Cyan, pink, and purple color scheme
- **Animated Backgrounds**: Flowing gradients and particle effects
- **Smooth Transitions**: 60fps animations with cubic-bezier easing
- **Responsive Design**: Optimized for all screen sizes

### ⚡ Performance Enhancements
- **Real-time FPS Monitoring**: Track performance with live metrics
- **Adaptive Performance Modes**: 
  - ECO (50 FPS) - Battery saving
  - BALANCED (60 FPS) - Default experience  
  - HIGH (120 FPS) - Maximum performance
- **Smart Particle Management**: Dynamic particle count based on performance
- **Memory Usage Tracking**: Monitor JavaScript heap usage
- **Performance Suggestions**: Auto-recommendations for optimal settings

### 🎮 Quality of Life Improvements
- **Auto-Save Settings**: Persistent user preferences
- **Advanced Configuration Panel**: Comprehensive settings management
- **Interactive Animations**: Button ripples, hover effects, particle bursts
- **Enhanced Accessibility**: Better contrast, reduced motion support
- **Debounced Input Handling**: Smooth text input without lag
- **Visual Feedback**: Status indicators and progress animations

### 🎯 Gaming Features
- **Quantum Skills System**: Enhanced marble abilities
- **Multiple Victory Conditions**: First, last, or custom rank winners
- **Auto-Recording**: Capture gameplay automatically
- **Map Selection**: Choose from multiple arena layouts
- **Shake Mechanics**: Interactive marble physics

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- Yarn package manager

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd roulette-main

# Install dependencies with Yarn (recommended)
yarn install

# Start development server
yarn dev
```

### Alternative: NPM Installation
```bash
# If you prefer npm (may have compatibility issues)
npm install
npm run dev
```
## ⚙️ Advanced Configuration

### Performance Settings
- **Performance Mode**: Choose between ECO, BALANCED, or HIGH
- **Particle Density**: LOW, MEDIUM, HIGH, or ULTRA particle counts
- **FPS Counter**: Real-time performance monitoring
- **Advanced Stats**: Detailed performance metrics

### Visual Effects
- **Animations**: Toggle smooth UI transitions
- **Sound Effects**: Audio feedback (when implemented)
- **Haptic Feedback**: Controller vibration support
- **Glow Intensity**: Adjust neon effect brightness (0-2x)
- **Transparency**: UI panel opacity control (0.3-1.0)

### Camera Controls
- **Smoothing**: Camera movement interpolation (0-1)
- **Zoom Sensitivity**: Mouse wheel responsiveness (0.5-2x)

### Data Management
- **Auto-Save Results**: Persistent game history
- **Settings Backup**: Automatic preference storage

## 🎨 Customization

### CSS Variables
```css
:root {
  --neon-cyan: #00ffff;
  --neon-pink: #ff0080;
  --neon-purple: #8000ff;
  --neon-blue: #0080ff;
  --neon-green: #00ff80;
}
```

### Console Commands
- `window.options` - Access game settings
- `window.performance` - Performance metrics
- `window.animations` - Animation utilities
- `window.roullete` - Main game instance

## 🔧 Development

### Project Structure
```
src/
├── index.ts              # Main entry point
├── roulette.ts           # Core game logic
├── options.ts            # Enhanced settings management
├── utils/
│   ├── performance.ts    # Performance monitoring
│   └── animations.ts     # Animation system
├── data/                 # Game data and constants
└── types/               # TypeScript definitions
```

### Key Technologies
- **TypeScript**: Type-safe development
- **Parcel**: Zero-config bundling
- **Canvas API**: High-performance rendering
- **Web Animations API**: Smooth transitions
- **CSS Grid/Flexbox**: Responsive layouts

## 🎯 Usage Instructions

1. **Enter Participants**: Add names in the text area (comma or line separated)
2. **Configure Settings**: Choose map, recording, winner conditions
3. **Advanced Options**: Click "ADVANCED QUANTUM CONFIG" for detailed settings
4. **Start Simulation**: Click "INITIALIZE" to begin the roulette
5. **Interact**: Use "QUANTUM SHAKE" during gameplay for physics effects

### Name Format Examples
```
Alice, Bob, Charlie
Player1*5, Player2*10, Player3*3    # With probability weights
Team A/2, Team B/3                   # With bias factors
```

## 🔮 Future Enhancements

- Sound effects and audio feedback
- Multiplayer support
- Custom particle effects
- VR/AR compatibility
- Mobile app version
- Tournament mode

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT License - Free for all universes

---

