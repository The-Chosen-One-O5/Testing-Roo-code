// Forest Guardian Platformer - Enemy Entity

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyType) {
        // Get the appropriate texture for enemy type
        const texture = Enemy.getTextureForType(enemyType);
        super(scene, x, y, texture);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Initialize enemy properties
        this.scene = scene;
        this.enemyType = enemyType;
        this.initializeProperties();
        this.setupPhysics();
        this.setupBehavior();
        
        console.log(`Enemy: Created ${enemyType} at`, x, y);
    }
    
    static getTextureForType(enemyType) {
        switch (enemyType) {
            case 'woodland_sprite':
                return GAME_CONFIG.ASSETS.WOODLAND_SPRITE;
            case 'root_crawler':
                return GAME_CONFIG.ASSETS.ROOT_CRAWLER;
            case 'thorn_beast':
                return GAME_CONFIG.ASSETS.THORN_BEAST;
            default:
                return GAME_CONFIG.ASSETS.WOODLAND_SPRITE;
        }
    }
    
    initializeProperties() {
        // Get enemy config
        this.config = this.getEnemyConfig();
        
        // Health and state
        this.health = this.config.HEALTH;
        this.maxHealth = this.config.HEALTH;
        this.isAlive = true;
        this.state = GAME_CONFIG.ENEMY_STATES.PATROL;
        
        // Movement
        this.speed = this.config.SPEED;
        this.detectionRadius = this.config.DETECTION_RADIUS;
        this.damage = this.config.DAMAGE;
        this.facingDirection = Math.random() > 0.5 ? 1 : -1;
        
        // AI state
        this.target = null;
        this.lastPlayerPosition = null;
        this.stateTimer = 0;
        this.actionCooldown = 0;
        
        // Patrol behavior
        this.patrolStartX = this.x;
        this.patrolDistance = 100 + Math.random() * 100;
        this.patrolDirection = this.facingDirection;
        
        // Special abilities (for specific enemy types)
        this.specialAbilities = this.getSpecialAbilities();
        
        // Timers
        this.lastAttackTime = 0;
        this.lastDirectionChange = 0;
    }
    
    getEnemyConfig() {
        switch (this.enemyType) {
            case 'woodland_sprite':
                return GAME_CONFIG.ENEMIES.WOODLAND_SPRITE;
            case 'root_crawler':
                return GAME_CONFIG.ENEMIES.ROOT_CRAWLER;
            case 'thorn_beast':
                return GAME_CONFIG.ENEMIES.THORN_BEAST;
            default:
                return GAME_CONFIG.ENEMIES.WOODLAND_SPRITE;
        }
    }
    
    getSpecialAbilities() {
        const abilities = {};
        
        switch (this.enemyType) {
            case 'woodland_sprite':
                abilities.canFly = true;
                abilities.floatHeight = 50 + Math.random() * 50;
                break;
            case 'root_crawler':
                abilities.canClimb = true;
                abilities.groundBound = true;
                break;
            case 'thorn_beast':
                abilities.canCharge = true;
                abilities.chargeCooldown = GAME_CONFIG.ENEMIES.THORN_BEAST.CHARGE_COOLDOWN || 3000;
                abilities.chargeSpeed = GAME_CONFIG.ENEMIES.THORN_BEAST.CHARGE_SPEED || 250;
                break;
        }
        
        return abilities;
    }
    
    setupPhysics() {
        // Basic physics setup
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        this.setSize(this.config.SIZE.WIDTH, this.config.SIZE.HEIGHT);
        
        // Special physics for different enemy types
        if (this.specialAbilities.canFly) {
            this.body.setGravityY(-GAME_CONFIG.GRAVITY); // Negate gravity for flying enemies
        }
        
        if (this.specialAbilities.groundBound) {
            this.body.setGravityY(GAME_CONFIG.GRAVITY * 0.5); // Lighter gravity for crawlers
        }
    }
    
    setupBehavior() {
        // Set initial velocity based on enemy type
        if (this.specialAbilities.canFly) {
            this.setVelocity(
                this.speed * this.facingDirection,
                Math.sin(this.scene.time.now * 0.001) * 20
            );
        } else {
            this.setVelocityX(this.speed * this.facingDirection);
        }
    }
    
    update(time, delta) {
        if (!this.isAlive) return;
        
        // Update timers
        this.stateTimer += delta;
        this.actionCooldown = Math.max(0, this.actionCooldown - delta);
        
        // Find player
        this.findPlayer();
        
        // Update AI based on current state
        this.updateAI(time, delta);
        
        // Update movement
        this.updateMovement(time, delta);
        
        // Update animations
        this.updateAnimations();
        
        // Check boundaries and obstacles
        this.checkBoundaries();
    }
    
    findPlayer() {
        // Find player in scene
        if (this.scene.player) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            
            if (distance <= this.detectionRadius) {
                this.target = this.scene.player;
                this.lastPlayerPosition = { x: this.scene.player.x, y: this.scene.player.y };
            } else if (distance > this.detectionRadius * 1.5) {
                // Lose target if player gets too far away
                this.target = null;
            }
        }
    }
    
    updateAI(time, delta) {
        switch (this.state) {
            case GAME_CONFIG.ENEMY_STATES.PATROL:
                this.updatePatrolState(time, delta);
                break;
            case GAME_CONFIG.ENEMY_STATES.CHASE:
                this.updateChaseState(time, delta);
                break;
            case GAME_CONFIG.ENEMY_STATES.ATTACK:
                this.updateAttackState(time, delta);
                break;
            case GAME_CONFIG.ENEMY_STATES.STUNNED:
                this.updateStunnedState(time, delta);
                break;
        }
    }
    
    updatePatrolState(time, delta) {
        // Switch to chase if player detected
        if (this.target) {
            this.setState(GAME_CONFIG.ENEMY_STATES.CHASE);
            return;
        }
        
        // Simple patrol behavior
        this.patrol(time, delta);
    }
    
    updateChaseState(time, delta) {
        // Return to patrol if no target
        if (!this.target) {
            this.setState(GAME_CONFIG.ENEMY_STATES.PATROL);
            return;
        }
        
        // Chase the player
        this.chaseTarget(time, delta);
        
        // Check if close enough to attack
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        if (distance < 50 && this.actionCooldown <= 0) {
            this.setState(GAME_CONFIG.ENEMY_STATES.ATTACK);
        }
    }
    
    updateAttackState(time, delta) {
        // Perform attack based on enemy type
        this.performAttack(time, delta);
        
        // Return to chase after attack
        if (this.stateTimer > 1000) { // 1 second attack duration
            this.setState(GAME_CONFIG.ENEMY_STATES.CHASE);
            this.actionCooldown = 2000; // 2 second cooldown
        }
    }
    
    updateStunnedState(time, delta) {
        // Recover from stun
        if (this.stateTimer > 1500) { // 1.5 second stun duration
            this.setState(GAME_CONFIG.ENEMY_STATES.PATROL);
        }
    }
    
    patrol(time, delta) {
        switch (this.enemyType) {
            case 'woodland_sprite':
                this.patrolFlying(time, delta);
                break;
            case 'root_crawler':
                this.patrolGround(time, delta);
                break;
            case 'thorn_beast':
                this.patrolGround(time, delta);
                break;
        }
    }
    
    patrolFlying(time, delta) {
        // Sine wave movement for flying enemies
        const baseY = this.patrolStartX; // Use start position as reference
        const waveY = Math.sin(time * 0.002) * this.specialAbilities.floatHeight;
        
        this.setVelocityX(this.speed * this.patrolDirection);
        this.setVelocityY(waveY * 0.1); // Gentle vertical movement
        
        // Change direction at patrol boundaries
        if (Math.abs(this.x - this.patrolStartX) > this.patrolDistance) {
            this.patrolDirection *= -1;
            this.facingDirection = this.patrolDirection;
            this.setFlipX(this.facingDirection < 0);
        }
    }
    
    patrolGround(time, delta) {
        this.setVelocityX(this.speed * this.patrolDirection);
        
        // Change direction at patrol boundaries or obstacles
        if (Math.abs(this.x - this.patrolStartX) > this.patrolDistance ||
            this.body.touching.left || this.body.touching.right) {
            this.patrolDirection *= -1;
            this.facingDirection = this.patrolDirection;
            this.setFlipX(this.facingDirection < 0);
        }
    }
    
    chaseTarget(time, delta) {
        if (!this.target) return;
        
        const direction = Math.sign(this.target.x - this.x);
        this.facingDirection = direction;
        this.setFlipX(direction < 0);
        
        switch (this.enemyType) {
            case 'woodland_sprite':
                this.chaseFlying(time, delta);
                break;
            case 'root_crawler':
                this.chaseGround(time, delta);
                break;
            case 'thorn_beast':
                this.chaseThorn(time, delta);
                break;
        }
    }
    
    chaseFlying(time, delta) {
        // Direct movement towards player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const chaseSpeed = this.speed * 1.2; // Slightly faster when chasing
        
        this.setVelocity(
            Math.cos(angle) * chaseSpeed,
            Math.sin(angle) * chaseSpeed * 0.5 // Slower vertical movement
        );
    }
    
    chaseGround(time, delta) {
        const direction = Math.sign(this.target.x - this.x);
        this.setVelocityX(this.speed * 1.5 * direction); // Faster ground chase
    }
    
    chaseThorn(time, delta) {
        // Thorn beast can charge at player
        if (this.specialAbilities.canCharge && 
            time - this.lastAttackTime > this.specialAbilities.chargeCooldown) {
            this.performCharge();
        } else {
            const direction = Math.sign(this.target.x - this.x);
            this.setVelocityX(this.speed * direction);
        }
    }
    
    performAttack(time, delta) {
        switch (this.enemyType) {
            case 'woodland_sprite':
                this.attackSprite(time, delta);
                break;
            case 'root_crawler':
                this.attackCrawler(time, delta);
                break;
            case 'thorn_beast':
                this.attackBeast(time, delta);
                break;
        }
    }
    
    attackSprite(time, delta) {
        // Simple contact damage for woodland sprite
        if (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 40) {
            this.dealDamageToPlayer();
        }
    }
    
    attackCrawler(time, delta) {
        // Root crawler lunges forward
        if (this.stateTimer < 200) { // First 200ms of attack
            this.setVelocityX(this.facingDirection * this.speed * 2);
        }
        
        if (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 35) {
            this.dealDamageToPlayer();
        }
    }
    
    attackBeast(time, delta) {
        // Thorn beast performs a powerful charge
        if (this.stateTimer < 500) { // First 500ms of attack
            this.setVelocityX(this.facingDirection * this.specialAbilities.chargeSpeed);
        }
        
        if (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 45) {
            this.dealDamageToPlayer();
        }
    }
    
    performCharge() {
        this.setState(GAME_CONFIG.ENEMY_STATES.ATTACK);
        this.lastAttackTime = this.scene.time.now;
        
        // Visual effect for charge
        GameHelpers.createParticleEffect(
            this.scene,
            this.x,
            this.y,
            0x654321,
            8
        );
        
        // Audio effect
        GameHelpers.playSound(this.scene, 'enemy_charge', 0.6);
    }
    
    dealDamageToPlayer() {
        if (this.target && this.target.takeDamage) {
            this.target.takeDamage(this.damage, this);
            
            // Knockback effect
            const knockbackForce = 150;
            const direction = Math.sign(this.target.x - this.x);
            this.target.setVelocity(direction * knockbackForce, -100);
            
            // Visual effect
            GameHelpers.createParticleEffect(
                this.scene,
                this.target.x,
                this.target.y,
                0xff0000,
                6
            );
        }
    }
    
    updateMovement(time, delta) {
        // Apply movement constraints based on enemy type
        if (this.specialAbilities.groundBound) {
            // Keep ground enemies on platforms
            this.checkGroundBounds();
        }
        
        // Update facing direction based on velocity
        if (Math.abs(this.body.velocity.x) > 10) {
            this.setFlipX(this.body.velocity.x < 0);
        }
    }
    
    checkGroundBounds() {
        // Prevent ground enemies from walking off edges
        // This is a simplified version - in a full game you'd use raycasting
        if (!this.body.touching.down && this.specialAbilities.groundBound) {
            // If enemy is falling and is ground-bound, reverse direction
            this.patrolDirection *= -1;
            this.facingDirection = this.patrolDirection;
        }
    }
    
    updateAnimations() {
        // Simple animation logic based on state and movement
        // In a full game, you'd have proper sprite animations
        
        if (this.state === GAME_CONFIG.ENEMY_STATES.STUNNED) {
            this.setTint(0x888888); // Gray tint when stunned
        } else if (this.state === GAME_CONFIG.ENEMY_STATES.ATTACK) {
            this.setTint(0xff8888); // Red tint when attacking
        } else {
            this.clearTint(); // Normal color
        }
    }
    
    checkBoundaries() {
        // Reverse direction if hitting walls
        if (this.body.touching.left || this.body.touching.right) {
            if (this.state === GAME_CONFIG.ENEMY_STATES.PATROL) {
                this.patrolDirection *= -1;
                this.facingDirection = this.patrolDirection;
            }
        }
        
        // Special boundary checks for flying enemies
        if (this.specialAbilities.canFly) {
            if (this.y < 50) {
                this.setVelocityY(Math.abs(this.body.velocity.y));
            } else if (this.y > this.scene.sys.game.config.height - 50) {
                this.setVelocityY(-Math.abs(this.body.velocity.y));
            }
        }
    }
    
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.stateTimer = 0;
            
            console.log(`Enemy ${this.enemyType}: State changed to ${newState}`);
        }
    }
    
    takeDamage(amount, source = null) {
        if (!this.isAlive) return false;
        
        this.health = Math.max(0, this.health - amount);
        
        // Visual feedback
        GameHelpers.flashSprite(this.scene, this, 0xff0000, 150);
        
        // Audio feedback
        GameHelpers.playSound(this.scene, 'enemy_hit', 0.5);
        
        // Knockback
        if (source) {
            const knockbackDirection = this.x < source.x ? -1 : 1;
            this.setVelocity(knockbackDirection * 100, -50);
        }
        
        // Stun briefly
        this.setState(GAME_CONFIG.ENEMY_STATES.STUNNED);
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
        
        return true;
    }
    
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.setVelocity(0, -100);
        
        // Death effects
        GameHelpers.createParticleEffect(
            this.scene,
            this.x,
            this.y,
            0x654321,
            15
        );
        
        // Play death sound
        GameHelpers.playSound(this.scene, 'enemy_death', 0.6);
        
        // Fade out and destroy
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        console.log(`Enemy ${this.enemyType}: Died`);
    }
    
    // Save/Load state
    saveState() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            enemyType: this.enemyType,
            state: this.state,
            facingDirection: this.facingDirection
        };
    }
    
    loadState(state) {
        if (state.x !== undefined) this.x = state.x;
        if (state.y !== undefined) this.y = state.y;
        if (state.health !== undefined) this.health = state.health;
        if (state.state !== undefined) this.state = state.state;
        if (state.facingDirection !== undefined) {
            this.facingDirection = state.facingDirection;
            this.setFlipX(this.facingDirection < 0);
        }
    }
}