// Forest Guardian Platformer - Game Scene

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: GAME_CONFIG.SCENES.GAME });
    }
    
    create() {
        console.log('GameScene: Creating game world...');
        
        // Initialize game state
        this.gameState = GAME_CONFIG.GAME_STATES.PLAYING;
        
        // Create world bounds
        this.physics.world.setBounds(0, 0, 2400, GAME_CONFIG.HEIGHT);
        
        // Create background
        this.createBackground();
        
        // Create platforms and level geometry
        this.createLevel();
        
        // Create player
        this.createPlayer();
        
        // Create collectibles
        this.createGems();
        
        // Create enemies (placeholder for now)
        this.createEnemies();
        
        // Set up camera
        this.setupCamera();
        
        // Set up input
        this.setupInput();
        
        // Set up physics collisions
        this.setupCollisions();
        
        console.log('GameScene: Game world created successfully!');
    }
    
    createBackground() {
        // Create parallax background layers
        this.backgroundLayers = [];
        
        // Layer 1 (farthest back)
        const bg1 = this.add.tileSprite(0, 0, 2400, GAME_CONFIG.HEIGHT, GAME_CONFIG.ASSETS.FOREST_BG_1);
        bg1.setOrigin(0, 0);
        bg1.setScrollFactor(0.1);
        this.backgroundLayers.push(bg1);
        
        // Layer 2 (middle)
        const bg2 = this.add.tileSprite(0, 0, 2400, GAME_CONFIG.HEIGHT, GAME_CONFIG.ASSETS.FOREST_BG_2);
        bg2.setOrigin(0, 0);
        bg2.setScrollFactor(0.3);
        this.backgroundLayers.push(bg2);
        
        // Layer 3 (closest)
        const bg3 = this.add.tileSprite(0, 0, 2400, GAME_CONFIG.HEIGHT, GAME_CONFIG.ASSETS.FOREST_BG_3);
        bg3.setOrigin(0, 0);
        bg3.setScrollFactor(0.6);
        this.backgroundLayers.push(bg3);
    }
    
    createLevel() {
        // Create platforms group
        this.platforms = this.physics.add.staticGroup();
        
        // Ground platforms
        this.createGroundPlatforms();
        
        // Floating platforms
        this.createFloatingPlatforms();
        
        // Moving platforms (will be implemented later)
        this.movingPlatforms = this.physics.add.group();
    }
    
    createGroundPlatforms() {
        // Create ground level platforms
        const groundY = GAME_CONFIG.HEIGHT - 32;
        
        // Starting area
        for (let x = 0; x < 400; x += 32) {
            const platform = this.platforms.create(x, groundY, GAME_CONFIG.ASSETS.FOREST_TILESET);
            platform.setTint(GAME_CONFIG.COLORS.PLATFORM);
        }
        
        // Gap for first jump
        
        // Second section
        for (let x = 500; x < 800; x += 32) {
            const platform = this.platforms.create(x, groundY, GAME_CONFIG.ASSETS.FOREST_TILESET);
            platform.setTint(GAME_CONFIG.COLORS.PLATFORM);
        }
        
        // Another gap
        
        // Third section (elevated)
        for (let x = 900; x < 1200; x += 32) {
            const platform = this.platforms.create(x, groundY - 64, GAME_CONFIG.ASSETS.FOREST_TILESET);
            platform.setTint(GAME_CONFIG.COLORS.PLATFORM);
        }
        
        // Final section
        for (let x = 1400; x < 2400; x += 32) {
            const platform = this.platforms.create(x, groundY, GAME_CONFIG.ASSETS.FOREST_TILESET);
            platform.setTint(GAME_CONFIG.COLORS.PLATFORM);
        }
    }
    
    createFloatingPlatforms() {
        // Add some floating platforms for variety
        const platformData = [
            { x: 450, y: 450, width: 96 },
            { x: 650, y: 400, width: 64 },
            { x: 850, y: 350, width: 96 },
            { x: 1050, y: 300, width: 64 },
            { x: 1250, y: 400, width: 128 },
            { x: 1500, y: 350, width: 96 },
            { x: 1750, y: 300, width: 64 },
            { x: 2000, y: 250, width: 96 }
        ];
        
        platformData.forEach(data => {
            for (let i = 0; i < data.width; i += 32) {
                const platform = this.platforms.create(data.x + i, data.y, GAME_CONFIG.ASSETS.FOREST_TILESET);
                platform.setTint(GAME_CONFIG.COLORS.PLATFORM);
            }
        });
    }
    
    createPlayer() {
        // Create player sprite using simple approach
        this.player = this.physics.add.sprite(100, 400, GAME_CONFIG.ASSETS.PLAYER_IDLE);
        this.player.setTint(GAME_CONFIG.COLORS.PLAYER);
        
        // Set player physics properties
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(GAME_CONFIG.PLAYER.SIZE.WIDTH - 8, GAME_CONFIG.PLAYER.SIZE.HEIGHT - 4);
        
        // Player state
        this.playerState = GAME_CONFIG.PLAYER_STATES.IDLE;
        this.playerHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.playerAbilities = {
            doubleJump: false,
            dash: false
        };
        
        // Jump mechanics
        this.jumpStartTime = 0;
        this.isJumping = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.lastGroundedTime = 0;
        this.jumpBufferTime = 0;
        
        // Dash mechanics
        this.isDashing = false;
        this.lastDashTime = 0;
    }
    
    createGems() {
        // Create gems group
        this.gems = this.physics.add.group();
        
        // Place gems throughout the level
        const gemPositions = [
            { x: 200, y: 500 },
            { x: 350, y: 450 },
            { x: 550, y: 500 },
            { x: 750, y: 450 },
            { x: 950, y: 400 },
            { x: 1150, y: 350 },
            { x: 1350, y: 450 },
            { x: 1550, y: 400 },
            { x: 1750, y: 350 },
            { x: 1950, y: 300 },
            { x: 2150, y: 400 },
            { x: 2300, y: 500 }
        ];
        
        gemPositions.forEach((pos, index) => {
            const gemType = index % 3; // Cycle through gem types
            let gemAsset;
            switch (gemType) {
                case 0: gemAsset = GAME_CONFIG.ASSETS.GEM_BLUE; break;
                case 1: gemAsset = GAME_CONFIG.ASSETS.GEM_GREEN; break;
                case 2: gemAsset = GAME_CONFIG.ASSETS.GEM_RED; break;
            }
            
            const gem = this.gems.create(pos.x, pos.y, gemAsset);
            gem.setBounce(0.3);
            gem.setCollideWorldBounds(true);
            
            // Add floating animation
            this.tweens.add({
                targets: gem,
                y: pos.y - 10,
                duration: 1000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // Add rotation animation
            this.tweens.add({
                targets: gem,
                rotation: Math.PI * 2,
                duration: 2000,
                repeat: -1
            });
        });
    }
    
    createEnemies() {
        // Create enemies group
        this.enemies = this.physics.add.group();
        
        // Add a few simple enemies
        const enemyPositions = [
            { x: 600, y: 500, type: 'woodland_sprite' },
            { x: 1000, y: 450, type: 'root_crawler' },
            { x: 1600, y: 400, type: 'thorn_beast' }
        ];
        
        enemyPositions.forEach(pos => {
            let enemyAsset;
            let enemyColor;
            switch (pos.type) {
                case 'woodland_sprite':
                    enemyAsset = GAME_CONFIG.ASSETS.WOODLAND_SPRITE;
                    enemyColor = GAME_CONFIG.COLORS.ENEMY_WOODLAND;
                    break;
                case 'root_crawler':
                    enemyAsset = GAME_CONFIG.ASSETS.ROOT_CRAWLER;
                    enemyColor = GAME_CONFIG.COLORS.ENEMY_ROOT;
                    break;
                case 'thorn_beast':
                    enemyAsset = GAME_CONFIG.ASSETS.THORN_BEAST;
                    enemyColor = GAME_CONFIG.COLORS.ENEMY_THORN;
                    break;
            }
            
            const enemy = this.enemies.create(pos.x, pos.y, enemyAsset);
            enemy.enemyType = pos.type;
            enemy.setBounce(0.1);
            enemy.setCollideWorldBounds(true);
            enemy.setTint(enemyColor);
            
            // Simple patrol movement
            enemy.setVelocityX(50 * (Math.random() > 0.5 ? 1 : -1));
        });
    }
    
    setupCamera() {
        // Set camera to follow player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setFollowOffset(-GAME_CONFIG.CAMERA.FOLLOW_OFFSET_X, -GAME_CONFIG.CAMERA.FOLLOW_OFFSET_Y);
        this.cameras.main.setDeadzone(GAME_CONFIG.CAMERA.DEADZONE_WIDTH, GAME_CONFIG.CAMERA.DEADZONE_HEIGHT);
        this.cameras.main.setBounds(0, 0, 2400, GAME_CONFIG.HEIGHT);
    }
    
    setupInput() {
        // Create input handler
        this.input = GameHelpers.createInputHandler(this);
    }
    
    setupCollisions() {
        // Player collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.gems, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Player collectibles
        this.physics.add.overlap(this.player, this.gems, this.collectGem, null, this);
        
        // Player enemies
        this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
    }
    
    update(time, delta) {
        // Update player
        this.updatePlayer(time, delta);
        
        // Update enemies
        this.updateEnemies(time, delta);
        
        // Update timers
        this.updateTimers(delta);
        
        // Check win condition
        this.checkWinCondition();
    }
    
    updatePlayer(time, delta) {
        // Handle horizontal movement
        if (this.input.isLeftPressed()) {
            this.player.setVelocityX(-GAME_CONFIG.PLAYER.SPEED);
            this.player.setFlipX(true);
            this.playerState = GAME_CONFIG.PLAYER_STATES.WALKING;
        } else if (this.input.isRightPressed()) {
            this.player.setVelocityX(GAME_CONFIG.PLAYER.SPEED);
            this.player.setFlipX(false);
            this.playerState = GAME_CONFIG.PLAYER_STATES.WALKING;
        } else {
            this.player.setVelocityX(0);
            if (this.player.body.touching.down) {
                this.playerState = GAME_CONFIG.PLAYER_STATES.IDLE;
            }
        }
        
        // Handle jumping
        this.handleJumping(time);
        
        // Handle dashing
        this.handleDashing(time);
        
        // Update animations
        this.updatePlayerAnimations();
        
        // Track grounded state for coyote time
        if (this.player.body.touching.down) {
            this.lastGroundedTime = time;
            this.canDoubleJump = this.playerAbilities.doubleJump;
            this.hasDoubleJumped = false;
        }
    }
    
    handleJumping(time) {
        const isGrounded = this.player.body.touching.down;
        const coyoteTimeValid = time - this.lastGroundedTime < GAME_CONFIG.INPUT.COYOTE_TIME;
        
        // Jump buffer
        if (this.input.isJumpJustPressed()) {
            this.jumpBufferTime = time;
        }
        
        const jumpBufferValid = time - this.jumpBufferTime < GAME_CONFIG.INPUT.JUMP_BUFFER_TIME;
        
        // Start jump
        if (jumpBufferValid && (isGrounded || coyoteTimeValid) && !this.isJumping) {
            this.startJump(time);
        }
        
        // Double jump
        if (this.input.isJumpJustPressed() && !isGrounded && !coyoteTimeValid && 
            this.canDoubleJump && !this.hasDoubleJumped) {
            this.startDoubleJump();
        }
        
        // Variable jump height
        if (this.isJumping && this.input.isJumpPressed()) {
            const jumpDuration = time - this.jumpStartTime;
            if (jumpDuration < 300) { // Max jump hold time
                const jumpForce = Phaser.Math.Linear(
                    GAME_CONFIG.PLAYER.JUMP_MIN_FORCE,
                    GAME_CONFIG.PLAYER.JUMP_MAX_FORCE,
                    jumpDuration / 300
                );
                this.player.setVelocityY(jumpForce);
            }
        }
        
        // End jump when button released or max time reached
        if (this.isJumping && (!this.input.isJumpPressed() || time - this.jumpStartTime > 300)) {
            this.isJumping = false;
        }
    }
    
    startJump(time) {
        this.player.setVelocityY(GAME_CONFIG.PLAYER.JUMP_MIN_FORCE);
        this.isJumping = true;
        this.jumpStartTime = time;
        this.jumpBufferTime = 0;
        this.playerState = GAME_CONFIG.PLAYER_STATES.JUMPING;
        
        // Play jump sound effect
        GameHelpers.playSound(this, GAME_CONFIG.ASSETS.SFX_JUMP, 0.5);
    }
    
    startDoubleJump() {
        this.player.setVelocityY(GAME_CONFIG.PLAYER.JUMP_FORCE);
        this.hasDoubleJumped = true;
        this.canDoubleJump = false;
        this.playerState = GAME_CONFIG.PLAYER_STATES.JUMPING;
        
        // Visual effect for double jump
        GameHelpers.createParticleEffect(this, this.player.x, this.player.y + 20, 0x7fb069, 8);
        
        // Play double jump sound
        GameHelpers.playSound(this, GAME_CONFIG.ASSETS.SFX_JUMP, 0.7);
    }
    
    handleDashing(time) {
        if (this.input.isDashJustPressed() && this.playerAbilities.dash && 
            time - this.lastDashTime > GAME_CONFIG.PLAYER.DASH_COOLDOWN && !this.isDashing) {
            this.startDash(time);
        }
        
        if (this.isDashing && time - this.lastDashTime > GAME_CONFIG.PLAYER.DASH_DURATION) {
            this.endDash();
        }
    }
    
    startDash(time) {
        this.isDashing = true;
        this.lastDashTime = time;
        this.playerState = GAME_CONFIG.PLAYER_STATES.DASHING;
        
        // Set dash velocity
        const dashDirection = this.player.flipX ? -1 : 1;
        this.player.setVelocityX(GAME_CONFIG.PLAYER.DASH_SPEED * dashDirection);
        this.player.setVelocityY(0); // Stop vertical movement during dash
        
        // Visual effects
        GameHelpers.createParticleEffect(this, this.player.x, this.player.y, 0xa3d977, 12);
        
        // Play dash sound
        GameHelpers.playSound(this, GAME_CONFIG.ASSETS.SFX_DASH, 0.6);
    }
    
    endDash() {
        this.isDashing = false;
        // Velocity will be handled by normal movement in next update
    }
    
    updatePlayerAnimations() {
        // Play appropriate animation based on player state
        switch (this.playerState) {
            case GAME_CONFIG.PLAYER_STATES.IDLE:
                this.player.anims.play('player_idle', true);
                break;
            case GAME_CONFIG.PLAYER_STATES.WALKING:
                this.player.anims.play('player_walk', true);
                break;
            case GAME_CONFIG.PLAYER_STATES.JUMPING:
                this.player.anims.play('player_jump', true);
                break;
            case GAME_CONFIG.PLAYER_STATES.DASHING:
                this.player.anims.play('player_dash', true);
                break;
        }
    }
    
    updateEnemies(time, delta) {
        this.enemies.children.entries.forEach(enemy => {
            // Simple AI: reverse direction when hitting walls or edges
            if (enemy.body.touching.left || enemy.body.touching.right) {
                enemy.setVelocityX(-enemy.body.velocity.x);
            }
            
            // Keep enemies on platforms (simple edge detection)
            if (enemy.body.velocity.x > 0) {
                enemy.setFlipX(false);
            } else {
                enemy.setFlipX(true);
            }
        });
    }
    
    updateTimers(delta) {
        // Update dash cooldown display or other timers if needed
    }
    
    collectGem(player, gem) {
        // Remove gem
        gem.destroy();
        
        // Visual and audio feedback
        GameHelpers.createParticleEffect(this, gem.x, gem.y, 0x00ffff, 15);
        GameHelpers.playSound(this, GAME_CONFIG.ASSETS.SFX_GEM_COLLECT, 0.8);
        
        // Notify UI scene
        this.events.emit('gemCollected');
        
        // Check for ability unlocks
        this.checkAbilityUnlocks();
    }
    
    checkAbilityUnlocks() {
        const uiScene = this.scene.get(GAME_CONFIG.SCENES.UI);
        
        // Unlock double jump
        if (uiScene.gemsCollected >= GAME_CONFIG.GEMS.DOUBLE_JUMP_REQUIREMENT && !this.playerAbilities.doubleJump) {
            this.playerAbilities.doubleJump = true;
            console.log('Double jump unlocked!');
        }
        
        // Unlock dash
        if (uiScene.gemsCollected >= GAME_CONFIG.GEMS.DASH_REQUIREMENT && !this.playerAbilities.dash) {
            this.playerAbilities.dash = true;
            console.log('Dash unlocked!');
        }
    }
    
    playerHitEnemy(player, enemy) {
        // Simple damage system
        this.playerHealth--;
        this.events.emit('playerHealthChanged', this.playerHealth);
        
        // Visual feedback
        GameHelpers.flashSprite(this, player, 0xff0000, 200);
        GameHelpers.shakeCamera(this, 8, 150);
        
        // Play hit sound
        GameHelpers.playSound(this, GAME_CONFIG.ASSETS.SFX_PLAYER_HIT, 0.7);
        
        // Knockback
        const knockbackDirection = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(knockbackDirection * 200);
        player.setVelocityY(-150);
        
        // Check for game over
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }
    
    checkWinCondition() {
        // Simple win condition: reach the end of the level
        if (this.player.x > 2300) {
            this.levelComplete();
        }
    }
    
    gameOver() {
        console.log('Game Over!');
        this.gameState = GAME_CONFIG.GAME_STATES.GAME_OVER;
        this.events.emit('gameOver');
        
        // Stop player movement
        this.player.setVelocity(0, 0);
        this.player.body.setEnable(false);
    }
    
    levelComplete() {
        console.log('Level Complete!');
        this.gameState = GAME_CONFIG.GAME_STATES.VICTORY;
        this.events.emit('levelComplete');
        
        // Stop player movement
        this.player.setVelocity(0, 0);
    }
}