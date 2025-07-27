// Forest Guardian Platformer - Preload Scene

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: GAME_CONFIG.SCENES.PRELOAD });
    }
    
    preload() {
        console.log('PreloadScene: Starting asset loading...');
        
        // Set up loading progress tracking
        this.setupLoadingProgress();
        
        // Create placeholder graphics for prototyping
        this.createPlaceholderAssets();
        
        // Load actual assets (when available)
        this.loadAssets();
        
        // Create basic particle texture
        this.createParticleTexture();
    }
    
    setupLoadingProgress() {
        // Track loading progress
        this.load.on('progress', (value) => {
            console.log('Loading progress:', Math.round(value * 100) + '%');
            
            // Update loading bar in HTML
            const loadingBar = document.querySelector('.loading-progress');
            if (loadingBar) {
                loadingBar.style.width = (value * 100) + '%';
            }
        });
        
        this.load.on('complete', () => {
            console.log('PreloadScene: All assets loaded!');
        });
    }
    
    createPlaceholderAssets() {
        console.log('PreloadScene: Creating placeholder assets...');
        
        // Create placeholder player sprites
        this.createPlayerPlaceholders();
        
        // Create placeholder enemy sprites
        this.createEnemyPlaceholders();
        
        // Create placeholder environment assets
        this.createEnvironmentPlaceholders();
        
        // Create placeholder collectibles
        this.createCollectiblePlaceholders();
        
        // Create placeholder UI elements
        this.createUIPlaceholders();
    }
    
    createPlayerPlaceholders() {
        // Player idle sprite (green rectangle)
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(GAME_CONFIG.COLORS.PLAYER);
        playerGraphics.fillRect(0, 0, GAME_CONFIG.PLAYER.SIZE.WIDTH, GAME_CONFIG.PLAYER.SIZE.HEIGHT);
        playerGraphics.generateTexture(GAME_CONFIG.ASSETS.PLAYER_IDLE, 
            GAME_CONFIG.PLAYER.SIZE.WIDTH, GAME_CONFIG.PLAYER.SIZE.HEIGHT);
        playerGraphics.destroy();
        
        // Create simple animation frames for player
        for (let i = 0; i < 4; i++) {
            const graphics = this.add.graphics();
            const brightness = 0.8 + (i * 0.1); // Slight variation for animation
            graphics.fillStyle(Phaser.Display.Color.GetColor32(
                Math.floor(127 * brightness),
                Math.floor(176 * brightness), 
                Math.floor(105 * brightness),
                255
            ));
            graphics.fillRect(0, 0, GAME_CONFIG.PLAYER.SIZE.WIDTH, GAME_CONFIG.PLAYER.SIZE.HEIGHT);
            graphics.generateTexture(`${GAME_CONFIG.ASSETS.PLAYER_WALK}_${i}`, 
                GAME_CONFIG.PLAYER.SIZE.WIDTH, GAME_CONFIG.PLAYER.SIZE.HEIGHT);
            graphics.destroy();
        }
        
        // Player jump sprite (slightly stretched)
        const jumpGraphics = this.add.graphics();
        jumpGraphics.fillStyle(GAME_CONFIG.COLORS.PLAYER);
        jumpGraphics.fillRect(0, 0, GAME_CONFIG.PLAYER.SIZE.WIDTH, GAME_CONFIG.PLAYER.SIZE.HEIGHT + 8);
        jumpGraphics.generateTexture(GAME_CONFIG.ASSETS.PLAYER_JUMP, 
            GAME_CONFIG.PLAYER.SIZE.WIDTH, GAME_CONFIG.PLAYER.SIZE.HEIGHT + 8);
        jumpGraphics.destroy();
        
        // Player dash sprite (elongated)
        const dashGraphics = this.add.graphics();
        dashGraphics.fillStyle(GAME_CONFIG.COLORS.PLAYER);
        dashGraphics.fillRect(0, 0, GAME_CONFIG.PLAYER.SIZE.WIDTH + 16, GAME_CONFIG.PLAYER.SIZE.HEIGHT);
        dashGraphics.generateTexture(GAME_CONFIG.ASSETS.PLAYER_DASH, 
            GAME_CONFIG.PLAYER.SIZE.WIDTH + 16, GAME_CONFIG.PLAYER.SIZE.HEIGHT);
        dashGraphics.destroy();
    }
    
    createEnemyPlaceholders() {
        // Woodland Sprite (light green circle)
        const spriteGraphics = this.add.graphics();
        spriteGraphics.fillStyle(GAME_CONFIG.COLORS.ENEMY_WOODLAND);
        spriteGraphics.fillCircle(12, 12, 12);
        spriteGraphics.generateTexture(GAME_CONFIG.ASSETS.WOODLAND_SPRITE, 24, 24);
        spriteGraphics.destroy();
        
        // Root Crawler (brown rectangle)
        const crawlerGraphics = this.add.graphics();
        crawlerGraphics.fillStyle(GAME_CONFIG.COLORS.ENEMY_ROOT);
        crawlerGraphics.fillRect(0, 0, GAME_CONFIG.ENEMIES.ROOT_CRAWLER.SIZE.WIDTH, 
            GAME_CONFIG.ENEMIES.ROOT_CRAWLER.SIZE.HEIGHT);
        crawlerGraphics.generateTexture(GAME_CONFIG.ASSETS.ROOT_CRAWLER, 
            GAME_CONFIG.ENEMIES.ROOT_CRAWLER.SIZE.WIDTH, GAME_CONFIG.ENEMIES.ROOT_CRAWLER.SIZE.HEIGHT);
        crawlerGraphics.destroy();
        
        // Thorn Beast (dark brown rectangle with spikes)
        const beastGraphics = this.add.graphics();
        beastGraphics.fillStyle(GAME_CONFIG.COLORS.ENEMY_THORN);
        beastGraphics.fillRect(0, 0, GAME_CONFIG.ENEMIES.THORN_BEAST.SIZE.WIDTH, 
            GAME_CONFIG.ENEMIES.THORN_BEAST.SIZE.HEIGHT);
        // Add simple spike details
        beastGraphics.fillStyle(0x8B4513);
        for (let i = 0; i < 3; i++) {
            beastGraphics.fillTriangle(
                8 + i * 12, 0,
                12 + i * 12, -8,
                16 + i * 12, 0
            );
        }
        beastGraphics.generateTexture(GAME_CONFIG.ASSETS.THORN_BEAST, 
            GAME_CONFIG.ENEMIES.THORN_BEAST.SIZE.WIDTH, GAME_CONFIG.ENEMIES.THORN_BEAST.SIZE.HEIGHT + 8);
        beastGraphics.destroy();
        
        // Boss placeholder (large dark green rectangle)
        const bossGraphics = this.add.graphics();
        bossGraphics.fillStyle(GAME_CONFIG.COLORS.BOSS);
        bossGraphics.fillRect(0, 0, GAME_CONFIG.BOSS.SIZE.WIDTH, GAME_CONFIG.BOSS.SIZE.HEIGHT);
        bossGraphics.generateTexture(GAME_CONFIG.ASSETS.BOSS_IDLE, 
            GAME_CONFIG.BOSS.SIZE.WIDTH, GAME_CONFIG.BOSS.SIZE.HEIGHT);
        bossGraphics.destroy();
    }
    
    createEnvironmentPlaceholders() {
        // Platform tile (brown rectangle)
        const platformGraphics = this.add.graphics();
        platformGraphics.fillStyle(GAME_CONFIG.COLORS.PLATFORM);
        platformGraphics.fillRect(0, 0, GAME_CONFIG.LEVEL.TILE_SIZE, GAME_CONFIG.LEVEL.TILE_SIZE);
        platformGraphics.generateTexture(GAME_CONFIG.ASSETS.FOREST_TILESET, 
            GAME_CONFIG.LEVEL.TILE_SIZE, GAME_CONFIG.LEVEL.TILE_SIZE);
        platformGraphics.destroy();
        
        // Background layers (gradients)
        for (let layer = 1; layer <= 3; layer++) {
            const bgGraphics = this.add.graphics();
            const alpha = 0.3 + (layer * 0.2);
            bgGraphics.fillGradientStyle(
                GAME_CONFIG.COLORS.BACKGROUND, GAME_CONFIG.COLORS.BACKGROUND,
                0x2d5a3d, 0x2d5a3d, alpha
            );
            bgGraphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
            bgGraphics.generateTexture(`${GAME_CONFIG.ASSETS.FOREST_BG_1.replace('1', layer)}`, 
                GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
            bgGraphics.destroy();
        }
    }
    
    createCollectiblePlaceholders() {
        // Blue gem (cyan diamond)
        const blueGemGraphics = this.add.graphics();
        blueGemGraphics.fillStyle(0x00FFFF);
        blueGemGraphics.fillRect(0, 0, GAME_CONFIG.GEMS.SIZE.WIDTH, GAME_CONFIG.GEMS.SIZE.HEIGHT);
        blueGemGraphics.generateTexture(GAME_CONFIG.ASSETS.GEM_BLUE, 
            GAME_CONFIG.GEMS.SIZE.WIDTH, GAME_CONFIG.GEMS.SIZE.HEIGHT);
        blueGemGraphics.destroy();
        
        // Green gem
        const greenGemGraphics = this.add.graphics();
        greenGemGraphics.fillStyle(0x00FF00);
        greenGemGraphics.fillRect(0, 0, GAME_CONFIG.GEMS.SIZE.WIDTH, GAME_CONFIG.GEMS.SIZE.HEIGHT);
        greenGemGraphics.generateTexture(GAME_CONFIG.ASSETS.GEM_GREEN, 
            GAME_CONFIG.GEMS.SIZE.WIDTH, GAME_CONFIG.GEMS.SIZE.HEIGHT);
        greenGemGraphics.destroy();
        
        // Red gem
        const redGemGraphics = this.add.graphics();
        redGemGraphics.fillStyle(0xFF0000);
        redGemGraphics.fillRect(0, 0, GAME_CONFIG.GEMS.SIZE.WIDTH, GAME_CONFIG.GEMS.SIZE.HEIGHT);
        redGemGraphics.generateTexture(GAME_CONFIG.ASSETS.GEM_RED, 
            GAME_CONFIG.GEMS.SIZE.WIDTH, GAME_CONFIG.GEMS.SIZE.HEIGHT);
        redGemGraphics.destroy();
    }
    
    createUIPlaceholders() {
        // Health bar background
        const healthBgGraphics = this.add.graphics();
        healthBgGraphics.fillStyle(0x333333);
        healthBgGraphics.fillRect(0, 0, 100, 20);
        healthBgGraphics.generateTexture('health_bg', 100, 20);
        healthBgGraphics.destroy();
        
        // Health bar fill
        const healthFillGraphics = this.add.graphics();
        healthFillGraphics.fillStyle(0xFF0000);
        healthFillGraphics.fillRect(0, 0, 100, 20);
        healthFillGraphics.generateTexture('health_fill', 100, 20);
        healthFillGraphics.destroy();
        
        // Ability icons
        const abilityGraphics = this.add.graphics();
        abilityGraphics.fillStyle(GAME_CONFIG.COLORS.UI_PRIMARY);
        abilityGraphics.fillRect(0, 0, 32, 32);
        abilityGraphics.generateTexture(GAME_CONFIG.ASSETS.ABILITY_ICONS, 32, 32);
        abilityGraphics.destroy();
    }
    
    createParticleTexture() {
        // Simple white circle for particles
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFFFFF);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
        particleGraphics.destroy();
    }
    
    loadAssets() {
        // This is where we would load actual sprite sheets, audio files, etc.
        // For now, we'll use placeholder loading to simulate real asset loading
        
        // Simulate loading time for demonstration
        for (let i = 0; i < 10; i++) {
            this.load.image(`placeholder_${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        }
        
        // TODO: Load actual assets when available
        // this.load.spritesheet('player_walk', 'assets/sprites/player_walk.png', { frameWidth: 32, frameHeight: 48 });
        // this.load.audio('forest_music', 'assets/audio/music/forest_theme.ogg');
        // etc.
    }
    
    create() {
        console.log('PreloadScene: Creating animations...');
        
        // Create animations for placeholder sprites
        this.createAnimations();
        
        // Transition to menu scene after a short delay
        this.time.delayedCall(1000, () => {
            console.log('PreloadScene: Transitioning to MenuScene...');
            this.scene.start(GAME_CONFIG.SCENES.MENU);
        });
    }
    
    createAnimations() {
        // Player walk animation
        if (!this.anims.exists('player_walk')) {
            this.anims.create({
                key: 'player_walk',
                frames: [
                    { key: `${GAME_CONFIG.ASSETS.PLAYER_WALK}_0` },
                    { key: `${GAME_CONFIG.ASSETS.PLAYER_WALK}_1` },
                    { key: `${GAME_CONFIG.ASSETS.PLAYER_WALK}_2` },
                    { key: `${GAME_CONFIG.ASSETS.PLAYER_WALK}_3` }
                ],
                frameRate: GAME_CONFIG.ANIMATIONS.PLAYER_WALK_FPS,
                repeat: -1
            });
        }
        
        // Player idle animation (single frame for now)
        if (!this.anims.exists('player_idle')) {
            this.anims.create({
                key: 'player_idle',
                frames: [{ key: GAME_CONFIG.ASSETS.PLAYER_IDLE }],
                frameRate: GAME_CONFIG.ANIMATIONS.PLAYER_IDLE_FPS,
                repeat: -1
            });
        }
        
        // Player jump animation
        if (!this.anims.exists('player_jump')) {
            this.anims.create({
                key: 'player_jump',
                frames: [{ key: GAME_CONFIG.ASSETS.PLAYER_JUMP }],
                frameRate: GAME_CONFIG.ANIMATIONS.PLAYER_JUMP_FPS,
                repeat: 0
            });
        }
        
        // Player dash animation
        if (!this.anims.exists('player_dash')) {
            this.anims.create({
                key: 'player_dash',
                frames: [{ key: GAME_CONFIG.ASSETS.PLAYER_DASH }],
                frameRate: GAME_CONFIG.ANIMATIONS.PLAYER_DASH_FPS,
                repeat: 0
            });
        }
        
        console.log('PreloadScene: Animations created successfully!');
    }
}
