// Forest Guardian Platformer - Helper Utilities

class GameHelpers {
    // Create a simple colored rectangle sprite for prototyping
    static createColoredRect(scene, x, y, width, height, color, alpha = 1) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(`rect_${width}x${height}_${color}`, width, height);
        graphics.destroy();
        
        return scene.add.sprite(x, y, `rect_${width}x${height}_${color}`);
    }
    
    // Create a simple colored circle sprite for prototyping
    static createColoredCircle(scene, x, y, radius, color, alpha = 1) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(0, 0, radius);
        graphics.generateTexture(`circle_${radius}_${color}`, radius * 2, radius * 2);
        graphics.destroy();
        
        return scene.add.sprite(x, y, `circle_${radius}_${color}`);
    }
    
    // Create placeholder sprite animations
    static createPlaceholderAnimation(scene, key, frameCount, fps) {
        if (!scene.anims.exists(key)) {
            const frames = [];
            for (let i = 0; i < frameCount; i++) {
                frames.push({ key: key, frame: i });
            }
            
            scene.anims.create({
                key: key,
                frames: frames,
                frameRate: fps,
                repeat: -1
            });
        }
    }
    
    // Tween helper for smooth movements
    static smoothMove(scene, target, toX, toY, duration = 1000, ease = 'Power2') {
        return scene.tweens.add({
            targets: target,
            x: toX,
            y: toY,
            duration: duration,
            ease: ease
        });
    }
    
    // Shake effect for screen shake
    static shakeCamera(scene, intensity = 5, duration = 100) {
        scene.cameras.main.shake(duration, intensity);
    }
    
    // Flash effect for damage feedback
    static flashSprite(scene, sprite, color = 0xff0000, duration = 100) {
        const originalTint = sprite.tint;
        sprite.setTint(color);
        
        scene.time.delayedCall(duration, () => {
            sprite.setTint(originalTint);
        });
    }
    
    // Bounce effect for collectibles
    static bounceSprite(scene, sprite, scale = 1.2, duration = 200) {
        scene.tweens.add({
            targets: sprite,
            scaleX: scale,
            scaleY: scale,
            duration: duration / 2,
            ease: 'Power2',
            yoyo: true
        });
    }
    
    // Fade in/out effects
    static fadeIn(scene, target, duration = 500) {
        target.setAlpha(0);
        return scene.tweens.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    static fadeOut(scene, target, duration = 500) {
        return scene.tweens.add({
            targets: target,
            alpha: 0,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    // Particle effect helper
    static createParticleEffect(scene, x, y, color, count = 10) {
        const particles = scene.add.particles(x, y, 'particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            tint: color,
            quantity: count
        });
        
        // Auto-destroy after particles fade
        scene.time.delayedCall(500, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    // Text styling helper
    static getTextStyle(type = 'default') {
        const styles = {
            default: {
                fontSize: '16px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                stroke: '#1a4d3a',
                strokeThickness: 2
            },
            title: {
                fontSize: '32px',
                fontFamily: 'Courier New, monospace',
                fill: '#7fb069',
                stroke: '#1a4d3a',
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 2,
                    fill: true
                }
            },
            ui: {
                fontSize: '14px',
                fontFamily: 'Courier New, monospace',
                fill: '#e8f5e8',
                stroke: '#2d5a3d',
                strokeThickness: 1
            },
            score: {
                fontSize: '20px',
                fontFamily: 'Courier New, monospace',
                fill: '#a3d977',
                stroke: '#1a4d3a',
                strokeThickness: 2
            }
        };
        
        return styles[type] || styles.default;
    }
    
    // Sound helper with volume control
    static playSound(scene, key, volume = 1, loop = false) {
        if (scene.sound && scene.sound.get(key)) {
            const sound = scene.sound.play(key, {
                volume: volume * GAME_CONFIG.AUDIO.SFX_VOLUME,
                loop: loop
            });
            return sound;
        }
        return null;
    }
    
    // Music helper with fade in/out
    static playMusic(scene, key, volume = 1, fadeIn = true) {
        // Stop current music if playing
        if (scene.currentMusic) {
            if (fadeIn) {
                scene.tweens.add({
                    targets: scene.currentMusic,
                    volume: 0,
                    duration: 500,
                    onComplete: () => {
                        scene.currentMusic.stop();
                        scene.currentMusic = null;
                    }
                });
            } else {
                scene.currentMusic.stop();
                scene.currentMusic = null;
            }
        }
        
        // Start new music
        if (scene.sound && scene.sound.get(key)) {
            const music = scene.sound.play(key, {
                volume: fadeIn ? 0 : volume * GAME_CONFIG.AUDIO.MUSIC_VOLUME,
                loop: true
            });
            
            scene.currentMusic = music;
            
            if (fadeIn) {
                scene.tweens.add({
                    targets: music,
                    volume: volume * GAME_CONFIG.AUDIO.MUSIC_VOLUME,
                    duration: 1000,
                    ease: 'Power2'
                });
            }
            
            return music;
        }
        return null;
    }
    
    // Debug helpers
    static drawDebugRect(scene, x, y, width, height, color = 0xff0000) {
        const graphics = scene.add.graphics();
        graphics.lineStyle(2, color);
        graphics.strokeRect(x - width/2, y - height/2, width, height);
        return graphics;
    }
    
    static drawDebugCircle(scene, x, y, radius, color = 0xff0000) {
        const graphics = scene.add.graphics();
        graphics.lineStyle(2, color);
        graphics.strokeCircle(x, y, radius);
        return graphics;
    }
    
    // Save/Load helpers
    static saveGameData(key, data) {
        try {
            localStorage.setItem(`forest_guardian_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }
    
    static loadGameData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`forest_guardian_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load game data:', error);
            return defaultValue;
        }
    }
    
    // Performance helpers
    static optimizeSprite(sprite) {
        // Set sprite to not be interactive if not needed
        sprite.setInteractive(false);
        
        // Disable unnecessary physics body updates when off-screen
        if (sprite.body) {
            sprite.body.checkCollision.none = false;
        }
    }
    
    // Collision detection helpers
    static checkOverlap(rect1, rect2) {
        return !(rect1.x + rect1.width < rect2.x || 
                rect2.x + rect2.width < rect1.x || 
                rect1.y + rect1.height < rect2.y || 
                rect2.y + rect2.height < rect1.y);
    }
    
    // Input helpers
    static createInputHandler(scene) {
        return {
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            dash: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            
            // Arrow keys as alternatives
            leftArrow: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            rightArrow: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            upArrow: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            downArrow: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            
            // Utility methods
            isLeftPressed: function() {
                return this.left.isDown || this.leftArrow.isDown;
            },
            isRightPressed: function() {
                return this.right.isDown || this.rightArrow.isDown;
            },
            isUpPressed: function() {
                return this.up.isDown || this.upArrow.isDown;
            },
            isDownPressed: function() {
                return this.down.isDown || this.downArrow.isDown;
            },
            isJumpPressed: function() {
                return this.jump.isDown;
            },
            isJumpJustPressed: function() {
                return Phaser.Input.Keyboard.JustDown(this.jump);
            },
            isDashPressed: function() {
                return this.dash.isDown;
            },
            isDashJustPressed: function() {
                return Phaser.Input.Keyboard.JustDown(this.dash);
            }
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameHelpers;
}