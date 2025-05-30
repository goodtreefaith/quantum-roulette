interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
  direction?: string;
  fillMode?: string;
}

interface ParticleConfig {
  count: number;
  color: string;
  size: number;
  speed: number;
  lifetime: number;
  spread: number;
}

export class AnimationManager {
  private activeAnimations: Set<Animation> = new Set();
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private particles: Particle[] = [];

  constructor() {
    this.createParticleCanvas();
    this.startParticleSystem();
  }

  private createParticleCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') || undefined;
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  // Smooth element animations
  public animateElement(
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    config: AnimationConfig
  ): Promise<void> {
    return new Promise((resolve) => {
      const animation = element.animate(keyframes, {
        duration: config.duration,
        easing: config.easing,
        delay: config.delay || 0,
        iterations: config.iterations || 1,
        direction: config.direction as PlaybackDirection || 'normal',
        fill: config.fillMode as FillMode || 'both',
      });

      this.activeAnimations.add(animation);
      
      animation.addEventListener('finish', () => {
        this.activeAnimations.delete(animation);
        resolve();
      });
    });
  }

  // Fade in animation
  public fadeIn(element: HTMLElement, duration: number = 500): Promise<void> {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    return this.animateElement(element, [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
  }

  // Fade out animation
  public fadeOut(element: HTMLElement, duration: number = 500): Promise<void> {
    return this.animateElement(element, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-20px)' }
    ], {
      duration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).then(() => {
      element.style.display = 'none';
    });
  }

  // Slide in from direction
  public slideIn(
    element: HTMLElement, 
    direction: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
    duration: number = 600
  ): Promise<void> {
    const transforms = {
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
      left: 'translateX(-100%)',
      right: 'translateX(100%)'
    };

    element.style.transform = transforms[direction];
    element.style.display = 'block';

    return this.animateElement(element, [
      { transform: transforms[direction], opacity: 0 },
      { transform: 'translate(0, 0)', opacity: 1 }
    ], {
      duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  }

  // Pulse animation
  public pulse(element: HTMLElement, intensity: number = 1.1, duration: number = 1000): Promise<void> {
    return this.animateElement(element, [
      { transform: 'scale(1)' },
      { transform: `scale(${intensity})` },
      { transform: 'scale(1)' }
    ], {
      duration,
      easing: 'ease-in-out'
    });
  }

  // Glow effect
  public glow(element: HTMLElement, color: string = '#00ffff', duration: number = 2000): Promise<void> {
    return this.animateElement(element, [
      { boxShadow: `0 0 5px ${color}` },
      { boxShadow: `0 0 20px ${color}, 0 0 30px ${color}` },
      { boxShadow: `0 0 5px ${color}` }
    ], {
      duration,
      easing: 'ease-in-out'
    });
  }

  // Shake animation
  public shake(element: HTMLElement, intensity: number = 10, duration: number = 500): Promise<void> {
    const keyframes: Keyframe[] = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const offset = Math.sin(progress * Math.PI * 4) * intensity * (1 - progress);
      keyframes.push({ transform: `translateX(${offset}px)` });
    }

    return this.animateElement(element, keyframes, {
      duration,
      easing: 'ease-out'
    });
  }

  // Particle burst effect
  public createParticleBurst(x: number, y: number, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 20,
      color: '#00ffff',
      size: 3,
      speed: 100,
      lifetime: 1000,
      spread: Math.PI * 2,
      ...config
    };

    for (let i = 0; i < defaultConfig.count; i++) {
      const angle = (defaultConfig.spread / defaultConfig.count) * i;
      const velocity = {
        x: Math.cos(angle) * defaultConfig.speed,
        y: Math.sin(angle) * defaultConfig.speed
      };

      this.particles.push(new Particle(x, y, velocity, defaultConfig));
    }
  }

  // Button click effect
  public buttonClickEffect(button: HTMLElement): Promise<void> {
    // Create ripple effect
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(0, 255, 255, 0.6);
      transform: scale(0);
      left: 50%;
      top: 50%;
      width: ${size}px;
      height: ${size}px;
      margin-left: ${-size / 2}px;
      margin-top: ${-size / 2}px;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    return this.animateElement(ripple, [
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(2)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).then(() => {
      ripple.remove();
    });
  }

  // Floating elements animation
  public float(element: HTMLElement, amplitude: number = 10, duration: number = 3000): void {
    this.animateElement(element, [
      { transform: 'translateY(0px)' },
      { transform: `translateY(${-amplitude}px)` },
      { transform: 'translateY(0px)' }
    ], {
      duration,
      easing: 'ease-in-out',
      iterations: Infinity
    });
  }

  // Matrix-style digital rain effect
  public createDigitalRain(): void {
    if (!this.ctx || !this.canvas) return;

    const fontSize = 14;
    const columns = Math.floor(this.canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';

    const animate = () => {
      if (!this.ctx || !this.canvas) return;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#00ffff';
      this.ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        this.ctx.fillText(text, x, y);

        if (y > this.canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  private startParticleSystem(): void {
    const animate = () => {
      this.updateParticles();
      this.renderParticles();
      requestAnimationFrame(animate);
    };
    animate();
  }

  private updateParticles(): void {
    this.particles = this.particles.filter(particle => {
      particle.update();
      return particle.isAlive();
    });
  }

  private renderParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      particle.render(this.ctx!);
    });
  }

  // Stop all animations
  public stopAllAnimations(): void {
    this.activeAnimations.forEach(animation => {
      animation.cancel();
    });
    this.activeAnimations.clear();
    this.particles = [];
  }

  // Cleanup
  public destroy(): void {
    this.stopAllAnimations();
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}

class Particle {
  private x: number;
  private y: number;
  private velocity: { x: number; y: number };
  private config: ParticleConfig;
  private life: number;
  private maxLife: number;

  constructor(x: number, y: number, velocity: { x: number; y: number }, config: ParticleConfig) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.config = config;
    this.life = config.lifetime;
    this.maxLife = config.lifetime;
  }

  update(): void {
    this.x += this.velocity.x * 0.016; // Assuming 60fps
    this.y += this.velocity.y * 0.016;
    this.velocity.y += 98 * 0.016; // Gravity
    this.life -= 16; // Decrease life
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.config.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isAlive(): boolean {
    return this.life > 0;
  }
}

// Global animation manager instance
export const animationManager = new AnimationManager();

// Utility functions for common animations
export const AnimationUtils = {
  // Entrance animations
  slideInFromBottom: (element: HTMLElement) => animationManager.slideIn(element, 'bottom'),
  slideInFromTop: (element: HTMLElement) => animationManager.slideIn(element, 'top'),
  slideInFromLeft: (element: HTMLElement) => animationManager.slideIn(element, 'left'),
  slideInFromRight: (element: HTMLElement) => animationManager.slideIn(element, 'right'),
  
  // Attention animations
  pulse: (element: HTMLElement) => animationManager.pulse(element),
  shake: (element: HTMLElement) => animationManager.shake(element),
  glow: (element: HTMLElement, color?: string) => animationManager.glow(element, color),
  
  // Interactive animations
  buttonClick: (button: HTMLElement) => animationManager.buttonClickEffect(button),
  
  // Particle effects
  success: (x: number, y: number) => animationManager.createParticleBurst(x, y, {
    color: '#00ff80',
    count: 30,
    speed: 150
  }),
  error: (x: number, y: number) => animationManager.createParticleBurst(x, y, {
    color: '#ff4444',
    count: 20,
    speed: 100
  }),
  magic: (x: number, y: number) => animationManager.createParticleBurst(x, y, {
    color: '#ff0080',
    count: 50,
    speed: 200,
    size: 2
  })
}; 