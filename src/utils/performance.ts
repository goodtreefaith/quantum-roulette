import type { GameSettings } from '../options';

interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  memoryUsed: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  particleCount: number;
  marbleCount: number;
}

type SuggestedSettings = Pick<
  GameSettings,
  'performanceMode' | 'particleCount' | 'enableAnimations'
> | null;

type PerformanceWithMemory = Performance & {
  memory?: {
    usedJSHeapSize: number;
  };
};

export class PerformanceMonitor {
  private lastTime = performance.now();
  private frameCount = 0;
  private fpsHistory: number[] = [];
  private readonly maxFpsHistoryLength = 60;
  private readonly performanceMetrics: PerformanceMetrics = {
    fps: 0,
    averageFps: 0,
    memoryUsed: 0,
    frameTime: 0,
    renderTime: 0,
    updateTime: 0,
    particleCount: 0,
    marbleCount: 0,
  };

  private fpsDisplay?: HTMLElement;
  private detailedDisplay?: HTMLElement;

  constructor() {
    this.createDisplayElements();
  }

  private createDisplayElements(): void {
    this.fpsDisplay = document.createElement('div');
    this.fpsDisplay.id = 'fps-counter';
    this.fpsDisplay.style.cssText = `
      position: fixed;
      top: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.8);
      color: #00ffff;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-family: 'Orbitron', monospace;
      font-size: 0.9rem;
      font-weight: 600;
      border: 1px solid rgba(0, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: none;
      min-width: 80px;
      text-align: center;
    `;
    document.body.appendChild(this.fpsDisplay);

    this.detailedDisplay = document.createElement('div');
    this.detailedDisplay.id = 'performance-details';
    this.detailedDisplay.style.cssText = `
      position: fixed;
      top: 4rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.9);
      color: #ffffff;
      padding: 1rem;
      border-radius: 15px;
      font-family: 'Exo 2', sans-serif;
      font-size: 0.8rem;
      border: 1px solid rgba(0, 255, 255, 0.3);
      backdrop-filter: blur(15px);
      z-index: 1000;
      display: none;
      min-width: 200px;
      max-width: 250px;
    `;
    document.body.appendChild(this.detailedDisplay);
  }

  public startFrame(): number {
    return performance.now();
  }

  public endFrame(
    frameStartTime: number,
    renderStartTime?: number,
    updateStartTime?: number,
  ): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;
    this.performanceMetrics.frameTime = currentTime - frameStartTime;

    if (renderStartTime !== undefined) {
      this.performanceMetrics.renderTime = currentTime - renderStartTime;
    }

    if (updateStartTime !== undefined && renderStartTime !== undefined) {
      this.performanceMetrics.updateTime = renderStartTime - updateStartTime;
    }

