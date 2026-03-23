import { PerformanceUtils } from './utils/performance';

export interface GameSettings {
  useSkills: boolean;
  winningRank: number;
  autoRecording: boolean;
  performanceMode: 'high' | 'balanced' | 'eco';
  particleCount: 'low' | 'medium' | 'high' | 'ultra';
  enableSoundEffects: boolean;
  enableHapticFeedback: boolean;
  autoSaveResults: boolean;
  showFPS: boolean;
  enableAnimations: boolean;
  cameraSmoothing: number;
  zoomSensitivity: number;
  autoRemoveWinner: boolean;
  showWinnerModal: boolean;
  theme: 'quantum' | 'classic' | 'neon' | 'minimal';
  transparency: number;
  glowIntensity: number;
  showAdvancedStats: boolean;
}

type SettingKey = keyof GameSettings;

const STORAGE_KEY = 'quantum_roulette_settings';
const performanceModes = ['high', 'balanced', 'eco'] as const;
const particleCounts = ['low', 'medium', 'high', 'ultra'] as const;
const themes = ['quantum', 'classic', 'neon', 'minimal'] as const;

export const DEFAULT_SETTINGS: Readonly<GameSettings> = {
  useSkills: true,
  winningRank: 0,
  autoRecording: false,
  performanceMode: 'balanced',
  particleCount: 'high',
  enableSoundEffects: true,
  enableHapticFeedback: true,
  autoSaveResults: true,
  showFPS: false,
  enableAnimations: true,
  cameraSmoothing: 0.8,
  zoomSensitivity: 1.0,
  autoRemoveWinner: false,
  showWinnerModal: true,
  theme: 'quantum',
  transparency: 0.9,
  glowIntensity: 1.0,
  showAdvancedStats: false,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isSettingKey(value: string): value is SettingKey {
  return value in DEFAULT_SETTINGS;
}

function sanitizeEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

function sanitizeNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, min, max)
    : fallback;
}

function getDefaultSettings(): GameSettings {
  return {
    ...DEFAULT_SETTINGS,
    enableAnimations: PerformanceUtils.prefersReducedMotion()
      ? false
      : DEFAULT_SETTINGS.enableAnimations,
  };
}

function sanitizeSettings(values: Partial<GameSettings>): GameSettings {
  const defaults = getDefaultSettings();

  return {
    useSkills: typeof values.useSkills === 'boolean' ? values.useSkills : defaults.useSkills,
    winningRank: Math.max(
      0,
      Math.floor(
        typeof values.winningRank === 'number' && Number.isFinite(values.winningRank)
          ? values.winningRank
          : defaults.winningRank,
      ),
    ),
    autoRecording:
      typeof values.autoRecording === 'boolean'
        ? values.autoRecording
        : defaults.autoRecording,
    performanceMode: sanitizeEnum(
      values.performanceMode,
      performanceModes,
      defaults.performanceMode,
    ),
    particleCount: sanitizeEnum(
      values.particleCount,
      particleCounts,
      defaults.particleCount,
    ),
    enableSoundEffects:
      typeof values.enableSoundEffects === 'boolean'
        ? values.enableSoundEffects
        : defaults.enableSoundEffects,
    enableHapticFeedback:
      typeof values.enableHapticFeedback === 'boolean'
        ? values.enableHapticFeedback
        : defaults.enableHapticFeedback,
    autoSaveResults:
      typeof values.autoSaveResults === 'boolean'
        ? values.autoSaveResults
        : defaults.autoSaveResults,
    showFPS: typeof values.showFPS === 'boolean' ? values.showFPS : defaults.showFPS,
    enableAnimations:
      typeof values.enableAnimations === 'boolean'
        ? values.enableAnimations
        : defaults.enableAnimations,
    cameraSmoothing: sanitizeNumber(
      values.cameraSmoothing,
      defaults.cameraSmoothing,
      0,
      1,
    ),
    zoomSensitivity: sanitizeNumber(
      values.zoomSensitivity,
      defaults.zoomSensitivity,
      0.5,
      2,
    ),
    autoRemoveWinner:
      typeof values.autoRemoveWinner === 'boolean'
        ? values.autoRemoveWinner
        : defaults.autoRemoveWinner,
    showWinnerModal:
      typeof values.showWinnerModal === 'boolean'
        ? values.showWinnerModal
        : defaults.showWinnerModal,
    theme: sanitizeEnum(values.theme, themes, defaults.theme),
    transparency: sanitizeNumber(values.transparency, defaults.transparency, 0.3, 1),
    glowIntensity: sanitizeNumber(values.glowIntensity, defaults.glowIntensity, 0, 2),
    showAdvancedStats:
      typeof values.showAdvancedStats === 'boolean'
        ? values.showAdvancedStats
        : defaults.showAdvancedStats,
  };
}

