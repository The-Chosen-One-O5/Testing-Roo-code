// Forest Guardian Platformer - UI Scene

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: GAME_CONFIG.SCENES.UI });
    }
    
    create() {
        console.log('UIScene: Creating UI overlay...');
        
        // Initialize UI state
        this.playerHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.gemsCollected = 0;
        this.unlockedAbilities = [];
        this.gameTime = 0;
        
        // Create UI elements
        this.createHealthBar();
        this.createGemCounter();
        this.createAbilityIcons();
        this.createGameTimer();
        this.createPauseMenu();
        
        // Set up input handling
        this.setupInput();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game timer
        this.startGameTimer();
    }
    
    createHealthBar() {
        const x = 20;
        const y = 20;
        
        // Health bar label
        this.healthLabel = this.add.text(x, y, 'Health:', GameHelpers.getTextStyle('ui'));
        
        // Health bar background
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x333333);
        this.healthBarBg.fillRoundedRect(x, y + 25, 120, 20, 5);
        
        // Health bar fill
        this.healthBarFill = this.add.graphics();
        this.updateHealthBar();
        
        // Health hearts (alternative visual)
        this.healthHearts = [];
        for (let i = 0; i < GAME_CONFIG.PLAYER.MAX_HEALTH; i++) {
            const heart = this.add.graphics();
            heart.fillStyle(0xFF0000);
            heart.fillCircle(x + 150 + (i * 25), y + 35, 8);
            this.healthHearts.push(heart);
        }
    }
    
    updateHealthBar() {
        this.healthBarFill.clear();
        
        // Calculate health percentage
        const healthPercent = this.playerHealth / GAME_CONFIG.PLAYER.MAX_HEALTH;
        const barWidth = 120 * healthPercent;
        
        // Choose color based on health level
        let healthColor = 0x00FF00; // Green
        if (healthPercent < 0.6) healthColor = 0xFFFF00; // Yellow
        if (healthPercent < 0.3) healthColor = 0xFF0000; // Red
        
        this.healthBarFill.fillStyle(healthColor);
        this.healthBarFill.fillRoundedRect(20, 45, barWidth, 20, 5);
        
        // Update heart display
        this.healthHearts.forEach((heart, index) => {
            if (index < this.playerHealth) {
                heart.setAlpha(1);
            } else {
                heart.setAlpha(0.3);
            }
        });
    }
    
    createGemCounter() {
        const x = 20;
        const y = 80;
        
        // Gem icon (simple diamond shape)
        this.gemIcon = this.add.graphics();
        this.gemIcon.fillStyle(GAME_CONFIG.COLORS.GEM);
        this.gemIcon.fillRect(x, y, 16, 16);
        
        // Gem counter text
        this.gemCounterText = this.add.text(
            x + 25, 
            y, 
            `x ${this.gemsCollected}`, 
            GameHelpers.getTextStyle('ui')
        );
        
        // Next ability unlock progress
        this.abilityProgressText = this.add.text(
            x, 
            y + 25, 
            this.getAbilityProgressText(), 
            {
                fontSize: '12px',
                fontFamily: 'Courier New, monospace',
                fill: '#a3d977'
            }
        );
    }
    
    getAbilityProgressText() {
        if (this.unlockedAbilities.length === 0) {
            const needed = GAME_CONFIG.GEMS.DOUBLE_JUMP_REQUIREMENT - this.gemsCollected;
            return needed > 0 ? `${needed} gems until Double Jump` : 'Double Jump Ready!';
        } else if (this.unlockedAbilities.length === 1) {
            const needed = GAME_CONFIG.GEMS.DASH_REQUIREMENT - this.gemsCollected;
            return needed > 0 ? `${needed} gems until Dash` : 'Dash Ready!';
        } else {
            return 'All abilities unlocked!';
        }
    }
    
    updateGemCounter() {
        this.gemCounterText.setText(`x ${this.gemsCollected}`);
        this.abilityProgressText.setText(this.getAbilityProgressText());
        
        // Add collection effect
        this.tweens.add({
            targets: [this.gemIcon, this.gemCounterText],
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            ease: 'Power2',
            yoyo: true
        });
    }
    
    createAbilityIcons() {
        const startX = GAME_CONFIG.WIDTH - 120;
        const y = 20;
        
        this.abilityIcons = [];
        
        // Double Jump icon
        const doubleJumpIcon = this.add.graphics();
        doubleJumpIcon.fillStyle(0x666666);
        doubleJumpIcon.fillRoundedRect(startX, y, 32, 32, 5);
        doubleJumpIcon.fillStyle(0xFFFFFF);
        doubleJumpIcon.fillTriangle(startX + 16, y + 8, startX + 8, y + 20, startX + 24, y + 20);
        doubleJumpIcon.fillTriangle(startX + 16, y + 12, startX + 10, y + 24, startX + 22, y + 24);
        doubleJumpIcon.setAlpha(0.3);
        
        this.abilityIcons.push({
            icon: doubleJumpIcon,
            type: 'doubleJump',
            unlocked: false
        });
        
        // Dash icon
        const dashIcon = this.add.graphics();
        dashIcon.fillStyle(0x666666);
        dashIcon.fillRoundedRect(startX + 40, y, 32, 32, 5);
        dashIcon.fillStyle(0xFFFFFF);
        dashIcon.fillRect(startX + 45, y + 14, 22, 4);
        dashIcon.fillTriangle(startX + 67, y + 16, startX + 62, y + 12, startX + 62, y + 20);
        dashIcon.setAlpha(0.3);
        
        this.abilityIcons.push({
            icon: dashIcon,
            type: 'dash',
            unlocked: false
        });
        
        // Ability labels
        this.add.text(startX, y + 35, 'Double\nJump', {
            fontSize: '10px',
            fontFamily: 'Courier New, monospace',
            fill: '#e8f5e8',
            align: 'center'
        });
        
        this.add.text(startX + 40, y + 35, 'Dash', {
            fontSize: '10px',
            fontFamily: 'Courier New, monospace',
            fill: '#e8f5e8',
            align: 'center'
        });
    }
    
    unlockAbility(abilityType) {
        const abilityIcon = this.abilityIcons.find(icon => icon.type === abilityType);
        if (abilityIcon && !abilityIcon.unlocked) {
            abilityIcon.unlocked = true;
            abilityIcon.icon.setAlpha(1);
            this.unlockedAbilities.push(abilityType);
            
            // Add unlock animation
            this.tweens.add({
                targets: abilityIcon.icon,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                ease: 'Power2',
                yoyo: true,
                repeat: 2
            });
            
            // Show unlock notification
            this.showNotification(`${abilityType.toUpperCase()} UNLOCKED!`);
        }
    }
    
    createGameTimer() {
        this.timerText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            20,
            '00:00',
            GameHelpers.getTextStyle('score')
        ).setOrigin(0.5);
    }
    
    startGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameTime++;
                this.updateTimer();
            },
            loop: true
        });
    }
    
    updateTimer() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.timerText.setText(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    }
    
    createPauseMenu() {
        this.isPaused = false;
        this.pauseOverlay = null;
    }
    
    setupInput() {
        // Pause key
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pauseKey.on('down', () => {
            this.togglePause();
        });
    }
    
    setupEventListeners() {
        // Listen for game events from the main game scene
        this.events = this.scene.get(GAME_CONFIG.SCENES.GAME);
        
        // Set up custom event listeners that will be called from GameScene
        this.scene.get(GAME_CONFIG.SCENES.GAME).events.on('playerHealthChanged', (health) => {
            this.playerHealth = health;
            this.updateHealthBar();
        });
        
        this.scene.get(GAME_CONFIG.SCENES.GAME).events.on('gemCollected', () => {
            this.gemsCollected++;
            this.updateGemCounter();
            this.checkAbilityUnlocks();
        });
        
        this.scene.get(GAME_CONFIG.SCENES.GAME).events.on('gameOver', () => {
            this.showGameOver();
        });
        
        this.scene.get(GAME_CONFIG.SCENES.GAME).events.on('levelComplete', () => {
            this.showLevelComplete();
        });
    }
    
    checkAbilityUnlocks() {
        // Check for double jump unlock
        if (this.gemsCollected >= GAME_CONFIG.GEMS.DOUBLE_JUMP_REQUIREMENT && 
            !this.unlockedAbilities.includes('doubleJump')) {
            this.unlockAbility('doubleJump');
        }
        
        // Check for dash unlock
        if (this.gemsCollected >= GAME_CONFIG.GEMS.DASH_REQUIREMENT && 
            !this.unlockedAbilities.includes('dash')) {
            this.unlockAbility('dash');
        }
    }
    
    togglePause() {
        if (!this.isPaused) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        this.isPaused = true;
        
        // Pause the main game scene
        this.scene.pause(GAME_CONFIG.SCENES.GAME);
        
        // Create pause overlay
        this.pauseOverlay = this.add.graphics();
        this.pauseOverlay.fillStyle(0x000000, 0.7);
        this.pauseOverlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // Pause menu
        this.pauseText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 50,
            'PAUSED',
            GameHelpers.getTextStyle('title')
        ).setOrigin(0.5);
        
        this.pauseInstructions = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            'Press ESC to resume\nPress R to restart\nPress M for menu',
            {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);
        
        // Additional pause controls
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        this.restartKey.on('down', () => {
            this.restartGame();
        });
        
        this.menuKey.on('down', () => {
            this.goToMenu();
        });
    }
    
    resumeGame() {
        this.isPaused = false;
        
        // Resume the main game scene
        this.scene.resume(GAME_CONFIG.SCENES.GAME);
        
        // Remove pause overlay
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseText.destroy();
            this.pauseInstructions.destroy();
            this.pauseOverlay = null;
        }
        
        // Remove additional pause controls
        if (this.restartKey) {
            this.restartKey.destroy();
            this.menuKey.destroy();
        }
    }
    
    restartGame() {
        this.resumeGame();
        this.scene.restart(GAME_CONFIG.SCENES.GAME);
        this.scene.restart(GAME_CONFIG.SCENES.UI);
    }
    
    goToMenu() {
        this.resumeGame();
        this.scene.stop(GAME_CONFIG.SCENES.GAME);
        this.scene.stop(GAME_CONFIG.SCENES.UI);
        this.scene.start(GAME_CONFIG.SCENES.MENU);
    }
    
    showNotification(message) {
        const notification = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            message,
            {
                fontSize: '24px',
                fontFamily: 'Courier New, monospace',
                fill: '#7fb069',
                stroke: '#1a4d3a',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Animate notification
        this.tweens.add({
            targets: notification,
            alpha: { from: 0, to: 1 },
            scaleX: { from: 0.5, to: 1 },
            scaleY: { from: 0.5, to: 1 },
            duration: 300,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: notification,
            alpha: 0,
            y: notification.y - 50,
            duration: 1000,
            delay: 1500,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy();
            }
        });
    }
    
    showGameOver() {
        // Stop game timer
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }
        
        // Create game over overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        const gameOverText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 50,
            'GAME OVER',
            GameHelpers.getTextStyle('title')
        ).setOrigin(0.5);
        
        const statsText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            `Time: ${GameUtils.formatTime(this.gameTime)}\nGems Collected: ${this.gemsCollected}\n\nPress R to restart\nPress M for menu`,
            {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);
    }
    
    showLevelComplete() {
        // Stop game timer
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }
        
        // Create victory overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        const victoryText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 50,
            'LEVEL COMPLETE!',
            GameHelpers.getTextStyle('title')
        ).setOrigin(0.5);
        
        const statsText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            `Time: ${GameUtils.formatTime(this.gameTime)}\nGems Collected: ${this.gemsCollected}\nAbilities Unlocked: ${this.unlockedAbilities.length}\n\nPress M for menu`,
            {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);
    }
}