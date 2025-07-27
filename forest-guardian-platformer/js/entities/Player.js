// Forest Guardian Platformer - Player Entity

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, GAME_CONFIG.ASSETS.PLAYER_IDLE);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Initialize player properties
        this.scene = scene;
        this.initializeProperties();
        this.setupPhysics();
        this.setupAnimations();
        this.setupAbilities();
        this.setupInput();
        
        console.log('Player: Created at', x, y);
    }
    
    initializeProperties() {
        // Health and state
        this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.isAlive = true;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1000; // ms
        
        // Movement state
        this.state = GAME_CONFIG.PLAYER_STATES.IDLE;
        this.facingDirection = 1; // 1 = right, -1 = left
        this.isGrounded = false;
        this.wasGrounded = false;
        
        // Jump mechanics
        this.isJumping = false;
        this.jumpStartTime = 0;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.lastGroundedTime = 0;
        this.jumpBufferTime = 0;
        
        // Dash mechanics
        this.isDashing = false;
        this.dashStartTime = 0;
        this.lastDashTime = 0;
        this.dashDirection = 0;
        
        // Abilities
        this.unlockedAbilities = new Set();
        
        // Input buffering
        this.inputBuffer = {
            jump: 0,
            dash: 0
        };
    }
    
    setupPhysics() {
        // Physics properties
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        this.setSize(
            GAME_CONFIG.PLAYER.SIZE.WIDTH - 8, 
            GAME_CONFIG.PLAYER.SIZE.HEIGHT - 4
        );
        this.setOffset(4, 2);
        
        // Set tint for placeholder graphics
        this.setTint(GAME_CONFIG.COLORS.PLAYER);
    }
    
    setupAnimations() {
        // Animations are created in PreloadScene
        // Just set initial animation
        if (this.scene.anims.exists('player_idle')) {
            this.play('player_idle');
        }
    }
    
    setupAbilities() {
        // Initialize ability system
        this.abilitySystem = new AbilitySystem(this.scene);
        this.abilitySystem.init();
    }
    
    setupInput() {
        // Input is handled by the scene, but we can set up player-specific input here
        this.inputManager = new InputManager(this.scene);
        this.inputManager.init();
    }
    
    update(time, delta) {
        if (!this.isAlive) return;
        
        // Update grounded state
        this.updateGroundedState(time);
        
        // Handle input
        this.handleInput(time, delta);
        
        // Update movement
        this.updateMovement(time, delta);
        
        // Update abilities
        this.updateAbilities(time, delta);
        
        // Update animations
        this.updateAnimations();
        
        // Update state
        this.updateState();
        
        // Clear input buffers
        this.clearOldInputBuffers(time);
    }
    
    updateGroundedState(time) {
        this.wasGrounded = this.isGrounded;
        this.isGrounded = this.body.touching.down;
        
        if (this.isGrounded) {
            this.lastGroundedTime = time;
            
            // Reset jump abilities when landing
            if (!this.wasGrounded) {
                this.onLanding();
            }
        }
    }
    
    onLanding() {
        this.isJumping = false;
        this.canDoubleJump = this.hasAbility('doubleJump');
        this.hasDoubleJumped = false;
        
        // Play landing sound
        GameHelpers.playSound(this.scene, 'land', 0.4);
        
        // Landing particles
        GameHelpers.createParticleEffect(
            this.scene, 
            this.x, 
            this.y + this.height/2, 
            0x8B4513, 
            5
        );
    }
    
    handleInput(time, delta) {
        // Get input from scene's input manager
        const input = this.scene.input || this.inputManager;
        
        // Horizontal movement
        this.handleHorizontalMovement(input);
        
        // Jumping
        this.handleJumping(input, time);
        
        // Dashing
        this.handleDashing(input, time);
        
        // Other actions
        this.handleOtherActions(input, time);
    }
    
    handleHorizontalMovement(input) {
        if (this.isDashing) return; // Don't allow movement during dash
        
        let velocityX = 0;
        
        if (input.isLeftPressed()) {
            velocityX = -GAME_CONFIG.PLAYER.SPEED;
            this.facingDirection = -1;
            this.setFlipX(true);
        } else if (input.isRightPressed()) {
            velocityX = GAME_CONFIG.PLAYER.SPEED;
            this.facingDirection = 1;
            this.setFlipX(false);
        }
        
        this.setVelocityX(velocityX);
    }
    
    handleJumping(input, time) {
        // Buffer jump input
        if (input.isJumpJustPressed()) {
            this.inputBuffer.jump = time;
        }
        
        const jumpBufferValid = time - this.inputBuffer.jump < GAME_CONFIG.INPUT.JUMP_BUFFER_TIME;
        const coyoteTimeValid = time - this.lastGroundedTime < GAME_CONFIG.INPUT.COYOTE_TIME;
        
        // Start jump
        if (jumpBufferValid && (this.isGrounded || coyoteTimeValid) && !this.isJumping) {
            this.startJump(time);
        }
        
        // Double jump
        if (input.isJumpJustPressed() && !this.isGrounded && !coyoteTimeValid && 
            this.canDoubleJump && !this.hasDoubleJumped) {
            this.startDoubleJump();
        }
        
        // Variable jump height
        if (this.isJumping && input.isJumpPressed()) {
            const jumpDuration = time - this.jumpStartTime;
            if (jumpDuration < 300) { // Max jump hold time
                const jumpForce = Phaser.Math.Linear(
                    GAME_CONFIG.PLAYER.JUMP_MIN_FORCE,
                    GAME_CONFIG.PLAYER.JUMP_MAX_FORCE,
                    jumpDuration / 300
                );
                this.setVelocityY(jumpForce);
            }
        }
        
        // End jump when button released or max time reached
        if (this.isJumping && (!input.isJumpPressed() || time - this.jumpStartTime > 300)) {
            this.isJumping = false;
        }
    }
    
    startJump(time) {
        this.setVelocityY(GAME_CONFIG.PLAYER.JUMP_MIN_FORCE);
        this.isJumping = true;
        this.jumpStartTime = time;
        this.inputBuffer.jump = 0; // Clear buffer
        this.state = GAME_CONFIG.PLAYER_STATES.JUMPING;
        
        // Play jump sound
        GameHelpers.playSound(this.scene, 'jump', 0.5);
        
        // Jump particles
        GameHelpers.createParticleEffect(
            this.scene, 
            this.x, 
            this.y + this.height/2, 
            0x7fb069, 
            6
        );
    }
    
    startDoubleJump() {
        this.abilitySystem.useAbility('doubleJump', this);
    }
    
    handleDashing(input, time) {
        // Buffer dash input
        if (input.isDashJustPressed()) {
            this.inputBuffer.dash = time;
        }
        
        const dashBufferValid = time - this.inputBuffer.dash < GAME_CONFIG.INPUT.DASH_BUFFER_TIME;
        const dashCooldownReady = time - this.lastDashTime > GAME_CONFIG.PLAYER.DASH_COOLDOWN;
        
        if (dashBufferValid && this.hasAbility('dash') && dashCooldownReady && !this.isDashing) {
            this.startDash(time);
        }
        
        // End dash after duration
        if (this.isDashing && time - this.dashStartTime > GAME_CONFIG.PLAYER.DASH_DURATION) {
            this.endDash();
        }
    }
    
    startDash(time) {
        this.abilitySystem.useAbility('dash', this, this.facingDirection);
        this.inputBuffer.dash = 0; // Clear buffer
    }
    
    endDash() {
        this.isDashing = false;
        this.state = this.isGrounded ? GAME_CONFIG.PLAYER_STATES.IDLE : GAME_CONFIG.PLAYER_STATES.FALLING;
    }
    
    handleOtherActions(input, time) {
        // Interact with objects
        if (input.isInteractJustPressed()) {
            this.interact();
        }
    }
    
    updateMovement(time, delta) {
        // Apply gravity modifications if needed
        if (this.isDashing) {
            // Reduce gravity during dash
            this.body.setGravityY(-GAME_CONFIG.GRAVITY * 0.5);
        } else {
            this.body.setGravityY(0); // Use world gravity
        }
        
        // Terminal velocity
        if (this.body.velocity.y > 600) {
            this.setVelocityY(600);
        }
    }
    
    updateAbilities(time, delta) {
        if (this.abilitySystem) {
            this.abilitySystem.update(time, delta);
        }
    }
    
    updateAnimations() {
        let animationKey = 'player_idle';
        
        switch (this.state) {
            case GAME_CONFIG.PLAYER_STATES.IDLE:
                animationKey = 'player_idle';
                break;
            case GAME_CONFIG.PLAYER_STATES.WALKING:
                animationKey = 'player_walk';
                break;
            case GAME_CONFIG.PLAYER_STATES.JUMPING:
            case GAME_CONFIG.PLAYER_STATES.FALLING:
                animationKey = 'player_jump';
                break;
            case GAME_CONFIG.PLAYER_STATES.DASHING:
                animationKey = 'player_dash';
                break;
        }
        
        if (this.scene.anims.exists(animationKey)) {
            this.play(animationKey, true);
        }
    }
    
    updateState() {
        if (this.isDashing) {
            this.state = GAME_CONFIG.PLAYER_STATES.DASHING;
        } else if (!this.isGrounded) {
            this.state = this.body.velocity.y < 0 ? 
                GAME_CONFIG.PLAYER_STATES.JUMPING : 
                GAME_CONFIG.PLAYER_STATES.FALLING;
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.state = GAME_CONFIG.PLAYER_STATES.WALKING;
        } else {
            this.state = GAME_CONFIG.PLAYER_STATES.IDLE;
        }
    }
    
    clearOldInputBuffers(time) {
        // Clear old input buffers
        if (time - this.inputBuffer.jump > GAME_CONFIG.INPUT.JUMP_BUFFER_TIME) {
            this.inputBuffer.jump = 0;
        }
        if (time - this.inputBuffer.dash > GAME_CONFIG.INPUT.DASH_BUFFER_TIME) {
            this.inputBuffer.dash = 0;
        }
    }
    
    // Ability management
    unlockAbility(abilityId) {
        this.unlockedAbilities.add(abilityId);
        if (this.abilitySystem) {
            this.abilitySystem.unlockAbility(abilityId);
        }
        
        console.log(`Player: Unlocked ability ${abilityId}`);
    }
    
    hasAbility(abilityId) {
        return this.unlockedAbilities.has(abilityId);
    }
    
    // Health management
    takeDamage(amount, source = null) {
        if (!this.isAlive || this.isInvulnerable) return false;
        
        this.health = Math.max(0, this.health - amount);
        
        // Visual feedback
        GameHelpers.flashSprite(this.scene, this, 0xff0000, 200);
        GameHelpers.shakeCamera(this.scene, 8, 150);
        
        // Audio feedback
        GameHelpers.playSound(this.scene, 'player_hit', 0.7);
        
        // Knockback
        if (source) {
            const knockbackDirection = this.x < source.x ? -1 : 1;
            this.setVelocity(knockbackDirection * 200, -150);
        }
        
        // Invulnerability frames
        this.makeInvulnerable();
        
        // Emit health change event
        this.scene.events.emit('playerHealthChanged', this.health);
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
        
        return true;
    }
    
    heal(amount) {
        if (!this.isAlive) return false;
        
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        if (this.health > oldHealth) {
            // Visual feedback
            GameHelpers.createParticleEffect(
                this.scene, 
                this.x, 
                this.y, 
                0x00ff00, 
                10
            );
            
            // Emit health change event
            this.scene.events.emit('playerHealthChanged', this.health);
            
            return true;
        }
        
        return false;
    }
    
    makeInvulnerable() {
        this.isInvulnerable = true;
        
        // Visual feedback (flashing)
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(this.invulnerabilityTime / 200)
        });
        
        // End invulnerability
        this.scene.time.delayedCall(this.invulnerabilityTime, () => {
            this.isInvulnerable = false;
            this.setAlpha(1);
        });
    }
    
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.setVelocity(0, -200);
        
        // Death animation/effects
        GameHelpers.createParticleEffect(
            this.scene, 
            this.x, 
            this.y, 
            0xff0000, 
            20
        );
        
        // Play death sound
        GameHelpers.playSound(this.scene, 'player_death', 0.8);
        
        // Emit death event
        this.scene.events.emit('playerDied');
        
        console.log('Player: Died');
    }
    
    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isInvulnerable = false;
        this.setAlpha(1);
        this.setVelocity(0, 0);
        
        // Reset state
        this.state = GAME_CONFIG.PLAYER_STATES.IDLE;
        this.isDashing = false;
        this.isJumping = false;
        
        // Emit respawn event
        this.scene.events.emit('playerRespawned');
        
        console.log('Player: Respawned at', x, y);
    }
    
    // Interaction
    interact() {
        // Check for nearby interactable objects
        // This would be implemented based on specific game needs
        console.log('Player: Interact');
    }
    
    // Save/Load state
    saveState() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            unlockedAbilities: Array.from(this.unlockedAbilities),
            abilitySystemState: this.abilitySystem ? this.abilitySystem.saveState() : null
        };
    }
    
    loadState(state) {
        if (state.x !== undefined) this.x = state.x;
        if (state.y !== undefined) this.y = state.y;
        if (state.health !== undefined) this.health = state.health;
        
        if (state.unlockedAbilities) {
            this.unlockedAbilities = new Set(state.unlockedAbilities);
        }
        
        if (state.abilitySystemState && this.abilitySystem) {
            this.abilitySystem.loadState(state.abilitySystemState);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.abilitySystem) {
            this.abilitySystem.destroy();
        }
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        
        super.destroy();
    }
}