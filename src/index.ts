import './styles/main.scss';
import './localization';
import { Roulette } from './roulette';
import options from './options';
import { PerformanceMonitor } from './utils/performance';
import { animationManager, AnimationUtils } from './utils/animations';
import { initAppUI } from './ui';

const roulette = new Roulette();
const performanceMonitor = new PerformanceMonitor();

roulette.setPerformanceMonitor(performanceMonitor);

window.roulette = roulette;
window.options = options;
window.performanceMonitor = performanceMonitor;
window.animations = AnimationUtils;

document.addEventListener('DOMContentLoaded', () => {
  void initAppUI(roulette, performanceMonitor);

  const settings = document.querySelector<HTMLElement>('#settings');
  if (settings && options.enableAnimations) {
    AnimationUtils.slideInFromBottom(settings);
  }

  const title = document.querySelector<HTMLElement>('.settings-title');
  if (title && options.enableAnimations) {
    animationManager.float(title, 5, 4000);
  }
});
