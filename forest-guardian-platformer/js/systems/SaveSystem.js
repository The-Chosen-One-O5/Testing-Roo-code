// Forest Guardian Platformer - Save System

class SaveSystem {
    constructor() {
        this.saveKey = 'forest_guardian_save';
        this.settingsKey = 'forest_guardian_settings';
        this.currentSave = null;
    }
    
    // Initialize save system
    init() {
        console.log('SaveSystem: Initializing save system...');
        this.loadSettings();
    }
    
    // Create a new save data object
    createNewSave() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            playerData: {
                health: GAME_CONFIG.PLAYER.MAX_HEALTH,
                gemsCollected: 0,
                unlockedAbilities: [],
                position: { x: 100, y: 400 }
            },
            levelData: {
                currentLevel: 'forest',
                completedLevels: [],
                checkpoints: [],
                totalPlayTime: 0
            },
            gameStats: {
                totalGems: 0,
                totalDeaths: 0,
                totalJumps: 0,
                totalDashes: 0,
                bestTime: null
            }
        };
    }
    
    // Save game data
    saveGame(gameData) {
        try {
            const saveData = {
                ...this.createNewSave(),
                ...gameData,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.currentSave = saveData;
            
            console.log('SaveSystem: Game saved successfully');
            return true;
        } catch (error) {
            console.error('SaveSystem: Failed to save game:', error);
            return false;
        }
    }
    
    // Load game data
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (saveData) {
                this.currentSave = JSON.parse(saveData);
                console.log('SaveSystem: Game loaded successfully');
                return this.currentSave;
            } else {
                console.log('SaveSystem: No save data found');
                return null;
            }
        } catch (error) {
            console.error('SaveSystem: Failed to load game:', error);
            return null;
        }
    }
    
    // Check if save exists
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            this.currentSave = null;
            console.log('SaveSystem: Save data deleted');
            return true;
        } catch (error) {
            console.error('SaveSystem: Failed to delete save:', error);
            return false;
        }
    }
    
    // Save checkpoint
    saveCheckpoint(checkpointData) {
        if (!this.currentSave) {
            this.currentSave = this.createNewSave();
        }
        
        // Update checkpoint data
        this.currentSave.levelData.checkpoints.push({
            id: checkpointData.id,
            position: checkpointData.position,
            timestamp: Date.now(),
            playerData: { ...checkpointData.playerData }
        });
        
        // Keep only the last 3 checkpoints
        if (this.currentSave.levelData.checkpoints.length > 3) {
            this.currentSave.levelData.checkpoints.shift();
        }
        
        return this.saveGame(this.currentSave);
    }
    
    // Load from checkpoint
    loadCheckpoint(checkpointId = null) {
        if (!this.currentSave || !this.currentSave.levelData.checkpoints.length) {
            return null;
        }
        
        let checkpoint;
        if (checkpointId) {
            checkpoint = this.currentSave.levelData.checkpoints.find(cp => cp.id === checkpointId);
        } else {
            // Load most recent checkpoint
            checkpoint = this.currentSave.levelData.checkpoints[this.currentSave.levelData.checkpoints.length - 1];
        }
        
        return checkpoint || null;
    }
    
    // Update player stats
    updateStats(statUpdates) {
        if (!this.currentSave) {
            this.currentSave = this.createNewSave();
        }
        
        Object.keys(statUpdates).forEach(key => {
            if (this.currentSave.gameStats.hasOwnProperty(key)) {
                if (key === 'bestTime' && statUpdates[key] !== null) {
                    // For best time, only update if it's better (lower)
                    if (this.currentSave.gameStats.bestTime === null || 
                        statUpdates[key] < this.currentSave.gameStats.bestTime) {
                        this.currentSave.gameStats.bestTime = statUpdates[key];
                    }
                } else {
                    this.currentSave.gameStats[key] += statUpdates[key] || 0;
                }
            }
        });
        
        return this.saveGame(this.currentSave);
    }
    
    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            console.log('SaveSystem: Settings saved');
            return true;
        } catch (error) {
            console.error('SaveSystem: Failed to save settings:', error);
            return false;
        }
    }
    
    // Load settings
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            if (settings) {
                return JSON.parse(settings);
            } else {
                // Return default settings
                return {
                    audio: {
                        masterVolume: GAME_CONFIG.AUDIO.MASTER_VOLUME,
                        musicVolume: GAME_CONFIG.AUDIO.MUSIC_VOLUME,
                        sfxVolume: GAME_CONFIG.AUDIO.SFX_VOLUME,
                        muted: false
                    },
                    graphics: {
                        pixelPerfect: true,
                        showFPS: false,
                        particles: true
                    },
                    controls: {
                        keyboardLayout: 'wasd'
                    }
                };
            }
        } catch (error) {
            console.error('SaveSystem: Failed to load settings:', error);
            return null;
        }
    }
    
    // Export save data (for sharing or backup)
    exportSave() {
        if (!this.currentSave) {
            return null;
        }
        
        try {
            return btoa(JSON.stringify(this.currentSave));
        } catch (error) {
            console.error('SaveSystem: Failed to export save:', error);
            return null;
        }
    }
    
    // Import save data
    importSave(encodedData) {
        try {
            const saveData = JSON.parse(atob(encodedData));
            
            // Validate save data structure
            if (this.validateSaveData(saveData)) {
                this.currentSave = saveData;
                return this.saveGame(saveData);
            } else {
                console.error('SaveSystem: Invalid save data format');
                return false;
            }
        } catch (error) {
            console.error('SaveSystem: Failed to import save:', error);
            return false;
        }
    }
    
    // Validate save data structure
    validateSaveData(data) {
        const requiredFields = ['version', 'timestamp', 'playerData', 'levelData', 'gameStats'];
        return requiredFields.every(field => data.hasOwnProperty(field));
    }
    
    // Get save info for display
    getSaveInfo() {
        if (!this.currentSave) {
            return null;
        }
        
        return {
            timestamp: this.currentSave.timestamp,
            level: this.currentSave.levelData.currentLevel,
            gemsCollected: this.currentSave.playerData.gemsCollected,
            playTime: this.currentSave.levelData.totalPlayTime,
            completedLevels: this.currentSave.levelData.completedLevels.length
        };
    }
    
    // Auto-save functionality
    enableAutoSave(interval = 30000) { // 30 seconds default
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (this.currentSave) {
                this.saveGame(this.currentSave);
                console.log('SaveSystem: Auto-save completed');
            }
        }, interval);
    }
    
    disableAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    // Cleanup
    destroy() {
        this.disableAutoSave();
    }
}

// Global save system instance
window.SaveSystem = SaveSystem;