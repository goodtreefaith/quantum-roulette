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

export class PerformanceMonitor {
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private maxFpsHistoryLength: number = 60;
  private performanceMetrics: PerformanceMetrics = {
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
    // FPS Counter
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

    // Detailed Performance Display
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

  public endFrame(startTime: number, renderStartTime?: number, updateStartTime?: number): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= 1000) { // Update every second
      this.performanceMetrics.fps = this.frameCount;
      this.fpsHistory.push(this.performanceMetrics.fps);
      
      if (this.fpsHistory.length > this.maxFpsHistoryLength) {
        this.fpsHistory.shift();
      }
      
      this.performanceMetrics.averageFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      this.performanceMetrics.frameTime = deltaTime / this.frameCount;
      
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      this.updateMemoryUsage();
      this.updateDisplays();
    }
    
    this.frameCount++;
    
    if (renderStartTime) {
      this.performanceMetrics.renderTime = currentTime - renderStartTime;
    }
    
    if (updateStartTime) {
      this.performanceMetrics.updateTime = currentTime - updateStartTime;
    }
  }

  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.performanceMetrics.memoryUsed = memory.usedJSHeapSize / (1024 * 1024); // MB
    }
  }

  public updateCounts(particles: number, marbles: number): void {
    this.performanceMetrics.particleCount = particles;
    this.performanceMetrics.marbleCount = marbles;
  }

  private updateDisplays(): void {
    if (this.fpsDisplay && this.fpsDisplay.style.display !== 'none') {
      const fpsColor = this.getFpsColor(this.performanceMetrics.fps);
      this.fpsDisplay.innerHTML = `
        <div style="color: ${fpsColor};">
          ${Math.round(this.performanceMetrics.fps)} FPS
        </div>
      `;
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
    if (fps >= 60) return '#00ff80'; // Green
    if (fps >= 30) return '#ffaa00'; // Orange
    return '#ff4444'; // Red
  }

  private getPerformanceAdvice(): string {
    const { fps, averageFps, particleCount } = this.performanceMetrics;
    
    if (averageFps < 30) {
      return '⚠️ Low FPS: Try ECO mode';
    } else if (averageFps < 45) {
      return '💡 Reduce particle count for better performance';
    } else if (averageFps > 90 && particleCount < 1000) {
      return '✨ Performance good: Try ULTRA particles';
    } else if (averageFps > 60) {
      return '✅ Performance optimal';
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

  public getSuggestedSettings(): any {
    const { averageFps } = this.performanceMetrics;
    
    if (averageFps < 30) {
      return {
        performanceMode: 'eco',
        particleCount: 'low',
        enableAnimations: false,
      };
    } else if (averageFps < 45) {
      return {
        performanceMode: 'balanced',
        particleCount: 'medium',
        enableAnimations: true,
      };
    } else if (averageFps > 90) {
      return {
        performanceMode: 'high',
        particleCount: 'ultra',
        enableAnimations: true,
      };
    }
    
    return null; // Current settings are fine
  }
}

// Utility functions for performance optimization
export const PerformanceUtils = {
  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce function calls
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return function(this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  // Check if device prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get device pixel ratio for optimal rendering
  getPixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
  },

  // Check if device is mobile
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Get optimal update interval based on device
  getOptimalUpdateInterval(): number {
    if (this.isMobileDevice()) {
      return 20; // 50 FPS on mobile
    }
    return 16; // 60 FPS on desktop
  },

  // Simple object pool for performance
  createObjectPool<T>(factory: () => T, reset: (obj: T) => void, size: number = 100) {
    const pool: T[] = [];
    const active: Set<T> = new Set();

    return {
      get(): T {
        let obj = pool.pop();
        if (!obj) {
          obj = factory();
        }
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
      }
    };
  }
}; 