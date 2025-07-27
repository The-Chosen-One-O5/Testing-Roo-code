// Forest Guardian Platformer - Boss Entity

class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, GAME_CONFIG.ASSETS.BOSS_IDLE);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Initialize boss properties
        this.scene = scene;
        this.initializeProperties();
        this.setupPhysics();
        this.setupBehavior();
        
        console.log('Boss: Forest Guardian Boss created at', x, y);
    }
    
    initializeProperties() {
        // Health and phases
        this.maxHealth = GAME_CONFIG.BOSS.HEALTH;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isActive = false; // Boss activates when player gets close
        
        // Phase management
        this.currentPhase = 1;
        this.phase1Threshold = GAME_CONFIG.BOSS.PHASE_1_THRESHOLD;
        this.phase2Threshold = GAME_CONFIG.BOSS.PHASE_2_THRESHOLD;
        this.phase3Threshold = GAME_CONFIG.BOSS.PHASE_3_THRESHOLD;
        
        // State management
        this.state = GAME_CONFIG.BOSS_STATES.PHASE_1;
        this.stateTimer = 0;
        this.actionCooldown = 0;
        
        // Movement and positioning
        this.homeX = x;
        this.homeY = y;
        this.facingDirection = -1; // Start facing left
        this.isGrounded = true;
        
        // Attack patterns
        this.attackPattern = 0;
        this.attackCount = 0;
        this.lastAttackTime = 0;
        this.minionSpawnTimer = 0;
        
        // Special abilities
        this.canFly = false;
        this.isCharging = false;
        this.isDiving = false;
        this.isVulnerable = true;
        
        // Minions
        this.minions = [];
        this.maxMinions = 3;
        
        // Visual effects
        this.damageFlashTimer = 0;
        this.phaseTransitionActive = false;
    }
    
    setupPhysics() {
        // Physics properties
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.setSize(GAME_CONFIG.BOSS.SIZE.WIDTH - 16, GAME_CONFIG.BOSS.SIZE.HEIGHT - 8);
        this.setOffset(8, 4);
        
        // Set tint for placeholder graphics
        this.setTint(GAME_CONFIG.COLORS.BOSS);
        
        // Boss is quite heavy
        this.body.setMass(5);
    }
    
    setupBehavior() {
        // Start in idle state
        this.setVelocity(0, 0);
        
        // Set up activation trigger
        this.activationDistance = 200;
        
        // Initialize attack patterns for each phase
        this.setupAttackPatterns();
    }
    
    setupAttackPatterns() {
        this.attackPatterns = {
            phase1: [
                'groundCharge',
                'summonMinions',
                'groundPound'
            ],
            phase2: [
                'aerialDive',
                'summonMinions',
                'windAttack',
                'groundCharge'
            ],
            phase3: [
                'comboAttack',
                'desperateCharge',
                'massMinions',
                'aerialBarrage'
            ]
        };
    }
    
    update(time, delta) {
        if (!this.isAlive) return;
        
        // Update timers
        this.stateTimer += delta;
        this.actionCooldown = Math.max(0, this.actionCooldown - delta);
        this.minionSpawnTimer += delta;
        this.damageFlashTimer = Math.max(0, this.damageFlashTimer - delta);
        
        // Check for activation
        if (!this.isActive) {
            this.checkActivation();
            return;
        }
        
        // Update phase based on health
        this.updatePhase();
        
        // Update AI based on current state
        this.updateAI(time, delta);
        
        // Update movement
        this.updateMovement(time, delta);
        
        // Update minions
        this.updateMinions(time, delta);
        
        // Update visual effects
        this.updateVisualEffects(time, delta);
        
        // Update animations
        this.updateAnimations();
    }
    
    checkActivation() {
        if (this.scene.player) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            
            if (distance <= this.activationDistance) {
                this.activate();
            }
        }
    }
    
    activate() {
        this.isActive = true;
        
        // Boss activation effects
        GameHelpers.shakeCamera(this.scene, 10, 1000);
        GameHelpers.createParticleEffect(this.scene, this.x, this.y, 0x2d5a3d, 30);
        
        // Play boss music
        GameHelpers.playMusic(this.scene, GAME_CONFIG.ASSETS.MUSIC_BOSS, 0.8);
        
        // Show boss health bar (emit event to UI)
        this.scene.events.emit('bossActivated', {
            health: this.health,
            maxHealth: this.maxHealth,
            name: 'Forest Guardian'
        });
        
        console.log('Boss: Activated!');
    }
    
    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        let newPhase = this.currentPhase;
        
        if (healthPercent <= this.phase3Threshold) {
            newPhase = 3;
        } else if (healthPercent <= this.phase2Threshold) {
            newPhase = 2;
        } else {
            newPhase = 1;
        }
        
        if (newPhase !== this.currentPhase) {
            this.transitionToPhase(newPhase);
        }
    }
    
    transitionToPhase(newPhase) {
        console.log(`Boss: Transitioning to phase ${newPhase}`);
        
        this.currentPhase = newPhase;
        this.phaseTransitionActive = true;
        this.isVulnerable = false;
        
        // Phase transition effects
        GameHelpers.shakeCamera(this.scene, 15, 2000);
        GameHelpers.createParticleEffect(this.scene, this.x, this.y, 0x7fb069, 50);
        
        // Set new state based on phase
        switch (newPhase) {
            case 1:
                this.state = GAME_CONFIG.BOSS_STATES.PHASE_1;
                break;
            case 2:
                this.state = GAME_CONFIG.BOSS_STATES.PHASE_2;
                this.canFly = true;
                break;
            case 3:
                this.state = GAME_CONFIG.BOSS_STATES.PHASE_3;
                this.canFly = true;
                break;
        }
        
        // End transition after delay
        this.scene.time.delayedCall(2000, () => {
            this.phaseTransitionActive = false;
            this.isVulnerable = true;
        });
        
        // Reset attack pattern
        this.attackPattern = 0;
        this.attackCount = 0;
    }
    
    updateAI(time, delta) {
        if (this.phaseTransitionActive) return;
        
        // Choose attack based on current phase and cooldown
        if (this.actionCooldown <= 0) {
            this.chooseAttack();
        }
        
        // Execute current state behavior
        switch (this.state) {
            case GAME_CONFIG.BOSS_STATES.CHARGING:
                this.updateCharging(time, delta);
                break;
            case GAME_CONFIG.BOSS_STATES.DIVING:
                this.updateDiving(time, delta);
                break;
            case GAME_CONFIG.BOSS_STATES.SUMMONING:
                this.updateSummoning(time, delta);
                break;
            default:
                this.updateDefaultBehavior(time, delta);
                break;
        }
    }
    
    chooseAttack() {
        const phaseKey = `phase${this.currentPhase}`;
        const availableAttacks = this.attackPatterns[phaseKey];
        
        if (!availableAttacks || availableAttacks.length === 0) return;
        
        // Choose attack based on pattern or randomly
        let attackType;
        if (this.attackPattern < availableAttacks.length) {
            attackType = availableAttacks[this.attackPattern];
            this.attackPattern++;
        } else {
            // Reset pattern and choose randomly
            this.attackPattern = 0;
            attackType = Phaser.Utils.Array.GetRandom(availableAttacks);
        }
        
        this.executeAttack(attackType);
    }
    
    executeAttack(attackType) {
        console.log(`Boss: Executing attack ${attackType}`);
        
        switch (attackType) {
            case 'groundCharge':
                this.groundCharge();
                break;
            case 'summonMinions':
                this.summonMinions();
                break;
            case 'groundPound':
                this.groundPound();
                break;
            case 'aerialDive':
                this.aerialDive();
                break;
            case 'windAttack':
                this.windAttack();
                break;
            case 'comboAttack':
                this.comboAttack();
                break;
            case 'desperateCharge':
                this.desperateCharge();
                break;
            case 'massMinions':
                this.massMinions();
                break;
            case 'aerialBarrage':
                this.aerialBarrage();
                break;
        }
        
        this.lastAttackTime = this.scene.time.now;
        this.attackCount++;
    }
    
    groundCharge() {
        if (!this.scene.player) return;
        
        this.state = GAME_CONFIG.BOSS_STATES.CHARGING;
        this.isCharging = true;
        this.actionCooldown = 3000;
        
        // Determine charge direction
        const direction = Math.sign(this.scene.player.x - this.x);
        this.facingDirection = direction;
        this.setFlipX(direction < 0);
        
        // Charge towards player
        this.setVelocityX(GAME_CONFIG.BOSS.CHARGE_SPEED * direction);
        
        // Visual effects
        GameHelpers.createParticleEffect(this.scene, this.x, this.y + this.height/2, 0x654321, 15);
        
        // End charge after duration
        this.scene.time.delayedCall(1500, () => {
            this.isCharging = false;
            this.setVelocityX(0);
            this.state = GAME_CONFIG.BOSS_STATES.PHASE_1;
        });
    }
    
    summonMinions() {
        this.state = GAME_CONFIG.BOSS_STATES.SUMMONING;
        this.actionCooldown = 4000;
        
        const minionsToSpawn = this.currentPhase === 3 ? 3 : 2;
        
        for (let i = 0; i < minionsToSpawn; i++) {
            this.scene.time.delayedCall(i * 500, () => {
                this.spawnMinion();
            });
        }
        
        // Return to normal state
        this.scene.time.delayedCall(2000, () => {
            this.state = GAME_CONFIG.BOSS_STATES.PHASE_1;
        });
    }
    
    spawnMinion() {
        if (this.minions.length >= this.maxMinions) return;
        
        const spawnX = this.x + (Math.random() - 0.5) * 200;
        const spawnY = this.y - 50;
        
        const minionType = Phaser.Utils.Array.GetRandom(['woodland_sprite', 'root_crawler']);
        const minion = new Enemy(this.scene, spawnX, spawnY, minionType);
        
        this.minions.push(minion);
        
        // Add to scene's enemy group
        if (this.scene.enemies) {
            this.scene.enemies.add(minion);
        }
        
        // Visual effect
        GameHelpers.createParticleEffect(this.scene, spawnX, spawnY, 0x7fb069, 12);
    }
    
    groundPound() {
        this.actionCooldown = 2500;
        
        // Jump up then slam down
        this.setVelocity(0, -300);
        
        this.scene.time.delayedCall(500, () => {
            this.setVelocity(0, 600); // Fast downward movement
            
            // Check for landing
            const checkLanding = () => {
                if (this.body.touching.down) {
                    this.performGroundPoundImpact();
                } else {
                    this.scene.time.delayedCall(50, checkLanding);
                }
            };
            checkLanding();
        });
    }
    
    performGroundPoundImpact() {
        // Screen shake
        GameHelpers.shakeCamera(this.scene, 20, 800);
        
        // Damage player if close
        if (this.scene.player) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            
            if (distance < 150) {
                this.scene.player.takeDamage(2, this);
            }
        }
        
        // Visual effects
        GameHelpers.createParticleEffect(this.scene, this.x, this.y + this.height/2, 0x8B4513, 25);
    }
    
    aerialDive() {
        if (!this.canFly) return;
        
        this.state = GAME_CONFIG.BOSS_STATES.DIVING;
        this.isDiving = true;
        this.actionCooldown = 3500;
        
        // Fly up first
        this.setVelocity(0, -200);
        
        this.scene.time.delayedCall(1000, () => {
            if (this.scene.player) {
                // Dive towards player
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    this.scene.player.x, this.scene.player.y
                );
                
                this.setVelocity(
                    Math.cos(angle) * GAME_CONFIG.BOSS.DIVE_SPEED,
                    Math.sin(angle) * GAME_CONFIG.BOSS.DIVE_SPEED
                );
            }
        });
        
        // End dive
        this.scene.time.delayedCall(2500, () => {
            this.isDiving = false;
            this.state = GAME_CONFIG.BOSS_STATES.PHASE_2;
        });
    }
    
    windAttack() {
        this.actionCooldown = 2000;
        
        // Create wind effect that pushes player
        if (this.scene.player) {
            const direction = Math.sign(this.scene.player.x - this.x);
            this.scene.player.setVelocityX(direction * 300);
            
            // Visual wind effect
            for (let i = 0; i < 10; i++) {
                this.scene.time.delayedCall(i * 100, () => {
                    GameHelpers.createParticleEffect(
                        this.scene,
                        this.x + direction * (i * 30),
                        this.y,
                        0xa3d977,
                        5
                    );
                });
            }
        }
    }
    
    comboAttack() {
        this.actionCooldown = 5000;
        
        // Sequence of attacks
        this.groundCharge();
        
        this.scene.time.delayedCall(2000, () => {
            this.groundPound();
        });
        
        this.scene.time.delayedCall(3500, () => {
            this.summonMinions();
        });
    }
    
    desperateCharge() {
        // Faster, more aggressive charge
        this.groundCharge();
        this.setVelocityX(this.body.velocity.x * 1.5); // 50% faster
    }
    
    massMinions() {
        // Spawn more minions than usual
        this.maxMinions = 5;
        this.summonMinions();
        
        this.scene.time.delayedCall(3000, () => {
            this.maxMinions = 3; // Reset to normal
        });
    }
    
    aerialBarrage() {
        if (!this.canFly) return;
        
        this.actionCooldown = 4000;
        
        // Multiple aerial dives in sequence
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 1200, () => {
                this.aerialDive();
            });
        }
    }
    
    updateCharging(time, delta) {
        // Check for collision with walls or player
        if (this.body.touching.left || this.body.touching.right) {
            this.isCharging = false;
            this.setVelocityX(0);
            this.state = GAME_CONFIG.BOSS_STATES.PHASE_1;
            
            // Stun briefly after hitting wall
            this.actionCooldown = Math.max(this.actionCooldown, 1000);
        }
    }
    
    updateDiving(time, delta) {
        // Check for collision with ground or player
        if (this.body.touching.down) {
            this.performGroundPoundImpact();
            this.isDiving = false;
            this.state = GAME_CONFIG.BOSS_STATES.PHASE_2;
        }
    }
    
    updateSummoning(time, delta) {
        // Visual effects during summoning
        if (Math.random() < 0.1) {
            GameHelpers.createParticleEffect(
                this.scene,
                this.x + (Math.random() - 0.5) * 100,
                this.y + (Math.random() - 0.5) * 100,
                0x7fb069,
                3
            );
        }
    }
    
    updateDefaultBehavior(time, delta) {
        // Slow movement towards player when not attacking
        if (this.scene.player && !this.isCharging && !this.isDiving) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            
            if (distance > 100) {
                const direction = Math.sign(this.scene.player.x - this.x);
                this.setVelocityX(direction * 50); // Slow approach
                this.facingDirection = direction;
                this.setFlipX(direction < 0);
            } else {
                this.setVelocityX(0);
            }
        }
    }
    
    updateMovement(time, delta) {
        // Apply flight mechanics if boss can fly
        if (this.canFly && !this.body.touching.down) {
            // Reduce gravity effect
            this.body.setGravityY(-GAME_CONFIG.GRAVITY * 0.7);
        } else {
            this.body.setGravityY(0);
        }
        
        // Limit velocity
        if (Math.abs(this.body.velocity.x) > 400) {
            this.setVelocityX(Math.sign(this.body.velocity.x) * 400);
        }
        if (Math.abs(this.body.velocity.y) > 600) {
            this.setVelocityY(Math.sign(this.body.velocity.y) * 600);
        }
    }
    
    updateMinions(time, delta) {
        // Clean up dead minions
        this.minions = this.minions.filter(minion => minion.isAlive);
        
        // Spawn new minions periodically in phase 3
        if (this.currentPhase === 3 && 
            this.minionSpawnTimer > GAME_CONFIG.BOSS.MINION_SPAWN_INTERVAL &&
            this.minions.length < this.maxMinions) {
            this.spawnMinion();
            this.minionSpawnTimer = 0;
        }
    }
    
    updateVisualEffects(time, delta) {
        // Damage flash effect
        if (this.damageFlashTimer > 0) {
            this.setTint(0xff8888);
        } else {
            this.clearTint();
        }
        
        // Phase-based visual effects
        if (this.currentPhase >= 2) {
            // Add glowing effect for higher phases
            if (Math.random() < 0.05) {
                GameHelpers.createParticleEffect(
                    this.scene,
                    this.x + (Math.random() - 0.5) * this.width,
                    this.y + (Math.random() - 0.5) * this.height,
                    0x7fb069,
                    2
                );
            }
        }
    }
    
    updateAnimations() {
        // Simple animation logic based on state
        // In a full game, you'd have proper sprite animations
        
        if (this.isCharging) {
            this.setTint(0xff4444); // Red tint when charging
        } else if (this.isDiving) {
            this.setTint(0x4444ff); // Blue tint when diving
        } else if (this.state === GAME_CONFIG.BOSS_STATES.SUMMONING) {
            this.setTint(0x44ff44); // Green tint when summoning
        } else if (this.damageFlashTimer <= 0) {
            this.clearTint();
        }
    }
    
    takeDamage(amount, source = null) {
        if (!this.isAlive || !this.isVulnerable) return false;
        
        this.health = Math.max(0, this.health - amount);
        this.damageFlashTimer = 200;
        
        // Visual feedback
        GameHelpers.shakeCamera(this.scene, 5, 200);
        GameHelpers.createParticleEffect(this.scene, this.x, this.y, 0xff0000, 10);
        
        // Audio feedback
        GameHelpers.playSound(this.scene, 'boss_hit', 0.8);
        
        // Update boss health UI
        this.scene.events.emit('bossHealthChanged', {
            health: this.health,
            maxHealth: this.maxHealth
        });
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
        
        return true;
    }
    
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.setVelocity(0, 0);
        
        // Death sequence
        console.log('Boss: Forest Guardian defeated!');
        
        // Massive visual effects
        for (let i = 0; i < 10; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                GameHelpers.createParticleEffect(
                    this.scene,
                    this.x + (Math.random() - 0.5) * 200,
                    this.y + (Math.random() - 0.5) * 200,
                    0x7fb069,
                    20
                );
            });
        }
        
        // Screen effects
        GameHelpers.shakeCamera(this.scene, 25, 3000);
        this.scene.cameras.main.flash(2000, 255, 255, 255, false);
        
        // Clean up minions
        this.minions.forEach(minion => {
            if (minion.isAlive) {
                minion.die();
            }
        });
        
        // Emit boss defeated event
        this.scene.events.emit('bossDefeated');
        
        // Fade out and destroy
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 3000,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    // Save/Load state
    saveState() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            currentPhase: this.currentPhase,
            isActive: this.isActive,
            state: this.state
        };
    }
    
    loadState(state) {
        if (state.x !== undefined) this.x = state.x;
        if (state.y !== undefined) this.y = state.y;
        if (state.health !== undefined) this.health = state.health;
        if (state.currentPhase !== undefined) this.currentPhase = state.currentPhase;
        if (state.isActive !== undefined) this.isActive = state.isActive;
        if (state.state !== undefined) this.state = state.state;
    }
}