    if (deltaTime >= 1000) {
      this.performanceMetrics.fps = this.frameCount;
      this.fpsHistory.push(this.performanceMetrics.fps);

      if (this.fpsHistory.length > this.maxFpsHistoryLength) {
        this.fpsHistory.shift();
      }

      this.performanceMetrics.averageFps =
        this.fpsHistory.reduce((sum, value) => sum + value, 0) /
        this.fpsHistory.length;

      this.frameCount = 0;
      this.lastTime = currentTime;

      this.updateMemoryUsage();
      this.updateDisplays();
    }
  }

  private updateMemoryUsage(): void {
    const perf = performance as PerformanceWithMemory;
    if (perf.memory) {
      this.performanceMetrics.memoryUsed =
        perf.memory.usedJSHeapSize / (1024 * 1024);
    }
  }

  public updateCounts(particles: number, marbles: number): void {
    this.performanceMetrics.particleCount = particles;
    this.performanceMetrics.marbleCount = marbles;
  }

  private updateDisplays(): void {
    if (this.fpsDisplay && this.fpsDisplay.style.display !== 'none') {
      const fpsColor = this.getFpsColor(this.performanceMetrics.fps);
      this.fpsDisplay.innerHTML = `<div style="color: ${fpsColor};">${Math.round(
        this.performanceMetrics.fps,
      )} FPS</div>`;
    }

    if (this.detailedDisplay && this.detailedDisplay.style.display !== 'none') {
      this.detailedDisplay.innerHTML = `
        <div style="color: #00ffff; font-weight: 600; margin-bottom: 0.5rem;">
          QUANTUM PERFORMANCE
        </div>
        <div>FPS: <span style="color: ${this.getFpsColor(this.performanceMetrics.fps)}">${Math.round(this.performanceMetrics.fps)}</span></div>
        <div>Avg FPS: <span style="color: #00ff80">${Math.round(this.performanceMetrics.averageFps)}</span></div>
        <div>Frame Time: <span style="color: #ffaa00">${this.performanceMetrics.frameTime.toFixed(2)}ms</span></div>
        <div>Render: <span style="color: #ff80ff">${this.performanceMetrics.renderTime.toFixed(2)}ms</span></div>
        <div>Update: <span style="color: #80ff80">${this.performanceMetrics.updateTime.toFixed(2)}ms</span></div>
        ${this.performanceMetrics.memoryUsed > 0 ? `<div>Memory: <span style="color: #ff8080">${this.performanceMetrics.memoryUsed.toFixed(1)}MB</span></div>` : ''}
        <div>Particles: <span style="color: #8080ff">${this.performanceMetrics.particleCount}</span></div>
        <div>Marbles: <span style="color: #ffff80">${this.performanceMetrics.marbleCount}</span></div>
        <div style="margin-top: 0.5rem; font-size: 0.7rem; color: #b0b0b0;">
          ${this.getPerformanceAdvice()}
        </div>
      `;
    }
  }

  private getFpsColor(fps: number): string {
    if (fps >= 60) return '#00ff80';
    if (fps >= 30) return '#ffaa00';
    return '#ff4444';
  }

  private getPerformanceAdvice(): string {
    const { averageFps, particleCount } = this.performanceMetrics;

    if (averageFps < 30) {
      return 'Low FPS: try ECO mode';
    }
    if (averageFps < 45) {
      return 'Reduce particle count for smoother gameplay';
    }
    if (averageFps > 90 && particleCount < 1000) {
      return 'Performance is strong: ULTRA particles should be safe';
    }
    if (averageFps > 60) {
      return 'Performance looks healthy';
    }

    return '';
  }

  public showFPS(show: boolean): void {
    if (this.fpsDisplay) {
      this.fpsDisplay.style.display = show ? 'block' : 'none';
    }
  }

  public showDetailed(show: boolean): void {
    if (this.detailedDisplay) {
      this.detailedDisplay.style.display = show ? 'block' : 'none';
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  public getSuggestedSettings(): SuggestedSettings {
    const { averageFps } = this.performanceMetrics;

    if (averageFps < 30) {
      return {
        performanceMode: 'eco',
        particleCount: 'low',
        enableAnimations: false,
      };
    }

    if (averageFps < 45) {
      return {
        performanceMode: 'balanced',
        particleCount: 'medium',
        enableAnimations: true,
      };
    }

    if (averageFps > 90) {
      return {
        performanceMode: 'high',
        particleCount: 'ultra',
        enableAnimations: true,
      };
    }

    return null;
  }
}

export const PerformanceUtils = {
  throttle<TArgs extends unknown[]>(
    func: (...args: TArgs) => void,
    limit: number,
  ): (...args: TArgs) => void {
    let inThrottle = false;
    return (...args: TArgs) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  },

  debounce<TArgs extends unknown[]>(
    func: (...args: TArgs) => void,
    delay: number,
  ): (...args: TArgs) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    return (...args: TArgs) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  getPixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, 2);
  },

  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  },

  getOptimalUpdateInterval(): number {
    return this.isMobileDevice() ? 20 : 16;
  },

  createObjectPool<T>(
    factory: () => T,
    reset: (obj: T) => void,
    size = 100,
  ) {
    const pool: T[] = [];
    const active = new Set<T>();

    return {
      get(): T {
        const obj = pool.pop() ?? factory();
        active.add(obj);
        return obj;
      },

      release(obj: T): void {
        if (active.has(obj)) {
          active.delete(obj);
          reset(obj);
          if (pool.length < size) {
            pool.push(obj);
          }
        }
      },

      clear(): void {
        pool.length = 0;
        active.clear();
      },

      size(): number {
        return active.size;
      },
    };
  },
};
