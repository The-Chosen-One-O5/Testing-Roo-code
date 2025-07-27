// Forest Guardian Platformer - Audio Manager

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = new Map();
        this.music = null;
        this.masterVolume = GAME_CONFIG.AUDIO.MASTER_VOLUME;
        this.musicVolume = GAME_CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = GAME_CONFIG.AUDIO.SFX_VOLUME;
        this.isMuted = false;
    }
    
    // Initialize audio system
    init() {
        console.log('AudioManager: Initializing audio system...');
        
        // Load audio settings from localStorage
        this.loadSettings();
        
        // Create placeholder sounds for development
        this.createPlaceholderSounds();
    }
    
    createPlaceholderSounds() {
        // Create simple beep sounds for development
        // These will be replaced with actual audio files later
        
        // Jump sound (short beep)
        this.createBeepSound('jump', 440, 0.1);
        
        // Gem collection sound (higher pitch)
        this.createBeepSound('gem_collect', 880, 0.15);
        
        // Dash sound (whoosh effect)
        this.createBeepSound('dash', 220, 0.2);
        
        // Player hit sound (lower pitch)
        this.createBeepSound('player_hit', 110, 0.3);
        
        // Menu sounds
        this.createBeepSound('menu_hover', 660, 0.05);
        this.createBeepSound('menu_select', 550, 0.1);
        this.createBeepSound('menu_navigate', 770, 0.05);
        
        // Ability unlock sound
        this.createBeepSound('ability_unlock', 1100, 0.4);
    }
    
    createBeepSound(key, frequency, duration) {
        // Create a simple beep sound using Web Audio API
        if (this.scene.sound && this.scene.sound.context) {
            const audioContext = this.scene.sound.context;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            // Store sound reference
            this.sounds.set(key, {
                frequency: frequency,
                duration: duration,
                type: 'beep'
            });
        }
    }
    
    playSound(key, volume = 1, loop = false) {
        if (this.isMuted) return null;
        
        const soundData = this.sounds.get(key);
        if (soundData && soundData.type === 'beep') {
            this.playBeep(soundData.frequency, soundData.duration, volume);
            return true;
        }
        
        // Try to play actual audio file if it exists
        if (this.scene.sound && this.scene.cache.audio.exists(key)) {
            const sound = this.scene.sound.play(key, {
                volume: volume * this.sfxVolume * this.masterVolume,
                loop: loop
            });
            return sound;
        }
        
        return null;
    }
    
    playBeep(frequency, duration, volume = 1) {
        if (!this.scene.sound || !this.scene.sound.context) return;
        
        const audioContext = this.scene.sound.context;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'square';
        
        const finalVolume = volume * this.sfxVolume * this.masterVolume * 0.1;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    playMusic(key, volume = 1, fadeIn = true) {
        if (this.isMuted) return null;
        
        // Stop current music
        this.stopMusic(fadeIn);
        
        // Try to play actual music file
        if (this.scene.sound && this.scene.cache.audio.exists(key)) {
            this.music = this.scene.sound.play(key, {
                volume: fadeIn ? 0 : volume * this.musicVolume * this.masterVolume,
                loop: true
            });
            
            if (fadeIn && this.music) {
                this.scene.tweens.add({
                    targets: this.music,
                    volume: volume * this.musicVolume * this.masterVolume,
                    duration: 1000,
                    ease: 'Power2'
                });
            }
            
            return this.music;
        }
        
        return null;
    }
    
    stopMusic(fadeOut = true) {
        if (this.music) {
            if (fadeOut) {
                this.scene.tweens.add({
                    targets: this.music,
                    volume: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        if (this.music) {
                            this.music.stop();
                            this.music = null;
                        }
                    }
                });
            } else {
                this.music.stop();
                this.music = null;
            }
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.saveSettings();
        
        // Update current music volume
        if (this.music) {
            this.music.setVolume(this.musicVolume * this.masterVolume);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.saveSettings();
        
        // Update current music volume
        if (this.music) {
            this.music.setVolume(this.musicVolume * this.masterVolume);
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.saveSettings();
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveSettings();
        
        if (this.isMuted) {
            this.stopMusic(false);
        }
        
        return this.isMuted;
    }
    
    saveSettings() {
        const settings = {
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted
        };
        
        GameHelpers.saveGameData('audio_settings', settings);
    }
    
    loadSettings() {
        const settings = GameHelpers.loadGameData('audio_settings', {
            masterVolume: GAME_CONFIG.AUDIO.MASTER_VOLUME,
            musicVolume: GAME_CONFIG.AUDIO.MUSIC_VOLUME,
            sfxVolume: GAME_CONFIG.AUDIO.SFX_VOLUME,
            isMuted: false
        });
        
        this.masterVolume = settings.masterVolume;
        this.musicVolume = settings.musicVolume;
        this.sfxVolume = settings.sfxVolume;
        this.isMuted = settings.isMuted;
    }
    
    // Cleanup
    destroy() {
        this.stopMusic(false);
        this.sounds.clear();
    }
}

// Global audio manager instance
window.AudioManager = AudioManager;