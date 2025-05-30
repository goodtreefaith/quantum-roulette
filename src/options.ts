interface GameSettings {
  useSkills: boolean;
  winningRank: number;
  autoRecording: boolean;
  // Quality of life improvements
  performanceMode: 'high' | 'balanced' | 'eco';
  particleCount: 'low' | 'medium' | 'high' | 'ultra';
  enableSoundEffects: boolean;
  enableHapticFeedback: boolean;
  autoSaveResults: boolean;
  showFPS: boolean;
  enableAnimations: boolean;
  cameraSmoothing: number; // 0-1 scale
  zoomSensitivity: number; // 0-2 scale
  // Winner management
  autoRemoveWinner: boolean;
  showWinnerModal: boolean;
  // UI preferences
  theme: 'quantum' | 'classic' | 'neon' | 'minimal';
  transparency: number; // 0-1 scale
  glowIntensity: number; // 0-2 scale
  showAdvancedStats: boolean;
}

class Options implements GameSettings {
  useSkills: boolean = true;
  winningRank: number = 0;
  autoRecording: boolean = false; // Default to false for better performance
  
  // Performance settings
  performanceMode: 'high' | 'balanced' | 'eco' = 'balanced';
  particleCount: 'low' | 'medium' | 'high' | 'ultra' = 'high';
  enableSoundEffects: boolean = true;
  enableHapticFeedback: boolean = true;
  autoSaveResults: boolean = true;
  showFPS: boolean = false;
  enableAnimations: boolean = true;
  cameraSmoothing: number = 0.8;
  zoomSensitivity: number = 1.0;
  
  // Winner management
  autoRemoveWinner: boolean = false;
  showWinnerModal: boolean = true;
  
  // UI preferences
  theme: 'quantum' | 'classic' | 'neon' | 'minimal' = 'quantum';
  transparency: number = 0.9;
  glowIntensity: number = 1.0;
  showAdvancedStats: boolean = false;

  // Load settings from localStorage
  loadSettings(): void {
    const saved = localStorage.getItem('quantum_roulette_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        Object.assign(this, settings);
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }
    }
  }

  // Save settings to localStorage
  saveSettings(): void {
    try {
      const settings: GameSettings = {
        useSkills: this.useSkills,
        winningRank: this.winningRank,
        autoRecording: this.autoRecording,
        performanceMode: this.performanceMode,
        particleCount: this.particleCount,
        enableSoundEffects: this.enableSoundEffects,
        enableHapticFeedback: this.enableHapticFeedback,
        autoSaveResults: this.autoSaveResults,
        showFPS: this.showFPS,
        enableAnimations: this.enableAnimations,
        cameraSmoothing: this.cameraSmoothing,
        zoomSensitivity: this.zoomSensitivity,
        theme: this.theme,
        transparency: this.transparency,
        glowIntensity: this.glowIntensity,
        showAdvancedStats: this.showAdvancedStats,
        autoRemoveWinner: this.autoRemoveWinner,
        showWinnerModal: this.showWinnerModal,
      };
      localStorage.setItem('quantum_roulette_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  // Performance optimization getters
  get particleMultiplier(): number {
    switch (this.particleCount) {
      case 'low': return 0.25;
      case 'medium': return 0.5;
      case 'high': return 1.0;
      case 'ultra': return 2.0;
      default: return 1.0;
    }
  }

  get updateInterval(): number {
    switch (this.performanceMode) {
      case 'eco': return 20; // 50 FPS
      case 'balanced': return 16; // 60 FPS
      case 'high': return 8; // 120 FPS
      default: return 16;
    }
  }

  get renderQuality(): number {
    switch (this.performanceMode) {
      case 'eco': return 0.5;
      case 'balanced': return 0.8;
      case 'high': return 1.0;
      default: return 0.8;
    }
  }
}

const options = new Options();

// Load settings on initialization
options.loadSettings();

// Auto-save settings when they change
const originalSaveSettings = options.saveSettings.bind(options);
const autoSave = () => {
  originalSaveSettings();
};

// Create a proxy to auto-save when properties change
const handler: ProxyHandler<Options> = {
  set(target, property, value) {
    (target as any)[property] = value;
    setTimeout(autoSave, 100); // Debounce saves
    return true;
  }
};

export default new Proxy(options, handler);
