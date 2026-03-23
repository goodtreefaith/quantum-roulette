import { Particle } from './particle';

export class ParticleManager {
  private _particles: Particle[] = [];
  private _densityMultiplier = 1;

  get count() {
    return this._particles.length;
  }

  setDensityMultiplier(multiplier: number) {
    this._densityMultiplier = Math.max(0.25, multiplier);
  }

  update(deltaTime: number) {
    this._particles.forEach((particle) => {
      particle.update(deltaTime);
    });
    this._particles = this._particles.filter((particle) => !particle.isDestroy);
  }

  render(ctx: CanvasRenderingContext2D) {
    this._particles.forEach((particle) => particle.render(ctx));
  }

  shot(x: number, y: number) {
    const particleCount = Math.max(25, Math.round(200 * this._densityMultiplier));
    for (let i = 0; i < particleCount; i++) {
      this._particles.push(new Particle(x, y));
    }
  }
}