export class Options implements GameSettings {
  useSkills = DEFAULT_SETTINGS.useSkills;
  winningRank = DEFAULT_SETTINGS.winningRank;
  autoRecording = DEFAULT_SETTINGS.autoRecording;
  performanceMode = DEFAULT_SETTINGS.performanceMode;
  particleCount = DEFAULT_SETTINGS.particleCount;
  enableSoundEffects = DEFAULT_SETTINGS.enableSoundEffects;
  enableHapticFeedback = DEFAULT_SETTINGS.enableHapticFeedback;
  autoSaveResults = DEFAULT_SETTINGS.autoSaveResults;
  showFPS = DEFAULT_SETTINGS.showFPS;
  enableAnimations = DEFAULT_SETTINGS.enableAnimations;
  cameraSmoothing = DEFAULT_SETTINGS.cameraSmoothing;
  zoomSensitivity = DEFAULT_SETTINGS.zoomSensitivity;
  autoRemoveWinner = DEFAULT_SETTINGS.autoRemoveWinner;
  showWinnerModal = DEFAULT_SETTINGS.showWinnerModal;
  theme = DEFAULT_SETTINGS.theme;
  transparency = DEFAULT_SETTINGS.transparency;
  glowIntensity = DEFAULT_SETTINGS.glowIntensity;
  showAdvancedStats = DEFAULT_SETTINGS.showAdvancedStats;

  private applySanitizedSettings(settings: GameSettings): void {
    Object.assign(this, settings);
  }

  public snapshot(): GameSettings {
    return {
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
      autoRemoveWinner: this.autoRemoveWinner,
      showWinnerModal: this.showWinnerModal,
      theme: this.theme,
      transparency: this.transparency,
      glowIntensity: this.glowIntensity,
      showAdvancedStats: this.showAdvancedStats,
    };
  }

  public loadSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        this.resetToDefaults();
        return;
      }

      const parsed = JSON.parse(saved);
      if (!isObject(parsed)) {
        this.resetToDefaults();
        return;
      }

      this.applySanitizedSettings(sanitizeSettings(parsed as Partial<GameSettings>));
    } catch (error) {
      console.warn('Failed to load saved settings:', error);
      this.resetToDefaults();
    }
  }

  public saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot()));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Cannot save settings.');
      } else {
        console.error('Failed to save settings:', error);
      }
    }
  }

  public resetToDefaults(): void {
    this.applySanitizedSettings(getDefaultSettings());
  }

  public get particleMultiplier(): number {
    switch (this.particleCount) {
      case 'low':
        return 0.25;
      case 'medium':
        return 0.5;
      case 'high':
        return 1.0;
      case 'ultra':
        return 2.0;
      default:
        return 1.0;
    }
  }

  public get updateInterval(): number {
    switch (this.performanceMode) {
      case 'eco':
        return 20;
      case 'balanced':
        return 16;
      case 'high':
        return 8;
      default:
        return 16;
    }
  }

  public get renderQuality(): number {
    switch (this.performanceMode) {
      case 'eco':
        return 0.5;
      case 'balanced':
        return 0.8;
      case 'high':
        return 1.0;
      default:
        return 0.8;
    }
  }

  public applyPartial(values: Partial<GameSettings>): void {
    this.applySanitizedSettings(sanitizeSettings({ ...this.snapshot(), ...values }));
  }
}

let saveTimer: number | undefined;
const options = new Options();
options.loadSettings();

const handler: ProxyHandler<Options> = {
  set(target, property, value) {
    if (typeof property === 'string' && isSettingKey(property)) {
      target.applyPartial({ [property]: value } as Partial<GameSettings>);

      if (saveTimer) {
        clearTimeout(saveTimer);
      }

      saveTimer = window.setTimeout(() => {
        target.saveSettings();
      }, 100);
      return true;
    }

    if (typeof property === 'string' && property in target) {
      Reflect.set(target, property, value);
      return true;
    }

    return false;
  },
};

const proxiedOptions = new Proxy(options, handler);

export type OptionsStore = Options;
export default proxiedOptions;
