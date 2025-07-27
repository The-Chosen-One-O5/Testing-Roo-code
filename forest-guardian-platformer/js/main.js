// Forest Guardian Platformer - Main Game File

class ForestGuardianGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: GAME_CONFIG.WIDTH,
            height: GAME_CONFIG.HEIGHT,
            parent: 'game-canvas',
            backgroundColor: GAME_CONFIG.COLORS.BACKGROUND,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: GAME_CONFIG.GRAVITY },
                    debug: false // Set to true for development debugging
                }
            },
            scene: [
                PreloadScene,
                MenuScene,
                GameScene,
                UIScene
            ],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 400,
                    height: 300
                },
                max: {
                    width: 1600,
                    height: 1200
                }
            },
            render: {
                pixelArt: true,
                antialias: false
            },
            audio: {
                disableWebAudio: false
            }
        };
        
        this.game = null;
        this.gameState = GAME_CONFIG.GAME_STATES.LOADING;
        this.loadingProgress = 0;
    }
    
    init() {
        // Initialize the game
        this.game = new Phaser.Game(this.config);
        
        // Set up global game reference
        window.gameInstance = this;
        
        // Set up loading progress tracking
        this.setupLoadingProgress();
        
        // Set up global event listeners
        this.setupGlobalEvents();
        
        console.log('Forest Guardian Platformer initialized!');
    }
    
    setupLoadingProgress() {
        const loadingBar = document.querySelector('.loading-progress');
        const loadingScreen = document.getElementById('loading-screen');
        
        // Listen for loading progress from Phaser
        this.game.events.on('loadprogress', (progress) => {
            this.loadingProgress = progress;
            if (loadingBar) {
                loadingBar.style.width = (progress * 100) + '%';
            }
        });
        
        // Hide loading screen when game is ready
        this.game.events.on('ready', () => {
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.gameState = GAME_CONFIG.GAME_STATES.MENU;
            }, 500);
        });
    }
    
    setupGlobalEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.game.scale.refresh();
        });
        
        // Handle visibility change (pause when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
        
        // Handle focus/blur events
        window.addEventListener('blur', () => this.pauseGame());
        window.addEventListener('focus', () => this.resumeGame());
    }
    
    pauseGame() {
        if (this.game && this.game.scene.isActive(GAME_CONFIG.SCENES.GAME)) {
            this.game.scene.pause(GAME_CONFIG.SCENES.GAME);
            this.gameState = GAME_CONFIG.GAME_STATES.PAUSED;
        }
    }
    
    resumeGame() {
        if (this.game && this.game.scene.isPaused(GAME_CONFIG.SCENES.GAME)) {
            this.game.scene.resume(GAME_CONFIG.SCENES.GAME);
            this.gameState = GAME_CONFIG.GAME_STATES.PLAYING;
        }
    }
    
    restartGame() {
        if (this.game) {
            this.game.scene.start(GAME_CONFIG.SCENES.GAME);
            this.gameState = GAME_CONFIG.GAME_STATES.PLAYING;
        }
    }
    
    goToMenu() {
        if (this.game) {
            this.game.scene.start(GAME_CONFIG.SCENES.MENU);
            this.gameState = GAME_CONFIG.GAME_STATES.MENU;
        }
    }
    
    getGameState() {
        return this.gameState;
    }
    
    setGameState(state) {
        this.gameState = state;
    }
}

// Global utility functions
window.GameUtils = {
    // Distance calculation
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    // Angle calculation
    angle: (x1, y1, x2, y2) => {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    // Linear interpolation
    lerp: (start, end, factor) => {
        return start + (end - start) * factor;
    },
    
    // Clamp value between min and max
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },
    
    // Random integer between min and max (inclusive)
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Random float between min and max
    randomFloat: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    
    // Check if point is within rectangle
    pointInRect: (px, py, rx, ry, rw, rh) => {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },
    
    // Format time in MM:SS format
    formatTime: (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new ForestGuardianGame();
    game.init();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForestGuardianGame;
}