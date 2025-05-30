import './localization';
import { Roulette } from './roulette';
import options from './options';
import { PerformanceMonitor } from './utils/performance';
import { animationManager, AnimationUtils } from './utils/animations';

const roulette = new Roulette();
const performanceMonitor = new PerformanceMonitor();

// Initialize performance monitoring
performanceMonitor.showFPS(options.showFPS);
performanceMonitor.showDetailed(options.showAdvancedStats);

// Global instances for browser console access
// eslint-disable-next-line
(window as any).roullete = roulette;
// eslint-disable-next-line
(window as any).options = options;
// eslint-disable-next-line
(window as any).performance = performanceMonitor;
// eslint-disable-next-line
(window as any).animations = AnimationUtils;

// Initialize quantum effects when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Apply entrance animations to UI elements
  const settings = document.querySelector('#settings');
  if (settings) {
    AnimationUtils.slideInFromBottom(settings as HTMLElement);
  }

  // Add floating animation to the title
  const title = document.querySelector('.settings-title');
  if (title) {
    animationManager.float(title as HTMLElement, 5, 4000);
  }

  // Performance monitoring integration
  const updatePerformanceSettings = () => {
    performanceMonitor.showFPS(options.showFPS);
    performanceMonitor.showDetailed(options.showAdvancedStats);
  };

  // Watch for options changes
  const originalOptionsHandler = options.saveSettings;
  options.saveSettings = function() {
    originalOptionsHandler.call(this);
    updatePerformanceSettings();
  };

  console.log('🚀 Quantum Roulette initialized with enhanced performance monitoring');
  console.log('💡 Available console commands:');
  console.log('   window.options - Game settings');
  console.log('   window.performance - Performance metrics');
  console.log('   window.animations - Animation utilities');
  console.log('   window.roullete - Main game instance');
});
