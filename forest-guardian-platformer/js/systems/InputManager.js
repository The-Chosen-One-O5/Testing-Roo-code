// Forest Guardian Platformer - Input Manager

class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};
        this.gamepad = null;
        this.touchControls = null;
        this.inputBuffer = new Map();
        this.bufferTime = 100; // ms
    }
    
    // Initialize input system
    init() {
        console.log('InputManager: Initializing input system...');
        
        // Set up keyboard input
        this.setupKeyboard();
        
        // Set up gamepad support
        this.setupGamepad();
        
        // Set up touch controls for mobile
        this.setupTouchControls();
        
        // Set up input buffering
        this.setupInputBuffer();
    }
    
    setupKeyboard() {
        // Movement keys
        this.keys.left = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.right = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        
        // Arrow keys as alternatives
        this.keys.leftArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keys.rightArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.keys.upArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keys.downArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        
        // Action keys
        this.keys.jump = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.dash = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.interact = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Menu keys
        this.keys.pause = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.keys.restart = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keys.menu = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // Set up key event listeners for buffering
        Object.values(this.keys).forEach(key => {
            key.on('down', () => {
                this.bufferInput(key.keyCode, 'down');
            });
            
            key.on('up', () => {
                this.bufferInput(key.keyCode, 'up');
            });
        });
    }
    
    setupGamepad() {
        // Enable gamepad support
        this.scene.input.gamepad.start();
        
        this.scene.input.gamepad.on('connected', (pad) => {
            console.log('InputManager: Gamepad connected:', pad.id);
            this.gamepad = pad;
        });
        
        this.scene.input.gamepad.on('disconnected', (pad) => {
            console.log('InputManager: Gamepad disconnected');
            this.gamepad = null;
        });
    }
    
    setupTouchControls() {
        // Only set up touch controls on mobile devices
        if (this.scene.sys.game.device.input.touch) {
            this.createTouchControls();
        }
    }
    
    createTouchControls() {
        // Create virtual D-pad and action buttons
        const buttonSize = 60;
        const margin = 20;
        
        // Left side - movement controls
        const dpadX = margin + buttonSize;
        const dpadY = this.scene.sys.game.config.height - margin - buttonSize;
        
        // D-pad background
        this.touchControls = {
            dpadBg: this.scene.add.circle(dpadX, dpadY, buttonSize, 0x000000, 0.3),
            
            // Movement buttons
            leftBtn: this.scene.add.circle(dpadX - buttonSize/2, dpadY, buttonSize/3, 0x666666, 0.5),
            rightBtn: this.scene.add.circle(dpadX + buttonSize/2, dpadY, buttonSize/3, 0x666666, 0.5),
            upBtn: this.scene.add.circle(dpadX, dpadY - buttonSize/2, buttonSize/3, 0x666666, 0.5),
            downBtn: this.scene.add.circle(dpadX, dpadY + buttonSize/2, buttonSize/3, 0x666666, 0.5),
            
            // Right side - action buttons
            jumpBtn: this.scene.add.circle(
                this.scene.sys.game.config.width - margin - buttonSize,
                dpadY,
                buttonSize/2,
                0x00ff00,
                0.5
            ),
            
            dashBtn: this.scene.add.circle(
                this.scene.sys.game.config.width - margin - buttonSize * 2,
                dpadY - buttonSize,
                buttonSize/3,
                0xff0000,
                0.5
            )
        };
        
        // Make buttons interactive
        this.setupTouchInteractions();
        
        // Set fixed camera position for UI elements
        Object.values(this.touchControls).forEach(control => {
            control.setScrollFactor(0);
        });
    }
    
    setupTouchInteractions() {
        if (!this.touchControls) return;
        
        // Movement buttons
        this.touchControls.leftBtn.setInteractive()
            .on('pointerdown', () => this.setTouchInput('left', true))
            .on('pointerup', () => this.setTouchInput('left', false))
            .on('pointerout', () => this.setTouchInput('left', false));
            
        this.touchControls.rightBtn.setInteractive()
            .on('pointerdown', () => this.setTouchInput('right', true))
            .on('pointerup', () => this.setTouchInput('right', false))
            .on('pointerout', () => this.setTouchInput('right', false));
            
        this.touchControls.upBtn.setInteractive()
            .on('pointerdown', () => this.setTouchInput('up', true))
            .on('pointerup', () => this.setTouchInput('up', false))
            .on('pointerout', () => this.setTouchInput('up', false));
            
        this.touchControls.downBtn.setInteractive()
            .on('pointerdown', () => this.setTouchInput('down', true))
            .on('pointerup', () => this.setTouchInput('down', false))
            .on('pointerout', () => this.setTouchInput('down', false));
            
        // Action buttons
        this.touchControls.jumpBtn.setInteractive()
            .on('pointerdown', () => this.setTouchInput('jump', true))
            .on('pointerup', () => this.setTouchInput('jump', false))
            .on('pointerout', () => this.setTouchInput('jump', false));
            
        this.touchControls.dashBtn.setInteractive()
            .on('pointerdown', () => this.setTouchInput('dash', true))
            .on('pointerup', () => this.setTouchInput('dash', false))
            .on('pointerout', () => this.setTouchInput('dash', false));
    }
    
    setTouchInput(action, pressed) {
        if (!this.touchInput) {
            this.touchInput = {};
        }
        
        this.touchInput[action] = pressed;
        
        // Visual feedback
        const button = this.touchControls[action + 'Btn'];
        if (button) {
            button.setAlpha(pressed ? 0.8 : 0.5);
        }
    }
    
    setupInputBuffer() {
        // Clear old buffered inputs periodically
        this.scene.time.addEvent({
            delay: this.bufferTime,
            callback: this.clearOldInputs,
            callbackScope: this,
            loop: true
        });
    }
    
    bufferInput(keyCode, action) {
        const now = this.scene.time.now;
        const key = `${keyCode}_${action}`;
        this.inputBuffer.set(key, now);
    }
    
    clearOldInputs() {
        const now = this.scene.time.now;
        for (let [key, timestamp] of this.inputBuffer) {
            if (now - timestamp > this.bufferTime) {
                this.inputBuffer.delete(key);
            }
        }
    }
    
    // Check if input was pressed recently (for buffering)
    wasJustPressed(keyCode, timeWindow = this.bufferTime) {
        const now = this.scene.time.now;
        const key = `${keyCode}_down`;
        const timestamp = this.inputBuffer.get(key);
        return timestamp && (now - timestamp <= timeWindow);
    }
    
    // Input state checking methods
    isLeftPressed() {
        return (this.keys.left && this.keys.left.isDown) ||
               (this.keys.leftArrow && this.keys.leftArrow.isDown) ||
               (this.gamepad && this.gamepad.left) ||
               (this.touchInput && this.touchInput.left);
    }
    
    isRightPressed() {
        return (this.keys.right && this.keys.right.isDown) ||
               (this.keys.rightArrow && this.keys.rightArrow.isDown) ||
               (this.gamepad && this.gamepad.right) ||
               (this.touchInput && this.touchInput.right);
    }
    
    isUpPressed() {
        return (this.keys.up && this.keys.up.isDown) ||
               (this.keys.upArrow && this.keys.upArrow.isDown) ||
               (this.gamepad && this.gamepad.up) ||
               (this.touchInput && this.touchInput.up);
    }
    
    isDownPressed() {
        return (this.keys.down && this.keys.down.isDown) ||
               (this.keys.downArrow && this.keys.downArrow.isDown) ||
               (this.gamepad && this.gamepad.down) ||
               (this.touchInput && this.touchInput.down);
    }
    
    isJumpPressed() {
        return (this.keys.jump && this.keys.jump.isDown) ||
               (this.gamepad && this.gamepad.A) ||
               (this.touchInput && this.touchInput.jump);
    }
    
    isJumpJustPressed() {
        return (this.keys.jump && Phaser.Input.Keyboard.JustDown(this.keys.jump)) ||
               (this.gamepad && this.gamepad.A && this.gamepad.A.justPressed) ||
               this.wasJustPressed(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    isDashPressed() {
        return (this.keys.dash && this.keys.dash.isDown) ||
               (this.gamepad && this.gamepad.X) ||
               (this.touchInput && this.touchInput.dash);
    }
    
    isDashJustPressed() {
        return (this.keys.dash && Phaser.Input.Keyboard.JustDown(this.keys.dash)) ||
               (this.gamepad && this.gamepad.X && this.gamepad.X.justPressed) ||
               this.wasJustPressed(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }
    
    isInteractPressed() {
        return (this.keys.interact && this.keys.interact.isDown) ||
               (this.gamepad && this.gamepad.B);
    }
    
    isInteractJustPressed() {
        return (this.keys.interact && Phaser.Input.Keyboard.JustDown(this.keys.interact)) ||
               (this.gamepad && this.gamepad.B && this.gamepad.B.justPressed);
    }
    
    isPauseJustPressed() {
        return (this.keys.pause && Phaser.Input.Keyboard.JustDown(this.keys.pause)) ||
               (this.gamepad && this.gamepad.Y && this.gamepad.Y.justPressed);
    }
    
    // Get movement vector (-1 to 1 for each axis)
    getMovementVector() {
        let x = 0;
        let y = 0;
        
        if (this.isLeftPressed()) x -= 1;
        if (this.isRightPressed()) x += 1;
        if (this.isUpPressed()) y -= 1;
        if (this.isDownPressed()) y += 1;
        
        // Add gamepad analog stick support
        if (this.gamepad && this.gamepad.leftStick) {
            x += this.gamepad.leftStick.x;
            y += this.gamepad.leftStick.y;
        }
        
        // Clamp values
        x = Phaser.Math.Clamp(x, -1, 1);
        y = Phaser.Math.Clamp(y, -1, 1);
        
        return { x, y };
    }
    
    // Update method (call from scene update)
    update() {
        // Update gamepad state
        if (this.gamepad) {
            // Handle gamepad disconnection
            if (!this.gamepad.connected) {
                this.gamepad = null;
            }
        }
    }
    
    // Show/hide touch controls
    setTouchControlsVisible(visible) {
        if (this.touchControls) {
            Object.values(this.touchControls).forEach(control => {
                control.setVisible(visible);
            });
        }
    }
    
    // Cleanup
    destroy() {
        if (this.touchControls) {
            Object.values(this.touchControls).forEach(control => {
                control.destroy();
            });
            this.touchControls = null;
        }
        
        this.inputBuffer.clear();
        this.gamepad = null;
    }
}

// Global input manager
window.InputManager = InputManager;