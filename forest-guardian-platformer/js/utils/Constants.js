// Forest Guardian Platformer - Game Constants

const GAME_CONFIG = {
    // Game dimensions
    WIDTH: 800,
    HEIGHT: 600,
    
    // Physics settings
    GRAVITY: 800,
    
    // Player settings
    PLAYER: {
        SPEED: 200,
        JUMP_FORCE: -400,
        JUMP_MIN_FORCE: -250,
        JUMP_MAX_FORCE: -500,
        DASH_SPEED: 400,
        DASH_DURATION: 200,
        DASH_COOLDOWN: 1000,
        MAX_HEALTH: 3,
        SIZE: {
            WIDTH: 32,
            HEIGHT: 48
        }
    },
    
    // Enemy settings
    ENEMIES: {
        WOODLAND_SPRITE: {
            SPEED: 80,
            DETECTION_RADIUS: 150,
            HEALTH: 30,
            DAMAGE: 1,
            SIZE: { WIDTH: 24, HEIGHT: 24 }
        },
        ROOT_CRAWLER: {
            SPEED: 60,
            DETECTION_RADIUS: 100,
            HEALTH: 50,
            DAMAGE: 2,
            SIZE: { WIDTH: 32, HEIGHT: 16 }
        },
        THORN_BEAST: {
            SPEED: 120,
            CHARGE_SPEED: 250,
            DETECTION_RADIUS: 200,
            HEALTH: 80,
            DAMAGE: 3,
            CHARGE_COOLDOWN: 3000,
            SIZE: { WIDTH: 48, HEIGHT: 32 }
        }
    },
    
    // Boss settings
    BOSS: {
        HEALTH: 300,
        PHASE_1_THRESHOLD: 0.75,
        PHASE_2_THRESHOLD: 0.50,
        PHASE_3_THRESHOLD: 0.25,
        CHARGE_SPEED: 200,
        DIVE_SPEED: 300,
        MINION_SPAWN_INTERVAL: 5000,
        SIZE: { WIDTH: 96, HEIGHT: 96 }
    },
    
    // Collectibles
    GEMS: {
        VALUE: 1,
        DOUBLE_JUMP_REQUIREMENT: 5,
        DASH_REQUIREMENT: 10,
        SIZE: { WIDTH: 16, HEIGHT: 16 }
    },
    
    // Level design
    LEVEL: {
        TILE_SIZE: 32,
        PLATFORM_MIN_WIDTH: 64,
        MIN_JUMP_GAP: 120,
        DOUBLE_JUMP_GAP: 200,
        DASH_GAP: 300
    },
    
    // Camera settings
    CAMERA: {
        FOLLOW_OFFSET_X: 200,
        FOLLOW_OFFSET_Y: 100,
        LERP_SPEED: 0.1,
        DEADZONE_WIDTH: 100,
        DEADZONE_HEIGHT: 50
    },
    
    // Audio settings
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8
    },
    
    // Input settings
    INPUT: {
        JUMP_BUFFER_TIME: 100,
        COYOTE_TIME: 100,
        DASH_BUFFER_TIME: 50
    },
    
    // Animation settings
    ANIMATIONS: {
        PLAYER_IDLE_FPS: 8,
        PLAYER_WALK_FPS: 12,
        PLAYER_JUMP_FPS: 10,
        PLAYER_DASH_FPS: 20,
        ENEMY_MOVE_FPS: 8,
        GEM_SPARKLE_FPS: 15
    },
    
    // Collision categories (for Phaser physics)
    COLLISION: {
        PLAYER: 1,
        ENEMIES: 2,
        PLATFORMS: 4,
        COLLECTIBLES: 8,
        PROJECTILES: 16,
        TRIGGERS: 32,
        BOUNDARIES: 64
    },
    
    // Scene keys
    SCENES: {
        PRELOAD: 'PreloadScene',
        MENU: 'MenuScene',
        GAME: 'GameScene',
        UI: 'UIScene',
        GAME_OVER: 'GameOverScene',
        VICTORY: 'VictoryScene'
    },
    
    // Asset keys
    ASSETS: {
        // Player sprites
        PLAYER_IDLE: 'player_idle',
        PLAYER_WALK: 'player_walk',
        PLAYER_JUMP: 'player_jump',
        PLAYER_DASH: 'player_dash',
        
        // Enemy sprites
        WOODLAND_SPRITE: 'woodland_sprite',
        ROOT_CRAWLER: 'root_crawler',
        THORN_BEAST: 'thorn_beast',
        
        // Boss sprites
        BOSS_IDLE: 'boss_idle',
        BOSS_CHARGE: 'boss_charge',
        BOSS_DIVE: 'boss_dive',
        
        // Environment
        FOREST_TILESET: 'forest_tileset',
        FOREST_BG_1: 'forest_bg_1',
        FOREST_BG_2: 'forest_bg_2',
        FOREST_BG_3: 'forest_bg_3',
        
        // Collectibles
        GEM_BLUE: 'gem_blue',
        GEM_GREEN: 'gem_green',
        GEM_RED: 'gem_red',
        
        // UI
        HEALTH_BAR: 'health_bar',
        ABILITY_ICONS: 'ability_icons',
        
        // Audio
        MUSIC_FOREST: 'music_forest',
        MUSIC_BOSS: 'music_boss',
        SFX_JUMP: 'sfx_jump',
        SFX_LAND: 'sfx_land',
        SFX_DASH: 'sfx_dash',
        SFX_GEM_COLLECT: 'sfx_gem_collect',
        SFX_ENEMY_HIT: 'sfx_enemy_hit',
        SFX_PLAYER_HIT: 'sfx_player_hit',
        SFX_ABILITY_UNLOCK: 'sfx_ability_unlock'
    },
    
    // Colors (for placeholder graphics)
    COLORS: {
        PLAYER: 0x7fb069,
        ENEMY_WOODLAND: 0xa3d977,
        ENEMY_ROOT: 0x8b4513,
        ENEMY_THORN: 0x654321,
        BOSS: 0x2d5a3d,
        PLATFORM: 0x4a7c59,
        GEM: 0x00ffff,
        BACKGROUND: 0x1a4d3a,
        UI_PRIMARY: 0x7fb069,
        UI_SECONDARY: 0x4a7c59
    },
    
    // Game states
    GAME_STATES: {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        VICTORY: 'victory'
    },
    
    // Player states
    PLAYER_STATES: {
        IDLE: 'idle',
        WALKING: 'walking',
        JUMPING: 'jumping',
        FALLING: 'falling',
        DASHING: 'dashing',
        HURT: 'hurt'
    },
    
    // Enemy states
    ENEMY_STATES: {
        PATROL: 'patrol',
        CHASE: 'chase',
        ATTACK: 'attack',
        STUNNED: 'stunned',
        DYING: 'dying'
    },
    
    // Boss states
    BOSS_STATES: {
        PHASE_1: 'phase_1',
        PHASE_2: 'phase_2',
        PHASE_3: 'phase_3',
        CHARGING: 'charging',
        DIVING: 'diving',
        SUMMONING: 'summoning',
        DEFEATED: 'defeated'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}