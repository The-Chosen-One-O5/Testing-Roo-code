# Forest Guardian Platformer

A 2D side-scrolling platformer game built with HTML5 and Phaser.js, featuring a brave forest guardian character navigating through mystical forest environments.

## 🎮 Game Features

### Core Gameplay
- **Responsive Controls**: WASD/Arrow keys for movement, Space for jumping, Shift for dashing
- **Variable Jump Height**: Hold jump button longer for higher jumps
- **Progressive Abilities**: Unlock double jump and dash moves by collecting gems
- **Smooth Animations**: Fluid character movement and state transitions

### Game Systems
- **Collectible Gems**: Gather gems to unlock new abilities and progress
- **Enemy AI**: Three distinct enemy types with unique behaviors:
  - Woodland Sprites (flying patrol)
  - Root Crawlers (ground pursuit)
  - Thorn Beasts (aggressive charge attacks)
- **Boss Battle**: Multi-phase Forest Guardian boss with varied attack patterns
- **Parallax Backgrounds**: Multi-layer scrolling for depth and immersion
- **Particle Effects**: Visual feedback for actions and interactions
- **Save System**: Progress persistence using localStorage
- **Audio System**: Placeholder beep sounds with volume controls

### UI Features
- **Health System**: Visual health bar and heart display
- **Gem Counter**: Track collected gems and ability unlock progress
- **Ability Icons**: Visual indicators for unlocked abilities
- **Game Timer**: Track completion time
- **Pause Menu**: ESC to pause, with restart and menu options

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (for development)

### Running the Game

1. **Clone or download** the project files
2. **Start a local server** in the project directory:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server
   ```
3. **Open your browser** and navigate to `http://localhost:8000`
4. **Start playing!** Click "Start Adventure" to begin

### Controls

| Action | Keys |
|--------|------|
| Move Left/Right | A/D or Arrow Keys |
| Jump | Space (hold for higher jumps) |
| Dash | Shift (when unlocked) |
| Pause | ESC |
| Restart | R (when paused) |
| Menu | M (when paused) |

## 🏗️ Project Structure

```
forest-guardian-platformer/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Game styling and UI
├── js/
│   ├── main.js             # Game initialization
│   ├── scenes/             # Game scenes
│   │   ├── PreloadScene.js # Asset loading
│   │   ├── MenuScene.js    # Main menu
│   │   ├── GameScene.js    # Main gameplay
│   │   └── UIScene.js      # UI overlay
│   ├── entities/           # Game objects
│   │   ├── Player.js       # Player character
│   │   ├── Enemy.js        # Enemy entities
│   │   └── Boss.js         # Boss entity
│   ├── systems/            # Game systems
│   │   ├── AudioManager.js # Sound management
│   │   ├── SaveSystem.js   # Progress saving
│   │   ├── InputManager.js # Input handling
│   │   └── AbilitySystem.js# Player abilities
│   └── utils/              # Utilities
│       ├── Constants.js    # Game configuration
│       └── Helpers.js      # Helper functions
└── assets/                 # Game assets (placeholder structure)
    ├── sprites/            # Character and object sprites
    ├── backgrounds/        # Background images
    ├── audio/              # Sound files
    └── maps/               # Level data
```

## 🎯 Gameplay Progression

### Ability Unlocks
- **5 Gems**: Double Jump - Jump again while in mid-air
- **10 Gems**: Dash Move - Quick horizontal movement burst

### Level Design
- **Tutorial Area**: Basic movement and jumping
- **Early Challenges**: First enemies and simple platforming
- **Mid-Level**: Multiple enemy types and ability unlocks
- **Advanced Section**: Complex platforming with all abilities
- **Boss Arena**: Final challenge against the Forest Guardian

## 🔧 Technical Details

### Built With
- **Phaser.js 3.70+**: Game framework
- **HTML5 Canvas**: Rendering
- **Web Audio API**: Sound generation
- **localStorage**: Save data persistence

### Performance Features
- **Object Pooling**: Efficient particle and projectile management
- **Culling**: Only update objects within camera bounds
- **Optimized Physics**: Arcade physics for smooth performance
- **Responsive Design**: Scales to different screen sizes

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎨 Art & Audio

### Graphics
- **Placeholder Art**: Colored rectangles and shapes for prototyping
- **Particle Effects**: Dynamic visual feedback
- **Parallax Backgrounds**: Multi-layer depth effect
- **Smooth Animations**: Fluid character movement

### Audio
- **Procedural Sounds**: Generated beep sounds for actions
- **Volume Controls**: Adjustable master, music, and SFX volumes
- **Audio Feedback**: Immediate response to player actions

## 🔮 Future Enhancements

### Planned Features
- **Real Assets**: Replace placeholder graphics with pixel art
- **Additional Biomes**: Crystal caves, sky islands, underwater grottos, volcanic peaks
- **More Abilities**: Wall sliding, ground pound, special attacks
- **Environmental Puzzles**: Switches, moving platforms, doors
- **Checkpoint System**: Save progress at specific points
- **Mobile Support**: Touch controls for mobile devices

### Technical Improvements
- **Asset Loading**: Real sprite sheets and audio files
- **Animation System**: Proper sprite-based animations
- **Level Editor**: Tool for creating custom levels
- **Multiplayer**: Local co-op gameplay

## 🐛 Known Issues

- Placeholder graphics and sounds
- Limited mobile optimization
- No real asset loading system yet
- Basic enemy AI (can be improved)

## 📝 Development Notes

This is a demo/prototype version showcasing the core game mechanics and systems. The focus has been on:

1. **Solid Foundation**: Robust architecture for future expansion
2. **Core Mechanics**: Responsive controls and satisfying gameplay
3. **System Integration**: All major systems working together
4. **Extensibility**: Easy to add new features and content

## 🤝 Contributing

This is a demo project, but contributions and suggestions are welcome! Areas for improvement:

- Asset creation (sprites, sounds, music)
- Additional enemy types and behaviors
- Level design and environmental art
- Performance optimizations
- Mobile compatibility

## 📄 License

This project is for educational and demonstration purposes. Feel free to use and modify for learning game development with Phaser.js.

## 🎮 Play Now!

Start your local server and begin your adventure as the Forest Guardian! Collect gems, unlock abilities, and face the challenges of the mystical forest.

---

**Enjoy the game!** 🌲✨