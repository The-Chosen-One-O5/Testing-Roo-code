// Forest Guardian Platformer - Menu Scene

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: GAME_CONFIG.SCENES.MENU });
    }
    
    create() {
        console.log('MenuScene: Creating menu...');
        
        // Set up background
        this.createBackground();
        
        // Create title and UI elements
        this.createTitle();
        this.createMenu();
        
        // Set up input handling
        this.setupInput();
        
        // Add some atmospheric effects
        this.createAtmosphericEffects();
    }
    
    createBackground() {
        // Create a simple gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            GAME_CONFIG.COLORS.BACKGROUND, 
            GAME_CONFIG.COLORS.BACKGROUND,
            0x2d5a3d, 
            0x1a4d3a,
            1
        );
        bg.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // Add some simple background elements
        this.createBackgroundElements();
    }
    
    createBackgroundElements() {
        // Create some simple tree silhouettes
        for (let i = 0; i < 5; i++) {
            const x = (i + 1) * (GAME_CONFIG.WIDTH / 6);
            const height = 150 + Math.random() * 100;
            
            const tree = this.add.graphics();
            tree.fillStyle(0x1a4d3a, 0.6);
            tree.fillTriangle(x, GAME_CONFIG.HEIGHT, x - 20, GAME_CONFIG.HEIGHT - height, x + 20, GAME_CONFIG.HEIGHT - height);
            tree.fillRect(x - 5, GAME_CONFIG.HEIGHT - 30, 10, 30);
        }
        
        // Add some floating particles
        this.createFloatingParticles();
    }
    
    createFloatingParticles() {
        // Create simple floating particles for atmosphere
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Math.random() * GAME_CONFIG.WIDTH,
                Math.random() * GAME_CONFIG.HEIGHT,
                2 + Math.random() * 3,
                0x7fb069,
                0.3 + Math.random() * 0.4
            );
            
            // Add floating animation
            this.tweens.add({
                targets: particle,
                y: particle.y - 50 - Math.random() * 100,
                x: particle.x + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 3000 + Math.random() * 2000,
                ease: 'Power2',
                repeat: -1,
                delay: Math.random() * 2000
            });
        }
    }
    
    createTitle() {
        // Main title
        this.titleText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            150,
            'Forest Guardian',
            GameHelpers.getTextStyle('title')
        ).setOrigin(0.5);
        
        // Subtitle
        this.subtitleText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            200,
            'Mystical Forest Adventure',
            {
                fontSize: '18px',
                fontFamily: 'Courier New, monospace',
                fill: '#a3d977',
                stroke: '#1a4d3a',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add title animation
        this.tweens.add({
            targets: [this.titleText, this.subtitleText],
            alpha: { from: 0, to: 1 },
            y: { from: '-=20', to: '+=0' },
            duration: 1000,
            ease: 'Power2'
        });
    }
    
    createMenu() {
        const centerX = GAME_CONFIG.WIDTH / 2;
        const startY = 300;
        const buttonSpacing = 60;
        
        // Menu options
        const menuOptions = [
            { text: 'Start Adventure', action: 'startGame' },
            { text: 'Instructions', action: 'showInstructions' },
            { text: 'Credits', action: 'showCredits' }
        ];
        
        this.menuButtons = [];
        
        menuOptions.forEach((option, index) => {
            const y = startY + (index * buttonSpacing);
            
            // Create button background
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(GAME_CONFIG.COLORS.UI_SECONDARY, 0.8);
            buttonBg.fillRoundedRect(-100, -20, 200, 40, 10);
            buttonBg.x = centerX;
            buttonBg.y = y;
            
            // Create button text
            const buttonText = this.add.text(
                centerX,
                y,
                option.text,
                GameHelpers.getTextStyle('ui')
            ).setOrigin(0.5);
            
            // Make button interactive
            const button = this.add.zone(centerX, y, 200, 40)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    buttonBg.clear();
                    buttonBg.fillStyle(GAME_CONFIG.COLORS.UI_PRIMARY, 0.9);
                    buttonBg.fillRoundedRect(-100, -20, 200, 40, 10);
                    buttonText.setScale(1.1);
                    GameHelpers.playSound(this, 'menu_hover', 0.3);
                })
                .on('pointerout', () => {
                    buttonBg.clear();
                    buttonBg.fillStyle(GAME_CONFIG.COLORS.UI_SECONDARY, 0.8);
                    buttonBg.fillRoundedRect(-100, -20, 200, 40, 10);
                    buttonText.setScale(1.0);
                })
                .on('pointerdown', () => {
                    this.handleMenuAction(option.action);
                });
            
            this.menuButtons.push({
                zone: button,
                background: buttonBg,
                text: buttonText,
                action: option.action
            });
            
            // Add entrance animation
            buttonBg.setAlpha(0);
            buttonText.setAlpha(0);
            
            this.tweens.add({
                targets: [buttonBg, buttonText],
                alpha: 1,
                duration: 500,
                delay: 200 + (index * 100),
                ease: 'Power2'
            });
        });
        
        // Add version info
        this.add.text(
            GAME_CONFIG.WIDTH - 10,
            GAME_CONFIG.HEIGHT - 10,
            'Demo v1.0',
            {
                fontSize: '12px',
                fontFamily: 'Courier New, monospace',
                fill: '#4a7c59'
            }
        ).setOrigin(1);
    }
    
    setupInput() {
        // Keyboard navigation
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.selectedIndex = 0;
        this.updateSelection();
        
        // Handle keyboard input
        this.cursors.up.on('down', () => {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.updateSelection();
            GameHelpers.playSound(this, 'menu_navigate', 0.3);
        });
        
        this.cursors.down.on('down', () => {
            this.selectedIndex = Math.min(this.menuButtons.length - 1, this.selectedIndex + 1);
            this.updateSelection();
            GameHelpers.playSound(this, 'menu_navigate', 0.3);
        });
        
        this.enterKey.on('down', () => {
            this.activateSelected();
        });
        
        this.spaceKey.on('down', () => {
            this.activateSelected();
        });
    }
    
    updateSelection() {
        this.menuButtons.forEach((button, index) => {
            if (index === this.selectedIndex) {
                // Highlight selected button
                button.background.clear();
                button.background.fillStyle(GAME_CONFIG.COLORS.UI_PRIMARY, 0.9);
                button.background.fillRoundedRect(-100, -20, 200, 40, 10);
                button.text.setScale(1.1);
            } else {
                // Normal button appearance
                button.background.clear();
                button.background.fillStyle(GAME_CONFIG.COLORS.UI_SECONDARY, 0.8);
                button.background.fillRoundedRect(-100, -20, 200, 40, 10);
                button.text.setScale(1.0);
            }
        });
    }
    
    activateSelected() {
        const selectedButton = this.menuButtons[this.selectedIndex];
        if (selectedButton) {
            this.handleMenuAction(selectedButton.action);
        }
    }
    
    handleMenuAction(action) {
        GameHelpers.playSound(this, 'menu_select', 0.5);
        
        switch (action) {
            case 'startGame':
                this.startGame();
                break;
            case 'showInstructions':
                this.showInstructions();
                break;
            case 'showCredits':
                this.showCredits();
                break;
        }
    }
    
    startGame() {
        console.log('MenuScene: Starting game...');
        
        // Fade out menu elements
        this.tweens.add({
            targets: [this.titleText, this.subtitleText, ...this.menuButtons.map(b => [b.background, b.text]).flat()],
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Start the game scene
                this.scene.start(GAME_CONFIG.SCENES.GAME);
                
                // Start UI scene as overlay
                this.scene.launch(GAME_CONFIG.SCENES.UI);
            }
        });
    }
    
    showInstructions() {
        // Create instructions overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        const instructions = [
            'HOW TO PLAY',
            '',
            'WASD or Arrow Keys - Move',
            'SPACE - Jump (hold for higher jumps)',
            'SHIFT - Dash (when unlocked)',
            '',
            'Collect gems to unlock new abilities!',
            'Avoid enemies and reach the end!',
            '',
            'Press any key to return...'
        ];
        
        const instructionText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            instructions.join('\n'),
            {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);
        
        // Close instructions on any key
        const closeInstructions = () => {
            overlay.destroy();
            instructionText.destroy();
            this.input.keyboard.off('keydown', closeInstructions);
        };
        
        this.input.keyboard.on('keydown', closeInstructions);
    }
    
    showCredits() {
        // Create credits overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        const credits = [
            'FOREST GUARDIAN',
            'Demo Version',
            '',
            'Created with Phaser.js',
            'Placeholder art and sounds',
            'from open source resources',
            '',
            'Thank you for playing!',
            '',
            'Press any key to return...'
        ];
        
        const creditsText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            credits.join('\n'),
            {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);
        
        // Close credits on any key
        const closeCredits = () => {
            overlay.destroy();
            creditsText.destroy();
            this.input.keyboard.off('keydown', closeCredits);
        };
        
        this.input.keyboard.on('keydown', closeCredits);
    }
    
    createAtmosphericEffects() {
        // Add subtle pulsing effect to title
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}