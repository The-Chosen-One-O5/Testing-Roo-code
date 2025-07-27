// Forest Guardian Platformer - Ability System

class AbilitySystem {
    constructor(scene) {
        this.scene = scene;
        this.abilities = new Map();
        this.cooldowns = new Map();
        this.unlockedAbilities = new Set();
    }
    
    // Initialize ability system
    init() {
        console.log('AbilitySystem: Initializing ability system...');
        this.setupAbilities();
    }
    
    setupAbilities() {
        // Define all available abilities
        this.defineAbility('doubleJump', {
            name: 'Double Jump',
            description: 'Jump again while in mid-air',
            unlockRequirement: GAME_CONFIG.GEMS.DOUBLE_JUMP_REQUIREMENT,
            cooldown: 0,
            energyCost: 0,
            icon: 'double_jump_icon'
        });
        
        this.defineAbility('dash', {
            name: 'Dash',
            description: 'Quick horizontal movement burst',
            unlockRequirement: GAME_CONFIG.GEMS.DASH_REQUIREMENT,
            cooldown: GAME_CONFIG.PLAYER.DASH_COOLDOWN,
            energyCost: 0,
            icon: 'dash_icon'
        });
        
        // Future abilities can be added here
        this.defineAbility('wallSlide', {
            name: 'Wall Slide',
            description: 'Slide down walls slowly',
            unlockRequirement: 15,
            cooldown: 0,
            energyCost: 0,
            icon: 'wall_slide_icon',
            locked: true // Not implemented yet
        });
        
        this.defineAbility('groundPound', {
            name: 'Ground Pound',
            description: 'Powerful downward attack',
            unlockRequirement: 20,
            cooldown: 2000,
            energyCost: 1,
            icon: 'ground_pound_icon',
            locked: true // Not implemented yet
        });
    }
    
    defineAbility(id, config) {
        this.abilities.set(id, {
            id: id,
            ...config,
            unlocked: false,
            lastUsed: 0
        });
        
        this.cooldowns.set(id, 0);
    }
    
    // Check if player can unlock an ability
    canUnlockAbility(abilityId, gemsCollected) {
        const ability = this.abilities.get(abilityId);
        if (!ability) return false;
        
        return !ability.unlocked && 
               !ability.locked && 
               gemsCollected >= ability.unlockRequirement;
    }
    
    // Unlock an ability
    unlockAbility(abilityId) {
        const ability = this.abilities.get(abilityId);
        if (!ability || ability.locked) {
            console.warn(`AbilitySystem: Cannot unlock ability ${abilityId}`);
            return false;
        }
        
        ability.unlocked = true;
        this.unlockedAbilities.add(abilityId);
        
        console.log(`AbilitySystem: Unlocked ability ${ability.name}`);
        
        // Trigger unlock effects
        this.triggerUnlockEffects(abilityId);
        
        return true;
    }
    
    triggerUnlockEffects(abilityId) {
        const ability = this.abilities.get(abilityId);
        if (!ability) return;
        
        // Visual effects
        if (this.scene.player) {
            GameHelpers.createParticleEffect(
                this.scene, 
                this.scene.player.x, 
                this.scene.player.y, 
                0x00ff00, 
                20
            );
        }
        
        // Audio feedback
        GameHelpers.playSound(this.scene, 'ability_unlock', 0.8);
        
        // Screen flash
        this.scene.cameras.main.flash(200, 255, 255, 255, false);
        
        // Emit event for UI updates
        this.scene.events.emit('abilityUnlocked', {
            id: abilityId,
            name: ability.name,
            description: ability.description
        });
    }
    
    // Check if ability is available to use
    canUseAbility(abilityId, currentTime = null) {
        const ability = this.abilities.get(abilityId);
        if (!ability || !ability.unlocked) return false;
        
        currentTime = currentTime || this.scene.time.now;
        const timeSinceLastUse = currentTime - ability.lastUsed;
        
        return timeSinceLastUse >= ability.cooldown;
    }
    
    // Use an ability
    useAbility(abilityId, ...args) {
        if (!this.canUseAbility(abilityId)) {
            return false;
        }
        
        const ability = this.abilities.get(abilityId);
        const currentTime = this.scene.time.now;
        
        // Execute ability-specific logic
        let success = false;
        switch (abilityId) {
            case 'doubleJump':
                success = this.executeDoubleJump(...args);
                break;
            case 'dash':
                success = this.executeDash(...args);
                break;
            case 'wallSlide':
                success = this.executeWallSlide(...args);
                break;
            case 'groundPound':
                success = this.executeGroundPound(...args);
                break;
            default:
                console.warn(`AbilitySystem: Unknown ability ${abilityId}`);
                return false;
        }
        
        if (success) {
            // Update last used time
            ability.lastUsed = currentTime;
            this.cooldowns.set(abilityId, ability.cooldown);
            
            // Start cooldown timer
            this.startCooldownTimer(abilityId);
            
            console.log(`AbilitySystem: Used ability ${ability.name}`);
        }
        
        return success;
    }
    
