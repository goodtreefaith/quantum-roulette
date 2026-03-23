// Global Window Interface Extensions
import type { Roulette } from '../roulette';
import type { OptionsStore } from '../options';
import type { PerformanceMonitor } from '../utils/performance';
import type { AnimationUtils } from '../utils/animations';
import type { translateElement } from '../localization';

declare global {
  interface Window {
    roulette: Roulette;
    options: OptionsStore;
    performanceMonitor: PerformanceMonitor;
    animations: typeof AnimationUtils;
    translateElement: typeof translateElement;
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export {};