    executeDoubleJump(player) {
        if (!player || !player.body) return false;
        
        // Check if player is in air and hasn't double jumped yet
        if (player.body.touching.down || player.hasDoubleJumped) {
            return false;
        }
        
        // Perform double jump
        player.setVelocityY(GAME_CONFIG.PLAYER.JUMP_FORCE);
        player.hasDoubleJumped = true;
        
        // Visual effects
        GameHelpers.createParticleEffect(
            this.scene, 
            player.x, 
            player.y + 20, 
            0x7fb069, 
            8
        );
        
        // Audio feedback
        GameHelpers.playSound(this.scene, 'jump', 0.7);
        
        return true;
    }
    
    executeDash(player, direction) {
        if (!player || !player.body) return false;
        
        // Determine dash direction
        const dashDirection = direction || (player.flipX ? -1 : 1);
        
        // Set dash velocity
        player.setVelocityX(GAME_CONFIG.PLAYER.DASH_SPEED * dashDirection);
        player.setVelocityY(0); // Stop vertical movement during dash
        
        // Set dash state
        player.isDashing = true;
        player.dashStartTime = this.scene.time.now;
        
        // Visual effects
        GameHelpers.createParticleEffect(
            this.scene, 
            player.x, 
            player.y, 
            0xa3d977, 
            12
        );
        
        // Audio feedback
        GameHelpers.playSound(this.scene, 'dash', 0.6);
        
        // End dash after duration
        this.scene.time.delayedCall(GAME_CONFIG.PLAYER.DASH_DURATION, () => {
            if (player.isDashing) {
                player.isDashing = false;
            }
        });
        
        return true;
    }
    
    executeWallSlide(player, wall) {
        // Not implemented yet - placeholder for future feature
        console.log('AbilitySystem: Wall slide not implemented yet');
        return false;
    }
    
    executeGroundPound(player) {
        // Not implemented yet - placeholder for future feature
        console.log('AbilitySystem: Ground pound not implemented yet');
        return false;
    }
    
    startCooldownTimer(abilityId) {
        const ability = this.abilities.get(abilityId);
        if (!ability || ability.cooldown <= 0) return;
        
        // Create cooldown timer
        const timer = this.scene.time.addEvent({
            delay: 100, // Update every 100ms
            callback: () => {
                const remaining = this.getRemainingCooldown(abilityId);
                if (remaining <= 0) {
                    timer.destroy();
                    this.onCooldownComplete(abilityId);
                }
            },
            loop: true
        });
    }
    
    onCooldownComplete(abilityId) {
        const ability = this.abilities.get(abilityId);
        if (ability) {
            console.log(`AbilitySystem: ${ability.name} cooldown complete`);
            
            // Emit event for UI updates
            this.scene.events.emit('abilityCooldownComplete', abilityId);
        }
    }
    
    // Get remaining cooldown time
    getRemainingCooldown(abilityId) {
        const ability = this.abilities.get(abilityId);
        if (!ability) return 0;
        
        const currentTime = this.scene.time.now;
        const timeSinceLastUse = currentTime - ability.lastUsed;
        const remaining = Math.max(0, ability.cooldown - timeSinceLastUse);
        
        return remaining;
    }
    
    // Get cooldown percentage (0-1)
    getCooldownPercentage(abilityId) {
        const ability = this.abilities.get(abilityId);
        if (!ability || ability.cooldown <= 0) return 0;
        
        const remaining = this.getRemainingCooldown(abilityId);
        return remaining / ability.cooldown;
    }
    
    // Check if ability is unlocked
    isAbilityUnlocked(abilityId) {
        const ability = this.abilities.get(abilityId);
        return ability ? ability.unlocked : false;
    }
    
    // Get all unlocked abilities
    getUnlockedAbilities() {
        return Array.from(this.unlockedAbilities);
    }
    
    // Get all abilities (for UI display)
    getAllAbilities() {
        return Array.from(this.abilities.values());
    }
    
    // Get ability info
    getAbilityInfo(abilityId) {
        return this.abilities.get(abilityId) || null;
    }
    
    // Save ability state
    saveState() {
        return {
            unlockedAbilities: Array.from(this.unlockedAbilities),
            cooldowns: Object.fromEntries(this.cooldowns)
        };
    }
    
    // Load ability state
    loadState(state) {
        if (state.unlockedAbilities) {
            this.unlockedAbilities = new Set(state.unlockedAbilities);
            
            // Update ability unlock status
            state.unlockedAbilities.forEach(abilityId => {
                const ability = this.abilities.get(abilityId);
                if (ability) {
                    ability.unlocked = true;
                }
            });
        }
        
        if (state.cooldowns) {
            this.cooldowns = new Map(Object.entries(state.cooldowns));
        }
    }
    
    // Reset all abilities (for new game)
    reset() {
        this.unlockedAbilities.clear();
        this.cooldowns.clear();
        
        // Reset all abilities to locked state
        for (let ability of this.abilities.values()) {
            ability.unlocked = false;
            ability.lastUsed = 0;
        }
    }
    
    // Update method (call from scene update)
    update(time, delta) {
        // Update cooldown timers
        // This is handled by individual timers, but could be centralized here if needed
    }
    
    // Cleanup
    destroy() {
        this.abilities.clear();
        this.cooldowns.clear();
        this.unlockedAbilities.clear();
    }
}

// Global ability system
window.AbilitySystem = AbilitySystem;